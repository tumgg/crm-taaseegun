// Meta Facebook Graph API Serverless Proxy for Vercel
// Securely proxies Facebook Graph API calls from backend without exposing Page Tokens to client browser

const FALLBACK_TOKENS = {
  '113532784994486': 'EAAZCpCdzNLVIBSqHMVvZCutYZAPmAZBpWItpfkNXmFNrU2RIZASiV4YvZC1W3dmZAcfAxnZCC4ZA7ptk6r0WpKMBlnDRKBli8yzdZCLDBl77QQU58Wie0yZAYBNcWPNaLmZCl41bfe87zfeTj2qacppOOdnxyZAZAbpnpApaoBZCQtousIhkRpUuPGryfZAevGVXW6Ip2x0jijS4sKyb',
  '110842514841725': 'EAAZCpCdzNLVIBSq1P5PtexPOiXZAT7XQVZCuRqdSFWQZA8oLdDuT6SHStVgVUbTx7jljKvVLHnNDsDMw0817PC8ZC6ZCumGm2ZB4cRP0Jy7eNzs7cCfp6zIv30aSZBZA1tnZBPQ0F9w6711LJuiO35ZBWEJb05KkcbjZCTZCCEGUSjKDBpa3T5zwyxZBdr9Fq5NnMFl3kSXlGTj6p3',
  '100873871740668': 'EAAZCpCdzNLVIBSjdqZAM4wDDcc6vbF3CmsElAw4AVaGm18LlWZAD0nH2M8fyZC7fY6sFtBLGW7ALtRZAp46DZAJOXW7U7hz0xBkms7HSljk568IZBHVRGyPVpsKZBebpgZAsmOj7J7ljAzV2w3pUtq5tjcsZC8vO4m3urpE3dVZAHXmP7RTDccb5hWpqwj8A5mYalXxM3eg4YQI',
  '101038208390600': 'EAAZCpCdzNLVIBSog4QNw8GGM3TonPPEiH9icEwy55XZBQZAn3dIbbVFYFu9ZBPHHRQ08PhiRSNkzZB6QWfSF2ZCZBgaTYrhMculFPqC78NjdXiat4WPHmGPkECfyuEVXZCAZAEUvJeEDNTbIRZBhqSLD85qZAu3c1II7bCoK21PZCvuENYkViH1ZBvuWLZAZAc9nMc0TqNAJNdtddvx'
};

const PAGE_NAMES = {
  '113532784994486': 'รับพ่นสี Texture By Good Vibes',
  '110842514841725': 'บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี',
  '100873871740668': 'ทาสีคอนโด ทาสีภายใน - RoomsPainting',
  '101038208390600': 'รับทำสีเทกเจอร์ by ช่างหมี'
};

// Retrieve Page Token securely from environment variables (fallback during zero-downtime migration)
function getPageToken(pageId) {
  const envMap = {
    '113532784994486': process.env.FB_TOKEN_GOOD_VIBES || process.env.FB_TOKEN_113532784994486,
    '110842514841725': process.env.FB_TOKEN_TAASEEGUN || process.env.FB_TOKEN_110842514841725,
    '100873871740668': process.env.FB_TOKEN_ROOMS_PAINTING || process.env.FB_TOKEN_100873871740668,
    '101038208390600': process.env.FB_TOKEN_TEXTURE_BEAR || process.env.FB_TOKEN_101038208390600
  };

  return envMap[pageId] || process.env[`FB_TOKEN_${pageId}`] || FALLBACK_TOKENS[pageId] || null;
}

// Normalize attachments
function normalizeAttachment(att) {
  if (!att) return null;
  if (att.image_data || att.video_data || att.file_url) {
    const isImage = att.mime_type?.startsWith('image/') || (!att.mime_type && !!att.image_data);
    const isVideo = att.mime_type?.startsWith('video/') || (!att.mime_type && !!att.video_data);
    const isAudio = att.mime_type?.startsWith('audio/');
    return {
      id: String(att.id || `att-${Date.now()}-${Math.random()}`),
      type: isImage ? 'image' : isVideo ? 'video' : isAudio ? 'audio' : 'file',
      mimeType: att.mime_type || (isImage ? 'image/jpeg' : 'application/octet-stream'),
      name: att.name || (isImage ? 'รูปภาพ' : isVideo ? 'วิดีโอ' : 'ไฟล์แนบ'),
      size: att.size || null,
      url: att.image_data?.url || att.video_data?.url || att.file_url,
      previewUrl: att.image_data?.preview_url || att.image_data?.url || att.video_data?.url || att.file_url,
      isSticker: att.image_data?.render_as_sticker || false
    };
  }
  return {
    id: String(att.id || `att-${Date.now()}-${Math.random()}`),
    type: att.type || 'file',
    mimeType: att.mimeType,
    name: att.name || 'ไฟล์แนบ',
    size: att.size,
    url: att.url,
    previewUrl: att.previewUrl || att.url,
    isSticker: att.isSticker || false
  };
}

// Parse messages array into chronological normalized list
function parseMessagesArray(dataArray, pageId, pageName, customerName, convId) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return [];

  const sorted = [...dataArray].sort((a, b) => {
    const timeA = a.created_time ? new Date(a.created_time).getTime() : 0;
    const timeB = b.created_time ? new Date(b.created_time).getTime() : 0;
    return timeA - timeB;
  });

  const parsed = sorted.map(m => {
    const isFromPage = m.from?.id === pageId;
    const msgDate = m.created_time ? new Date(m.created_time) : new Date();
    const timeStr = `${String(msgDate.getHours()).padStart(2, '0')}:${String(msgDate.getMinutes()).padStart(2, '0')}`;
    const rawAtts = m.attachments?.data || [];
    const parsedAttachments = rawAtts.map(att => normalizeAttachment(att)).filter(Boolean);

    let text = typeof m.message === 'string' && m.message.trim() ? m.message.trim() : '';
    if (!text && parsedAttachments.length > 0) {
      if (parsedAttachments.some(a => a.isSticker)) text = '🏷️ สติกเกอร์';
      else if (parsedAttachments.some(a => a.type === 'image')) text = '🖼️ รูปภาพ';
      else if (parsedAttachments.some(a => a.type === 'video')) text = '🎥 วิดีโอ';
      else text = '📎 ไฟล์แนบ';
    } else if (!text) {
      text = '(ข้อความว่าง)';
    }

    let parsedReplyTo = null;
    if (m.reply_to) {
      const targetMid = m.reply_to.mid || m.reply_to.id || (typeof m.reply_to === 'string' ? m.reply_to : null);
      parsedReplyTo = {
        id: targetMid,
        mid: targetMid,
        text: m.reply_to.message || m.reply_to.text || '',
        sender: m.reply_to.from?.id === pageId ? 'admin' : 'lead',
        name: m.reply_to.from?.id === pageId ? (pageName || 'คุณ (แอดมิน)') : customerName
      };
    }

    return {
      id: m.id || `msg-${Date.now()}-${Math.random()}`,
      sender: isFromPage ? 'admin' : 'lead',
      adminName: isFromPage ? (pageName || 'แอดมินเพจ') : undefined,
      text: text,
      attachments: parsedAttachments,
      time: timeStr,
      created_time: m.created_time,
      timestamp: m.created_time ? new Date(m.created_time).getTime() : Date.now(),
      replyTo: parsedReplyTo
    };
  });

  parsed.forEach(item => {
    if (item.replyTo) {
      const ref = parsed.find(target => target.id === item.replyTo.id || target.id === item.replyTo.mid);
      if (ref) {
        if (!item.replyTo.text) item.replyTo.text = ref.text;
        item.replyTo.sender = ref.sender;
        item.replyTo.name = ref.sender === 'admin' ? (ref.adminName || 'คุณ (แอดมิน)') : customerName;
        item.replyTo.attachments = ref.attachments;
      }
    }
  });

  return parsed;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action;

  try {
    // -------------------------------------------------------------
    // ACTION: get_conversations
    // -------------------------------------------------------------
    if (action === 'get_conversations') {
      const pageId = req.query.pageId || req.body?.pageId;
      if (!pageId) {
        return res.status(400).json({ error: 'Missing pageId parameter' });
      }

      const token = getPageToken(pageId);
      if (!token) {
        return res.status(400).json({ error: `No access token found for pageId ${pageId}` });
      }

      const pageName = PAGE_NAMES[pageId] || req.query.pageName || 'เพจ Facebook จริง';
      const convUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=id,snippet,updated_time,unread_count,senders{id,name,email,picture}&limit=15&access_token=${encodeURIComponent(token)}`;
      const convRes = await fetch(convUrl);
      const convData = await convRes.json();

      if (convData.error) {
        return res.status(500).json({ error: convData.error.message || 'Error fetching conversations' });
      }

      if (!convData.data || !Array.isArray(convData.data)) {
        return res.status(200).json({ leads: [] });
      }

      const leadsPromises = convData.data.slice(0, 15).map(async (conv) => {
        try {
          const customerSender = conv.senders?.data?.find(s => s.id !== pageId) || conv.senders?.data?.[0];
          const customerName = (customerSender?.name && customerSender.name.trim())
            ? customerSender.name.trim()
            : `ลูกค้า Facebook #${conv.id ? conv.id.slice(-4) : 'Inbox'}`;
          const customerEmail = customerSender?.email || '';
          const customerAvatar = customerSender?.picture?.data?.url || null;

          let messageList = [];
          let olderMessagesUrl = null;
          try {
            const fieldsWithReply = 'id,message,created_time,from,reply_to,attachments{id,mime_type,name,size,image_data,video_data,file_url}';
            const fieldsFallback = 'id,message,created_time,from,attachments{id,mime_type,name,size,image_data,video_data,file_url}';

            let msgRes = await fetch(`https://graph.facebook.com/v19.0/${conv.id}/messages?fields=${fieldsWithReply}&limit=100&access_token=${encodeURIComponent(token)}`);
            let msgData = await msgRes.json();

            if (!msgData || msgData.error) {
              const fallbackRes = await fetch(`https://graph.facebook.com/v19.0/${conv.id}/messages?fields=${fieldsFallback}&limit=100&access_token=${encodeURIComponent(token)}`);
              msgData = await fallbackRes.json();
            }

            if (msgData.data && Array.isArray(msgData.data)) {
              let allRaw = [...msgData.data];
              olderMessagesUrl = msgData.paging?.next || null;

              // Auto-fetch 2nd batch if 100 messages returned
              if (allRaw.length >= 100 && olderMessagesUrl) {
                try {
                  let p2Url = olderMessagesUrl;
                  if (!p2Url.includes('access_token=')) {
                    p2Url += `&access_token=${encodeURIComponent(token)}`;
                  }
                  const page2Res = await fetch(p2Url);
                  const page2Data = await page2Res.json();
                  if (page2Data.data && Array.isArray(page2Data.data)) {
                    allRaw = [...allRaw, ...page2Data.data];
                    olderMessagesUrl = page2Data.paging?.next || null;
                  }
                } catch (p2Err) {
                  console.warn('Auto fetch 2nd batch failed in serverless:', p2Err);
                }
              }

              messageList = parseMessagesArray(allRaw, pageId, pageName, customerName, conv.id);
            }
          } catch (mErr) {
            console.warn('Could not fetch messages for conv', conv.id, mErr);
          }

          if (messageList.length === 0 && conv.snippet) {
            messageList = [{
              id: `msg-${conv.id}`,
              sender: 'lead',
              text: conv.snippet,
              attachments: [],
              time: 'ล่าสุด',
              timestamp: conv.updated_time ? new Date(conv.updated_time).getTime() : Date.now()
            }];
          }

          const updateDate = conv.updated_time ? new Date(conv.updated_time) : new Date();
          const convTimestamp = !isNaN(updateDate.getTime()) ? updateDate.getTime() : Date.now();
          const pad = (n) => String(n).padStart(2, '0');
          const dateStr = `${updateDate.getFullYear()}-${pad(updateDate.getMonth() + 1)}-${pad(updateDate.getDate())}`;
          const timeStr = `${pad(updateDate.getHours())}:${pad(updateDate.getMinutes())}`;

          const latestMsg = messageList.length > 0 ? messageList[messageList.length - 1] : null;
          let cleanInquiry = (typeof conv.snippet === 'string' && conv.snippet.trim()) ? conv.snippet.trim() : 'สนใจสอบถามบริการ';
          if (latestMsg && latestMsg.attachments?.length > 0 && (!cleanInquiry || cleanInquiry.includes('ไฟล์แนบ') || cleanInquiry.includes('สติกเกอร์') || cleanInquiry === 'สนใจสอบถามบริการ')) {
            cleanInquiry = latestMsg.text;
          }

          const latestMsgTime = latestMsg?.timestamp || (latestMsg?.created_time ? new Date(latestMsg.created_time).getTime() : 0);
          const effectiveTimestamp = Math.max(convTimestamp, latestMsgTime || 0);

          // NOTE: activePageToken is strictly omitted to keep token secure on backend!
          return {
            id: `fb-live-${conv.id}`,
            name: customerName,
            platform: 'facebook',
            channel: pageId,
            channelName: pageName,
            sourceType: 'inbox',
            sourceTitle: 'Messenger Inbox (Live)',
            sourceLink: `https://www.facebook.com${conv.link || ''}`,
            contact: customerEmail ? `Email: ${customerEmail}` : 'Facebook Messenger',
            inquiry: cleanInquiry,
            dealValue: 0,
            status: (conv.unread_count && conv.unread_count > 0) ? 'ทักใหม่ (New)' : 'ติดต่อแล้ว',
            date: `${dateStr} ${timeStr}`,
            updatedTime: conv.updated_time || updateDate.toISOString(),
            timestamp: effectiveTimestamp,
            lastActivity: effectiveTimestamp,
            followUpDate: null,
            admin: 'ช่างเสือ ทาสี',
            notes: `ทักมาจากโฆษณา/Inbox หน้าเพจจริง (${conv.id})`,
            isLiveFacebookLead: true,
            unreadCount: conv.unread_count || 0,
            tag: 'ลูกค้าเพจจริง',
            convId: conv.id,
            customerPsid: customerSender?.id || null,
            avatar: customerAvatar || null,
            messages: messageList,
            olderMessagesUrl: olderMessagesUrl || null,
            hasMoreOlderMessages: !!olderMessagesUrl
          };
        } catch (err) {
          console.warn('Error parsing conversation in serverless:', err);
          return null;
        }
      });

      const leads = (await Promise.all(leadsPromises)).filter(Boolean);
      return res.status(200).json({ success: true, leads });
    }

    // -------------------------------------------------------------
    // ACTION: get_older_messages
    // -------------------------------------------------------------
    if (action === 'get_older_messages') {
      const { olderUrl, pageId, pageName, customerName, convId } = req.body || req.query;
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
        const parsed = parseMessagesArray(pData.data, pageId, pageName, customerName, convId);
        return res.status(200).json({
          success: true,
          messages: parsed,
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
      const { pageId, recipientPsid, messageText, replyToMid } = req.body;
      if (!pageId || !recipientPsid || !messageText) {
        return res.status(400).json({ error: 'Missing pageId, recipientPsid, or messageText' });
      }

      const token = getPageToken(pageId);
      if (!token) {
        return res.status(400).json({ error: `No token found for pageId ${pageId}` });
      }

      const postBody = {
        recipient: { id: recipientPsid },
        message: { text: messageText },
        messaging_type: 'RESPONSE'
      };

      if (replyToMid && typeof replyToMid === 'string' && !replyToMid.startsWith('msg-') && !replyToMid.startsWith('att-')) {
        postBody.reply_to = { mid: replyToMid };
      }

      const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(token)}`;
      let fbRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody)
      });
      let fbData = await fbRes.json();

      // Retry without reply_to if Facebook rejected reply_to
      if (fbData.error && postBody.reply_to) {
        delete postBody.reply_to;
        fbRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postBody)
        });
        fbData = await fbRes.json();
      }

      if (fbData.error) {
        return res.status(500).json({ error: fbData.error.message || 'Error sending Facebook reply' });
      }

      return res.status(200).json({ success: true, result: fbData });
    }

    // -------------------------------------------------------------
    // ACTION: reply_comment
    // -------------------------------------------------------------
    if (action === 'reply_comment') {
      const { pageId, commentId, messageText } = req.body;
      if (!pageId || !commentId || !messageText) {
        return res.status(400).json({ error: 'Missing pageId, commentId, or messageText' });
      }

      const token = getPageToken(pageId);
      if (!token) {
        return res.status(400).json({ error: `No token found for pageId ${pageId}` });
      }

      const url = `https://graph.facebook.com/v19.0/${commentId}/comments?access_token=${encodeURIComponent(token)}`;
      const fbRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      const fbData = await fbRes.json();

      if (fbData.error) {
        return res.status(500).json({ error: fbData.error.message || 'Error replying to comment' });
      }

      return res.status(200).json({ success: true, result: fbData });
    }

    // -------------------------------------------------------------
    // ACTION: private_reply
    // -------------------------------------------------------------
    if (action === 'private_reply') {
      const { pageId, commentId, messageText } = req.body;
      if (!pageId || !commentId || !messageText) {
        return res.status(400).json({ error: 'Missing pageId, commentId, or messageText' });
      }

      const token = getPageToken(pageId);
      if (!token) {
        return res.status(400).json({ error: `No token found for pageId ${pageId}` });
      }

      const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(token)}`;
      const fbRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { comment_id: commentId },
          message: { text: messageText },
          messaging_type: 'RESPONSE'
        })
      });
      const fbData = await fbRes.json();

      if (fbData.error) {
        return res.status(500).json({ error: fbData.error.message || 'Error sending private reply' });
      }

      return res.status(200).json({ success: true, result: fbData });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (globalErr) {
    console.error('Serverless Facebook Proxy Exception:', globalErr);
    return res.status(500).json({ error: globalErr.message || 'Internal server error' });
  }
}
