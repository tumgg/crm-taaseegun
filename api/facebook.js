// Meta Facebook Graph API Serverless Proxy for OmniSocial CRM Web App
// Securely proxies Facebook Graph API calls from backend without exposing Page Tokens to client browser

import {
  getPageToken,
  PAGE_CONFIGS,
  normalizeAttachment,
  parseRawMessages,
  fetchConversationsFromGraph,
  fetchMessagesForConversation,
  sendFacebookReply,
  sendFacebookAttachment,
  replyFacebookComment,
  replyFacebookCommentAttachment,
  sendFacebookPrivateReply
} from './lib/facebookService.js';

import {
  ALLOWED_PAGE_IDS,
  applySecurityHeaders,
  verifyCrmUserSession
} from './lib/auth.js';

export default async function handler(req, res) {
  // Apply standard security headers
  applySecurityHeaders(res);

  // Set CORS headers for web app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Session');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Authenticate CRM User
  const auth = await verifyCrmUserSession(req);
  if (!auth.authenticated) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please log in with a valid CRM user session.'
    });
  }

  const action = req.query.action || req.body?.action;
  const pageId = req.query.pageId || req.body?.pageId;

  // 2. Validate Page ID Allowlist
  if (pageId && !ALLOWED_PAGE_IDS.has(String(pageId))) {
    return res.status(403).json({
      error: 'Forbidden',
      message: `Page ID ${pageId} is not in the authorized allowlist`
    });
  }

  try {
    // -------------------------------------------------------------
    // ACTION: get_conversations
    // -------------------------------------------------------------
    if (action === 'get_conversations') {
      if (!pageId) {
        return res.status(400).json({ error: 'Missing pageId parameter' });
      }

      const token = getPageToken(pageId);
      if (!token) {
        return res.status(400).json({ error: `No access token found for pageId ${pageId}` });
      }

      const convs = await fetchConversationsFromGraph(pageId, { limit: 15 });

      // Transform to frontend lead shape (strictly omitting activePageToken)
      const leads = convs.map(c => ({
        id: `fb-live-${c.conversation_id}`,
        name: c.customer_name,
        platform: 'facebook',
        channel: c.page_id,
        channelName: c.page_name,
        sourceType: 'inbox',
        sourceTitle: 'Messenger Inbox (Live)',
        sourceLink: `https://www.facebook.com`,
        contact: c.customer_email ? `Email: ${c.customer_email}` : 'Facebook Messenger',
        inquiry: c.last_message_preview,
        dealValue: 0,
        status: (c.unread_count && c.unread_count > 0) ? 'ทักใหม่ (New)' : 'ติดต่อแล้ว',
        date: c.last_message_at ? c.last_message_at.replace('T', ' ').slice(0, 16) : '',
        updatedTime: c.last_message_at,
        timestamp: c.last_message_at ? new Date(c.last_message_at).getTime() : Date.now(),
        lastActivity: c.last_message_at ? new Date(c.last_message_at).getTime() : Date.now(),
        followUpDate: null,
        admin: c.assigned_admin || 'ช่างเสือ ทาสี',
        notes: `ทักมาจากโฆษณา/Inbox หน้าเพจจริง (${c.conversation_id})`,
        isLiveFacebookLead: true,
        unreadCount: c.unread_count || 0,
        tag: 'ลูกค้าเพจจริง',
        convId: c.conversation_id,
        customerPsid: c.customer_id,
        avatar: c.profile_picture_url,
        messages: (c.raw_messages || []).map(m => ({
          id: m.message_id,
          sender: m.sender_type === 'page' ? 'admin' : 'lead',
          adminName: m.sender_type === 'page' ? c.page_name : undefined,
          text: m.message,
          attachments: m.attachments || [],
          time: m.created_at ? m.created_at.slice(11, 16) : '',
          created_time: m.created_at,
          timestamp: m.timestamp,
          replyTo: m.reply_to_message_id ? { id: m.reply_to_message_id } : null
        })),
        olderMessagesUrl: c.older_messages_url || null,
        hasMoreOlderMessages: !!c.older_messages_url
      }));

      return res.status(200).json({ success: true, leads });
    }

    // -------------------------------------------------------------
    // ACTION: get_older_messages
    // -------------------------------------------------------------
    if (action === 'get_older_messages') {
      const { olderUrl, pageName, customerName, convId } = req.body || req.query;
      if (!olderUrl) {
        return res.status(400).json({ error: 'Missing olderUrl' });
      }

      const token = getPageToken(pageId);
      let targetUrl = olderUrl;
      if (token && !targetUrl.includes('access_token=')) {
        targetUrl += (targetUrl.includes('?') ? '&' : '?') + `access_token=${encodeURIComponent(token)}`;
      }

      const pRes = await fetch(targetUrl);
      const pData = await pRes.json();
      if (pData.data && Array.isArray(pData.data)) {
        const parsed = parseRawMessages(pData.data, pageId, pageName, customerName || 'ลูกค้า', convId);
        const mapped = parsed.map(m => ({
          id: m.message_id,
          sender: m.sender_type === 'page' ? 'admin' : 'lead',
          adminName: m.sender_type === 'page' ? pageName : undefined,
          text: m.message,
          attachments: m.attachments || [],
          time: m.created_at ? m.created_at.slice(11, 16) : '',
          created_time: m.created_at,
          timestamp: m.timestamp,
          replyTo: m.reply_to_message_id ? { id: m.reply_to_message_id } : null
        }));
        return res.status(200).json({
          success: true,
          messages: mapped,
          nextOlderUrl: pData.paging?.next || null,
          hasMore: !!pData.paging?.next
        });
      }
      return res.status(200).json({ success: true, messages: [], nextOlderUrl: null, hasMore: false });
    }

    // -------------------------------------------------------------
    // ACTION: send_message
    // -------------------------------------------------------------
    if (action === 'send_message') {
      const { recipientPsid, messageText, replyToMid } = req.body;
      if (!pageId || !recipientPsid || !messageText) {
        return res.status(400).json({ error: 'Missing pageId, recipientPsid, or messageText' });
      }
      const result = await sendFacebookReply(pageId, recipientPsid, messageText, replyToMid);
      return res.status(200).json({ success: true, result });
    }

    // -------------------------------------------------------------
    // ACTION: send_attachment
    // -------------------------------------------------------------
    if (action === 'send_attachment') {
      const { recipientPsid, fileBase64, fileName, fileType, mimeType } = req.body;
      if (!pageId || !recipientPsid || !fileBase64) {
        return res.status(400).json({ error: 'Missing pageId, recipientPsid, or fileBase64' });
      }
      const result = await sendFacebookAttachment(pageId, recipientPsid, fileBase64, fileName, fileType, mimeType);
      return res.status(200).json({ success: true, result });
    }

    // -------------------------------------------------------------
    // ACTION: reply_comment
    // -------------------------------------------------------------
    if (action === 'reply_comment') {
      const { commentId, messageText } = req.body;
      if (!pageId || !commentId || !messageText) {
        return res.status(400).json({ error: 'Missing pageId, commentId, or messageText' });
      }
      const result = await replyFacebookComment(pageId, commentId, messageText);
      return res.status(200).json({ success: true, result });
    }

    // -------------------------------------------------------------
    // ACTION: reply_comment_attachment
    // -------------------------------------------------------------
    if (action === 'reply_comment_attachment') {
      const { commentId, messageText, fileBase64, fileName, mimeType } = req.body;
      if (!pageId || !commentId) {
        return res.status(400).json({ error: 'Missing pageId or commentId' });
      }
      const result = await replyFacebookCommentAttachment(pageId, commentId, messageText, fileBase64, fileName, mimeType);
      return res.status(200).json({ success: true, result });
    }

    // -------------------------------------------------------------
    // ACTION: private_reply
    // -------------------------------------------------------------
    if (action === 'private_reply') {
      const { commentId, messageText } = req.body;
      if (!pageId || !commentId || !messageText) {
        return res.status(400).json({ error: 'Missing pageId, commentId, or messageText' });
      }
      const result = await sendFacebookPrivateReply(pageId, commentId, messageText);
      return res.status(200).json({ success: true, result });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (globalErr) {
    console.error('Serverless Facebook Proxy Exception:', globalErr.message);
    return res.status(500).json({ error: globalErr.message || 'Internal server error' });
  }
}
