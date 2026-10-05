// Meta Facebook Webhook Serverless Handler for Vercel
// Supports: Instant Handshake (GET) & Live 1-Second Message Push (POST)

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rnnkqegziycvkggrdivp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubmtxZWd6aXljdmtnZ3JkaXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjIyMDAsImV4cCI6MjA5NzU5ODIwMH0.N1U6vY2v9STI8p-PsnGTadiJl_MNLFZeFvS5Bw4D7Cc';
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'taaseegun_hub_secret_2026';

const PAGE_TOKENS = {
  '113532784994486': 'EAAZCpCdzNLVIBSqHMVvZCutYZAPmAZBpWItpfkNXmFNrU2RIZASiV4YvZC1W3dmZAcfAxnZCC4ZA7ptk6r0WpKMBlnDRKBli8yzdZCLDBl77QQU58Wie0yZAYBNcWPNaLmZCl41bfe87zfeTj2qacppOOdnxyZAZAbpnpApaoBZCQtousIhkRpUuPGryfZAevGVXW6Ip2x0jijS4sKyb',
  '110842514841725': 'EAAZCpCdzNLVIBSq1P5PtexPOiXZAT7XQVZCuRqdSFWQZA8oLdDuT6SHStVgVUbTx7jljKvVLHnNDsDMw0817PC8ZC6ZCumGm2ZB4cRP0Jy7eNzs7cCfp6zIv30aSZBZA1tnZBPQ0F9w6711LJuiO35ZBWEJb05KkcbjZCTZCCEGUSjKDBpa3T5zwyxZBdr9Fq5NnMFl3kSXlGTj6p3',
  '100873871740668': 'EAAZCpCdzNLVIBSjdqZAM4wDDcc6vbF3CmsElAw4AVaGm18LlWZAD0nH2M8fyZC7fY6sFtBLGW7ALtRZAp46DZAJOXW7U7hz0xBkms7HSljk568IZBHVRGyPVpsKZBebpgZAsmOj7J7ljAzV2w3pUtq5tjcsZC8vO4m3urpE3dVZAHXmP7RTDccb5hWpqwj8A5mYalXxM3eg4YQI',
  '101038208390600': 'EAAZCpCdzNLVIBSog4QNw8GGM3TonPPEiH9icEwy55XZBQZAn3dIbbVFYFu9ZBPHHRQ08PhiRSNkzZB6QWfSF2ZCZBgaTYrhMculFPqC78NjdXiat4WPHmGPkECfyuEVXZCAZAEUvJeEDNTbIRZBhqSLD85qZAu3c1II7bCoK21PZCvuENYkViH1ZBvuWLZAZAc9nMc0TqNAJNdtddvx'
};

const PAGE_NAMES = {
  '113532784994486': 'รับพ่นสี Texture By Good Vibes',
  '110842514841725': 'บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี',
  '100873871740668': 'ทาสีคอนโด RoomsPainting',
  '101038208390600': 'รับทำสีเทกเจอร์ by ช่างหมี'
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Webhook Handshake Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED_SUCCESSFULLY');
        return res.status(200).send(challenge);
      } else {
        console.warn('WEBHOOK_VERIFICATION_FAILED: Token mismatch');
        return res.status(403).send('Verification token mismatch');
      }
    }
    return res.status(400).send('Missing hub parameters');
  }

  // 2. Incoming Event Delivery from Meta (POST)
  if (req.method === 'POST') {
    const body = req.body;

    if (body?.object === 'page') {
      const entries = body.entry || [];
      
      // Process messaging events & feed changes asynchronously
      const processPromises = entries.flatMap(entry => {
        const pageId = entry.id;
        const pageToken = PAGE_TOKENS[pageId];
        const pageName = PAGE_NAMES[pageId] || 'เพจ Facebook';
        const messagingList = entry.messaging || [];
        const changesList = entry.changes || [];

        // 1. Process Private Messenger events
        const msgPromises = messagingList.map(async (event) => {
          try {
            // Only handle customer incoming messages (ignore echo or page self-messages)
            if (event.message && event.sender && event.sender.id !== pageId && !event.message.is_echo) {
              const senderPsid = event.sender.id;
              const rawAtts = event.message.attachments || [];
              const hasImages = rawAtts.some(a => a.type === 'image' || a.payload?.sticker_id);
              const hasVideos = rawAtts.some(a => a.type === 'video');
              const hasFiles = rawAtts.length > 0;
              const text = event.message.text || (hasImages ? '🖼️ [ส่งรูปภาพ]' : (hasVideos ? '🎥 [ส่งวิดีโอ]' : (hasFiles ? '📎 [ส่งไฟล์แนบ]' : 'ข้อความใหม่')));
              const mid = event.message.mid || `mid_${Date.now()}_${Math.random()}`;

              // Try fetching customer profile name from Facebook
              let senderName = `ลูกค้า Facebook #${senderPsid.slice(-4)}`;
              if (pageToken) {
                try {
                  const profileRes = await fetch(`https://graph.facebook.com/v19.0/${senderPsid}?fields=name&access_token=${encodeURIComponent(pageToken)}`);
                  const profileData = await profileRes.json();
                  if (profileData?.name) {
                    senderName = profileData.name;
                  }
                } catch (profErr) {
                  console.warn('Could not fetch sender name:', profErr);
                }
              }

              // Insert into Supabase table (which broadcasts via Supabase Realtime in < 500ms)
              const insertPayload = {
                page_id: pageId,
                sender_psid: senderPsid,
                sender_name: senderName,
                recipient_id: event.recipient?.id || pageId,
                message_mid: mid,
                message_text: text,
                attachments: rawAtts,
                raw_event: {
                  ...event,
                  pageName
                }
              };

              await fetch(`${SUPABASE_URL}/rest/v1/live_facebook_messages`, {
                method: 'POST',
                headers: {
                  'apikey': SUPABASE_KEY,
                  'Authorization': `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(insertPayload)
              });

              // Also sync directly into crm_leads for multi-admin real-time replication
              try {
                const leadId = `fb-live-${senderPsid}`;
                const getLeadRes = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?id=eq.${encodeURIComponent(leadId)}&select=*`, {
                  headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                  }
                });
                const existingRows = await getLeadRes.json();
                const existingLead = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

                const now = Date.now();
                const nowIso = new Date(now).toISOString();
                const nowThaiTime = new Date(now).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
                const nowThaiDate = new Date(now).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' });
                const dateStr = `${nowThaiDate} ${nowThaiTime}`;

                const newIncomingMessage = {
                  id: mid,
                  sender: senderName,
                  text: text,
                  time: nowThaiTime,
                  timestamp: now,
                  isCustomer: true,
                  attachments: rawAtts
                };

                if (existingLead) {
                  const existingMsgs = Array.isArray(existingLead.messages) ? existingLead.messages : [];
                  const hasMsg = existingMsgs.some(m => m.id === mid || (m.text === text && Math.abs((m.timestamp || 0) - now) < 5000));
                  const updatedMessages = hasMsg ? existingMsgs : [...existingMsgs, newIncomingMessage];

                  await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?id=eq.${encodeURIComponent(leadId)}`, {
                    method: 'PATCH',
                    headers: {
                      'apikey': SUPABASE_KEY,
                      'Authorization': `Bearer ${SUPABASE_KEY}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      name: existingLead.name && !existingLead.name.includes('#') ? existingLead.name : senderName,
                      inquiry: text,
                      messages: updatedMessages,
                      timestamp: now,
                      last_activity: now,
                      updated_time: nowIso,
                      unread_count: (existingLead.unread_count || 0) + 1,
                      updated_at: nowIso
                    })
                  });
                } else {
                  await fetch(`${SUPABASE_URL}/rest/v1/crm_leads`, {
                    method: 'POST',
                    headers: {
                      'apikey': SUPABASE_KEY,
                      'Authorization': `Bearer ${SUPABASE_KEY}`,
                      'Content-Type': 'application/json',
                      'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                      id: leadId,
                      name: senderName,
                      platform: 'facebook',
                      channel: pageId,
                      channel_name: pageName,
                      source_type: 'inbox',
                      source_title: 'Messenger Inbox (Live 1s)',
                      source_link: `https://www.facebook.com/${pageId}/inbox/`,
                      contact: 'Facebook Messenger',
                      inquiry: text,
                      deal_value: 0,
                      status: 'ทักใหม่ (New)',
                      date: dateStr,
                      timestamp: now,
                      last_activity: now,
                      updated_time: nowIso,
                      follow_up_date: null,
                      admin: 'แอดมินเพจ',
                      notes: `ทักสดผ่าน Webhook จากเพจ ${pageName}`,
                      tag: '⚡ ลูกค้าใหม่สดๆ 1 วิ',
                      unread_count: 1,
                      customer_psid: senderPsid,
                      is_live_facebook_lead: true,
                      messages: [newIncomingMessage],
                      updated_at: nowIso
                    })
                  });
                }
              } catch (crmSyncErr) {
                console.warn('Webhook sync to crm_leads error:', crmSyncErr);
              }

              console.log(`Live Facebook message inserted for Page [${pageName}] from [${senderName}]: ${text}`);
            }
          } catch (eventErr) {
            console.error('Error processing single messaging event:', eventErr);
          }
        });

        // 2. Process Post Comments (feed changes)
        const commentPromises = changesList.map(async (change) => {
          try {
            if (change.field === 'feed') {
              const val = change.value;
              // Ignore if comment was made by the page itself or not an added comment
              if (val && val.item === 'comment' && val.verb === 'add' && val.from?.id !== pageId) {
                const commentId = val.comment_id;
                const commenterName = val.from?.name || 'ลูกค้า Facebook ใต้โพสต์';
                const commenterId = val.from?.id || commentId;
                const photoUrl = val.photo || val.attachment?.media?.image?.src || null;
                const commentAtts = photoUrl ? [{ type: 'image', payload: { url: photoUrl } }] : [];
                const commentText = val.message || (photoUrl ? '🖼️ [ส่งรูปภาพใต้โพสต์]' : '(สติกเกอร์/รูปภาพใต้โพสต์)');
                const postId = val.post_id || val.parent_id;

                const insertPayload = {
                  page_id: pageId,
                  sender_psid: commenterId,
                  sender_name: commenterName,
                  recipient_id: pageId,
                  message_mid: commentId || `comment_${Date.now()}_${Math.random()}`,
                  message_text: commentText,
                  attachments: commentAtts,
                  raw_event: {
                    isComment: true,
                    commentId: commentId,
                    postId: postId,
                    postTitle: `โพสต์ ID: ${postId ? postId.slice(-8) : 'หน้าเพจ'}`,
                    pageName: pageName
                  }
                };

                await fetch(`${SUPABASE_URL}/rest/v1/live_facebook_messages`, {
                  method: 'POST',
                  headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                  },
                  body: JSON.stringify(insertPayload)
                });

                // Also sync comment directly into crm_leads
                try {
                  const commentLeadId = `fb-comment-${commentId}`;
                  const getCommentLeadRes = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?id=eq.${encodeURIComponent(commentLeadId)}&select=*`, {
                    headers: {
                      'apikey': SUPABASE_KEY,
                      'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                  });
                  const existingCommentRows = await getCommentLeadRes.json();
                  const existingCommentLead = Array.isArray(existingCommentRows) && existingCommentRows.length > 0 ? existingCommentRows[0] : null;

                  const now = Date.now();
                  const nowIso = new Date(now).toISOString();
                  const nowThaiTime = new Date(now).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
                  const nowThaiDate = new Date(now).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' });
                  const dateStr = `${nowThaiDate} ${nowThaiTime}`;

                  const newCommentMessage = {
                    id: commentId,
                    sender: commenterName,
                    text: commentText,
                    time: nowThaiTime,
                    timestamp: now,
                    isCustomer: true,
                    attachments: commentAtts
                  };

                  if (existingCommentLead) {
                    const existingMsgs = Array.isArray(existingCommentLead.messages) ? existingCommentLead.messages : [];
                    const hasMsg = existingMsgs.some(m => m.id === commentId);
                    const updatedMessages = hasMsg ? existingMsgs : [...existingMsgs, newCommentMessage];

                    await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?id=eq.${encodeURIComponent(commentLeadId)}`, {
                      method: 'PATCH',
                      headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        inquiry: commentText,
                        messages: updatedMessages,
                        timestamp: now,
                        last_activity: now,
                        updated_time: nowIso,
                        unread_count: (existingCommentLead.unread_count || 0) + 1,
                        updated_at: nowIso
                      })
                    });
                  } else {
                    await fetch(`${SUPABASE_URL}/rest/v1/crm_leads`, {
                      method: 'POST',
                      headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                      },
                      body: JSON.stringify({
                        id: commentLeadId,
                        name: commenterName,
                        platform: 'facebook',
                        channel: pageId,
                        channel_name: pageName,
                        source_type: 'post_comment',
                        source_title: `โพสต์ ID: ${postId ? postId.slice(-8) : 'หน้าเพจ'}`,
                        source_link: `https://www.facebook.com/${postId || pageId}`,
                        contact: 'คอมเมนต์ใต้โพสต์ Facebook',
                        inquiry: commentText,
                        deal_value: 0,
                        status: 'ทักใหม่ (New)',
                        date: dateStr,
                        timestamp: now,
                        last_activity: now,
                        updated_time: nowIso,
                        follow_up_date: null,
                        admin: 'แอดมินเพจ',
                        notes: `คอมเมนต์สดใต้โพสต์ (${commentId}) เพจ ${pageName}`,
                        tag: '📝 คอมเมนต์ใต้โพสต์',
                        unread_count: 1,
                        customer_psid: commenterId,
                        comment_id: commentId,
                        post_id: postId,
                        is_live_facebook_lead: true,
                        messages: [newCommentMessage],
                        updated_at: nowIso
                      })
                    });
                  }
                } catch (commentCrmErr) {
                  console.warn('Webhook comment sync to crm_leads error:', commentCrmErr);
                }

                console.log(`Live Post Comment inserted for Page [${pageName}] from [${commenterName}]: ${commentText}`);
              }
            }
          } catch (commentErr) {
            console.error('Error processing feed comment change:', commentErr);
          }
        });

        return [...msgPromises, ...commentPromises];
      });

      // Await all message & comment inserts
      try {
        await Promise.all(processPromises);
      } catch (err) {
        console.error('Error executing processes:', err);
      }

      // Must respond 200 OK within 3 seconds for Meta
      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.status(404).send('Not a page event');
  }

  return res.status(405).send('Method Not Allowed');
}
