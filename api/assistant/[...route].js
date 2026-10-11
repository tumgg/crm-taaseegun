// Secure OmniSocial Assistant API Handler
// Read-only endpoints for external AI Assistants (e.g., Somying / Claude / GPT)

import {
  verifyAssistantApiKey,
  checkRateLimit,
  handleAssistantCors,
  validatePageId
} from '../lib/auth.js';
import {
  getAllConfiguredPages,
  PAGE_CONFIGS,
  fetchConversationsFromGraph,
  fetchMessagesForConversation
} from '../lib/facebookService.js';
import {
  fetchCrmLeadsFromDb,
  getCrmLeadsLookupMap
} from '../lib/supabaseService.js';
import {
  toBangkokIso,
  getBangkokDateString
} from '../lib/dateUtils.js';

export default async function handler(req, res) {
  // 1. CORS & Security Headers
  const corsOk = handleAssistantCors(req, res);
  if (!corsOk) return;

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Strictly Read-Only (Reject non-GET)
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Assistant API is strictly read-only. Only GET requests are permitted.'
    });
  }

  // 3. Timing-Safe API Key Authentication
  const authResult = verifyAssistantApiKey(req);
  if (!authResult.valid) {
    return res.status(authResult.status || 401).json({
      error: authResult.error || 'Unauthorized',
      message: authResult.message || 'Authentication required'
    });
  }

  // 4. Rate Limiting (60 requests/min)
  const rateLimitResult = checkRateLimit(req);
  res.setHeader('X-RateLimit-Limit', '60');
  res.setHeader('X-RateLimit-Remaining', String(rateLimitResult.remaining));
  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', String(rateLimitResult.retryAfter || 60));
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit of 60 requests per minute exceeded. Please retry later.',
      retry_after_seconds: rateLimitResult.retryAfter
    });
  }

  // 5. Parse Path and Query
  // Normalize path segments whether called directly, via rewrite, or via query.route
  let pathSegments = [];
  if (Array.isArray(req.query.route)) {
    pathSegments = req.query.route.flatMap(s => typeof s === 'string' ? s.split('/') : s).filter(Boolean);
  } else if (typeof req.query.route === 'string') {
    pathSegments = req.query.route.split('/').filter(Boolean);
  } else {
    // Parse from req.url
    const rawPath = req.url.split('?')[0];
    const cleanPath = rawPath.replace(/^\/api\/assistant\/?/, '');
    pathSegments = cleanPath.split('/').filter(Boolean);
  }

  const endpoint = pathSegments[0] || 'health';

  try {
    // -------------------------------------------------------------
    // GET /api/assistant/health
    // -------------------------------------------------------------
    if (endpoint === 'health') {
      const pages = getAllConfiguredPages();
      const connectedCount = pages.filter(p => p.status === 'active').length;

      return res.status(200).json({
        status: 'healthy',
        service: 'OmniSocial Secure Assistant API',
        version: '1.0.0',
        timestamp: toBangkokIso(Date.now()),
        timezone: 'Asia/Bangkok',
        connected_pages_count: connectedCount,
        total_configured_pages: pages.length,
        last_sync_at: toBangkokIso(Date.now()),
        storage: {
          supabase_connected: true,
          facebook_graph_api: 'active'
        }
      });
    }

    // -------------------------------------------------------------
    // GET /api/assistant/pages
    // -------------------------------------------------------------
    if (endpoint === 'pages') {
      const pages = getAllConfiguredPages();
      return res.status(200).json({
        success: true,
        timestamp: toBangkokIso(Date.now()),
        count: pages.length,
        pages
      });
    }

    // -------------------------------------------------------------
    // Helper: Fetch all conversations across configured pages
    // -------------------------------------------------------------
    async function loadAllConversations(targetPageId = null) {
      const pageIds = targetPageId ? [targetPageId] : Object.keys(PAGE_CONFIGS);
      const convPromises = pageIds.map(async (pid) => {
        try {
          return await fetchConversationsFromGraph(pid, { limit: 20 });
        } catch (err) {
          console.warn(`Error loading conversations for page ${pid}:`, err.message);
          return [];
        }
      });

      const results = await Promise.all(convPromises);
      const allConvs = results.flat();

      // Merge with CRM Leads metadata from Supabase
      const crmMap = await getCrmLeadsLookupMap();
      return allConvs.map(conv => {
        const crmLead = crmMap.get(conv.conversation_id) ||
          crmMap.get(`fb-live-${conv.conversation_id}`) ||
          (conv.customer_id ? crmMap.get(conv.customer_id) : null);

        if (crmLead) {
          return {
            ...conv,
            lead_status: crmLead.status || conv.lead_status,
            tags: crmLead.tag ? [crmLead.tag] : (crmLead.tags || conv.tags),
            assigned_admin: crmLead.admin || conv.assigned_admin,
            deal_value: crmLead.deal_value || 0
          };
        }
        return conv;
      });
    }

    // -------------------------------------------------------------
    // GET /api/assistant/inbox-summary
    // -------------------------------------------------------------
    if (endpoint === 'inbox-summary') {
      const { date, page_id } = req.query;

      if (page_id && !validatePageId(page_id)) {
        return res.status(400).json({ error: 'Bad Request', message: `Invalid or unauthorized page_id: ${page_id}` });
      }

      const allConvs = await loadAllConversations(page_id || null);

      // Filter by date if specified (YYYY-MM-DD in Asia/Bangkok)
      let filteredConvs = allConvs;
      if (date) {
        filteredConvs = allConvs.filter(c => {
          if (!c.last_message_at) return false;
          const convDateStr = getBangkokDateString(c.last_message_at);
          return convDateStr === date;
        });
      }

      const totalCustomers = filteredConvs.length;
      let answeredCount = 0;
      let unansweredCount = 0;
      let waitingOver60MinCount = 0;
      let newCustomersCount = 0;

      const byPageMap = {};
      Object.values(PAGE_CONFIGS).forEach(cfg => {
        if (!page_id || page_id === cfg.id) {
          byPageMap[cfg.id] = {
            page_id: cfg.id,
            page_name: cfg.name,
            total: 0,
            answered: 0,
            unanswered: 0,
            waiting_over_60_min: 0
          };
        }
      });

      filteredConvs.forEach(c => {
        if (c.answered) {
          answeredCount++;
        } else {
          unansweredCount++;
          if (c.waiting_minutes >= 60) {
            waitingOver60MinCount++;
          }
        }

        if (c.lead_status === 'ทักใหม่ (New)' || (!c.answered && c.waiting_minutes < 180)) {
          newCustomersCount++;
        }

        if (byPageMap[c.page_id]) {
          byPageMap[c.page_id].total++;
          if (c.answered) byPageMap[c.page_id].answered++;
          else {
            byPageMap[c.page_id].unanswered++;
            if (c.waiting_minutes >= 60) byPageMap[c.page_id].waiting_over_60_min++;
          }
        }
      });

      const conciseSummaries = filteredConvs.map(c => ({
        conversation_id: c.conversation_id,
        page_id: c.page_id,
        page_name: c.page_name,
        customer_name: c.customer_name,
        last_message_preview: c.last_message_preview,
        last_message_at: c.last_message_at,
        answered: c.answered,
        waiting_minutes: c.waiting_minutes,
        lead_status: c.lead_status
      }));

      return res.status(200).json({
        success: true,
        timestamp: toBangkokIso(Date.now()),
        timezone: 'Asia/Bangkok',
        filter: {
          date: date || 'all',
          page_id: page_id || 'all'
        },
        summary: {
          total_customers: totalCustomers,
          new_customers_count: newCustomersCount,
          answered_count: answeredCount,
          unanswered_count: unansweredCount,
          waiting_over_60_min_count: waitingOver60MinCount
        },
        by_page: Object.values(byPageMap),
        conversations: conciseSummaries
      });
    }

    // -------------------------------------------------------------
    // GET /api/assistant/conversations
    // or GET /api/assistant/conversations/:conversationId/messages
    // -------------------------------------------------------------
    if (endpoint === 'conversations') {
      const convId = pathSegments[1];
      const subAction = pathSegments[2];

      // Handle: GET /api/assistant/conversations/:conversationId/messages
      if (convId && subAction === 'messages') {
        const { limit, before, after, page_id } = req.query;

        // Find the pageId for this conversation if not explicitly provided
        let targetPageId = page_id;
        if (!targetPageId) {
          // Look up across pages
          for (const pid of Object.keys(PAGE_CONFIGS)) {
            try {
              const testRes = await fetchMessagesForConversation(convId, pid, { limit: 1 });
              if (testRes.messages && testRes.messages.length > 0) {
                targetPageId = pid;
                break;
              }
            } catch {
              // try next
            }
          }
        }

        if (!targetPageId) {
          targetPageId = Object.keys(PAGE_CONFIGS)[0]; // default fallback
        }

        const msgResult = await fetchMessagesForConversation(convId, targetPageId, {
          limit: limit ? parseInt(limit, 10) : 50,
          before,
          after
        });

        return res.status(200).json({
          success: true,
          conversation_id: convId,
          page_id: targetPageId,
          count: msgResult.messages.length,
          messages: msgResult.messages
        });
      }

      // Handle: GET /api/assistant/conversations
      const { date, status, page_id, updated_since, limit = 20, cursor } = req.query;

      if (page_id && !validatePageId(page_id)) {
        return res.status(400).json({ error: 'Bad Request', message: `Invalid or unauthorized page_id: ${page_id}` });
      }

      let convs = await loadAllConversations(page_id || null);

      // Filter by status (answered | unanswered | all)
      if (status === 'answered') {
        convs = convs.filter(c => c.answered === true);
      } else if (status === 'unanswered') {
        convs = convs.filter(c => c.answered === false);
      }

      // Filter by date
      if (date) {
        convs = convs.filter(c => {
          if (!c.last_message_at) return false;
          return getBangkokDateString(c.last_message_at) === date;
        });
      }

      // Filter by updated_since
      if (updated_since) {
        const sinceTime = new Date(updated_since).getTime();
        convs = convs.filter(c => {
          const t = c.last_message_at ? new Date(c.last_message_at).getTime() : 0;
          return t >= sinceTime;
        });
      }

      // Sort latest first
      convs.sort((a, b) => {
        const tA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const tB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return tB - tA;
      });

      // Pagination
      const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
      const startIndex = cursor ? Math.max(0, parseInt(cursor, 10) || 0) : 0;
      const paginated = convs.slice(startIndex, startIndex + parsedLimit);
      const nextCursor = (startIndex + parsedLimit < convs.length) ? String(startIndex + parsedLimit) : null;

      // Clean response (omit raw_messages)
      const sanitizedList = paginated.map(c => {
        const copy = { ...c };
        delete copy.raw_messages;
        delete copy.older_messages_url;
        return copy;
      });

      return res.status(200).json({
        success: true,
        timestamp: toBangkokIso(Date.now()),
        count: sanitizedList.length,
        total: convs.length,
        next_cursor: nextCursor,
        conversations: sanitizedList
      });
    }

    // -------------------------------------------------------------
    // GET /api/assistant/alerts
    // -------------------------------------------------------------
    if (endpoint === 'alerts') {
      const { waiting_minutes = 60, date, page_id } = req.query;
      const minWaiting = parseInt(waiting_minutes, 10) || 60;

      if (page_id && !validatePageId(page_id)) {
        return res.status(400).json({ error: 'Bad Request', message: `Invalid or unauthorized page_id: ${page_id}` });
      }

      const allConvs = await loadAllConversations(page_id || null);

      const alertRooms = allConvs.filter(c => {
        // Must be unanswered
        if (c.answered) return false;
        // Must exceed waiting_minutes
        if (c.waiting_minutes < minWaiting) return false;
        // Date filter if provided
        if (date) {
          const convDateStr = getBangkokDateString(c.last_message_at);
          if (convDateStr !== date) return false;
        }
        return true;
      });

      // Sort longest waiting first
      alertRooms.sort((a, b) => b.waiting_minutes - a.waiting_minutes);

      const cleanAlerts = alertRooms.map(c => ({
        conversation_id: c.conversation_id,
        page_id: c.page_id,
        page_name: c.page_name,
        customer_name: c.customer_name,
        last_message_preview: c.last_message_preview,
        last_customer_message_at: c.last_customer_message_at,
        waiting_minutes: c.waiting_minutes,
        unread_count: c.unread_count,
        lead_status: c.lead_status,
        assigned_admin: c.assigned_admin
      }));

      return res.status(200).json({
        success: true,
        timestamp: toBangkokIso(Date.now()),
        timezone: 'Asia/Bangkok',
        filter: {
          waiting_minutes_threshold: minWaiting,
          date: date || 'all',
          page_id: page_id || 'all'
        },
        count: cleanAlerts.length,
        alerts: cleanAlerts
      });
    }

    // -------------------------------------------------------------
    // GET /api/assistant/leads
    // -------------------------------------------------------------
    if (endpoint === 'leads') {
      const { status, page_id, updated_since, limit = 20, cursor } = req.query;

      if (page_id && !validatePageId(page_id)) {
        return res.status(400).json({ error: 'Bad Request', message: `Invalid or unauthorized page_id: ${page_id}` });
      }

      // Fetch from Supabase crm_leads
      const dbLeads = await fetchCrmLeadsFromDb({
        status,
        pageId: page_id,
        updatedSince: updated_since,
        limit: parseInt(limit, 10) || 50,
        cursor
      });

      let results = [];
      if (dbLeads.length > 0) {
        results = dbLeads.map(l => ({
          lead_id: String(l.id),
          customer_name: l.name || 'ลูกค้า',
          page_name: l.channel_name || PAGE_CONFIGS[l.channel]?.name || 'เพจ Facebook',
          channel: l.channel || '',
          status: l.status || 'ทักใหม่ (New)',
          tags: l.tag ? [l.tag] : (l.tags || ['ลูกค้า']),
          note: l.notes ? (l.notes.slice(0, 100) + (l.notes.length > 100 ? '...' : '')) : '',
          created_at: toBangkokIso(l.created_at || l.timestamp),
          updated_at: toBangkokIso(l.updated_time || l.last_activity || l.timestamp),
          conversation_id: l.conv_id || l.id
        }));
      } else {
        // Fallback to active conversations formatted as leads
        const convs = await loadAllConversations(page_id || null);
        results = convs.map(c => ({
          lead_id: `lead-${c.conversation_id}`,
          customer_name: c.customer_name,
          page_name: c.page_name,
          channel: c.page_id,
          status: c.lead_status,
          tags: c.tags,
          note: c.last_message_preview ? c.last_message_preview.slice(0, 100) : '',
          created_at: c.last_message_at,
          updated_at: c.last_message_at,
          conversation_id: c.conversation_id
        }));
      }

      const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
      const paged = results.slice(0, parsedLimit);

      return res.status(200).json({
        success: true,
        timestamp: toBangkokIso(Date.now()),
        count: paged.length,
        total: results.length,
        leads: paged
      });
    }

    return res.status(404).json({
      error: 'Not Found',
      message: `Unknown assistant endpoint: /api/assistant/${endpoint}`
    });
  } catch (err) {
    console.error('Error in Assistant API handler:', err.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred while processing Assistant API request'
    });
  }
}
