// Central Facebook Graph API Service for OmniSocial Backend
// Securely proxies Facebook Graph API without exposing tokens to client or assistant responses

import { toBangkokIso, calculateWaitingMetrics } from './dateUtils.js';

export const PAGE_CONFIGS = {
  '113532784994486': {
    id: '113532784994486',
    name: 'รับพ่นสี Texture By Good Vibes',
    envKey: 'FB_TOKEN_GOOD_VIBES'
  },
  '110842514841725': {
    id: '110842514841725',
    name: 'บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี',
    envKey: 'FB_TOKEN_TAASEEGUN'
  },
  '100873871740668': {
    id: '100873871740668',
    name: 'ทาสีคอนโด ทาสีภายใน - RoomsPainting',
    envKey: 'FB_TOKEN_ROOMS_PAINTING'
  },
  '101038208390600': {
    id: '101038208390600',
    name: 'รับทำสีเทกเจอร์ by ช่างหมี',
    envKey: 'FB_TOKEN_TEXTURE_BEAR'
  }
};

/**
 * Retrieve Page Token securely from environment variables
 */
export function getPageToken(pageId) {
  const config = PAGE_CONFIGS[pageId];
  if (!config) return null;
  return process.env[config.envKey] || process.env[`FB_TOKEN_${pageId}`] || null;
}

/**
 * Returns list of configured pages for health/pages endpoints (strictly NO tokens)
 */
export function getAllConfiguredPages() {
  return Object.values(PAGE_CONFIGS).map(cfg => {
    const hasToken = !!getPageToken(cfg.id);
    return {
      page_id: cfg.id,
      page_name: cfg.name,
      status: hasToken ? 'active' : 'token_missing',
      last_sync_at: toBangkokIso(Date.now())
    };
  });
}

/**
 * Normalize attachment objects
 */
export function normalizeAttachment(att) {
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
    mimeType: att.mimeType || 'application/octet-stream',
    name: att.name || 'ไฟล์แนบ',
    size: att.size || null,
    url: att.url || null,
    previewUrl: att.previewUrl || att.url || null,
    isSticker: att.isSticker || false
  };
}

/**
 * Parses raw Facebook Graph API messages array
 */
export function parseRawMessages(rawArray, pageId, pageName, customerName, convId) {
  if (!Array.isArray(rawArray) || rawArray.length === 0) return [];

  const sorted = [...rawArray].sort((a, b) => {
    const timeA = a.created_time ? new Date(a.created_time).getTime() : 0;
    const timeB = b.created_time ? new Date(b.created_time).getTime() : 0;
    return timeA - timeB;
  });

  return sorted.map(m => {
    const isFromPage = String(m.from?.id) === String(pageId) || m.is_echo === true || Boolean(pageName && m.from?.name && m.from.name.includes(pageName));
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

    const replyToMid = m.reply_to?.mid || m.reply_to?.id || (typeof m.reply_to === 'string' ? m.reply_to : null);

    return {
      message_id: m.id || `msg-${Date.now()}-${Math.random()}`,
      conversation_id: convId,
      sender_type: isFromPage ? 'page' : 'customer',
      sender_name: isFromPage ? (pageName || 'แอดมินเพจ') : customerName,
      message: text,
      created_at: toBangkokIso(m.created_time),
      timestamp: m.created_time ? new Date(m.created_time).getTime() : Date.now(),
      attachments: parsedAttachments,
      is_echo: Boolean(m.is_echo || isFromPage),
      reply_to_message_id: replyToMid || null
    };
  });
}

/**
 * Fetches conversations from Meta Graph API for a specific page
 */
export async function fetchConversationsFromGraph(pageId, options = {}) {
  const token = getPageToken(pageId);
  if (!token) {
    throw new Error(`No Facebook Page Token configured for pageId: ${pageId}`);
  }

  const pageConfig = PAGE_CONFIGS[pageId] || { name: 'เพจ Facebook จริง' };
  const pageName = pageConfig.name;
  const limit = options.limit || 15;

  const convUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=id,snippet,updated_time,unread_count,senders{id,name,email,picture}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
  const convRes = await fetch(convUrl);
  const convData = await convRes.json();

  if (convData.error) {
    throw new Error(convData.error.message || 'Error fetching conversations from Meta Graph API');
  }

  if (!convData.data || !Array.isArray(convData.data)) {
    return [];
  }

  const results = await Promise.all(convData.data.map(async (conv) => {
    try {
      const customerSender = conv.senders?.data?.find(s => s.id !== pageId) || conv.senders?.data?.[0];
      const customerName = (customerSender?.name && customerSender.name.trim())
        ? customerSender.name.trim()
        : `ลูกค้า Facebook #${conv.id ? conv.id.slice(-4) : 'Inbox'}`;
      const customerEmail = customerSender?.email || '';
      const customerAvatar = customerSender?.picture?.data?.url || null;

      // Fetch messages for conversation
      let messageList = [];
      let olderMessagesUrl = null;
      try {
        const fields = 'id,message,created_time,from,reply_to,attachments{id,mime_type,name,size,image_data,video_data,file_url}';
        const msgRes = await fetch(`https://graph.facebook.com/v19.0/${conv.id}/messages?fields=${fields}&limit=50&access_token=${encodeURIComponent(token)}`);
        const msgData = await msgRes.json();

        if (msgData.data && Array.isArray(msgData.data)) {
          olderMessagesUrl = msgData.paging?.next || null;
          messageList = parseRawMessages(msgData.data, pageId, pageName, customerName, conv.id);
        }
      } catch (mErr) {
        console.warn('Could not fetch messages for conversation:', conv.id, mErr.message);
      }

      // If no messages fetched, create fallback preview from snippet
      if (messageList.length === 0 && conv.snippet) {
        messageList = [{
          message_id: `placeholder-${conv.id}`,
          conversation_id: conv.id,
          sender_type: (conv.unread_count === 0 && !conv.snippet.startsWith('ลูกค้า')) ? 'page' : 'customer',
          sender_name: (conv.unread_count === 0 && !conv.snippet.startsWith('ลูกค้า')) ? pageName : customerName,
          message: conv.snippet,
          created_at: toBangkokIso(conv.updated_time),
          timestamp: conv.updated_time ? new Date(conv.updated_time).getTime() : Date.now(),
          attachments: [],
          is_echo: false,
          reply_to_message_id: null
        }];
      }

      // Calculate answered status and waiting metrics
      const metrics = calculateWaitingMetrics(messageList, pageId);

      const latestMsg = messageList.length > 0 ? messageList[messageList.length - 1] : null;
      const previewText = latestMsg?.message || conv.snippet || '(ไม่มีข้อความ)';

      return {
        conversation_id: conv.id,
        page_id: pageId,
        page_name: pageName,
        customer_id: customerSender?.id || null,
        customer_name: customerName,
        customer_email: customerEmail || null,
        profile_picture_url: customerAvatar || null,
        last_message_preview: previewText,
        last_message_at: metrics.last_message_at || toBangkokIso(conv.updated_time),
        last_customer_message_at: metrics.last_customer_message_at,
        last_admin_message_at: metrics.last_admin_message_at,
        answered: metrics.answered,
        waiting_minutes: metrics.waiting_minutes,
        unread_count: conv.unread_count || 0,
        lead_status: metrics.answered ? 'ติดต่อแล้ว' : 'ทักใหม่ (New)',
        tags: ['ลูกค้าเพจจริง'],
        assigned_admin: 'ช่างเสือ ทาสี',
        raw_messages: messageList,
        older_messages_url: olderMessagesUrl
      };
    } catch (parseErr) {
      console.warn('Error processing conversation item:', parseErr.message);
      return null;
    }
  }));

  return results.filter(Boolean);
}

/**
 * Fetches messages for a specific conversation with optional limit, before, after pagination
 */
export async function fetchMessagesForConversation(convId, pageId, options = {}) {
  const token = getPageToken(pageId);
  if (!token) {
    throw new Error(`No Facebook Page Token configured for pageId: ${pageId}`);
  }

  const pageConfig = PAGE_CONFIGS[pageId] || { name: 'เพจ Facebook จริง' };
  const pageName = pageConfig.name;
  const limit = Math.min(options.limit || 50, 100);

  const fields = 'id,message,created_time,from,reply_to,attachments{id,mime_type,name,size,image_data,video_data,file_url}';
  let url = `https://graph.facebook.com/v19.0/${convId}/messages?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;

  if (options.before) {
    url += `&before=${encodeURIComponent(options.before)}`;
  }
  if (options.after) {
    url += `&after=${encodeURIComponent(options.after)}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Error fetching conversation messages from Meta');
  }

  const rawMessages = data.data || [];
  const parsed = parseRawMessages(rawMessages, pageId, pageName, 'ลูกค้า', convId);

  return {
    messages: parsed,
    paging: data.paging || null
  };
}

/**
 * Graph API send reply message (used by CRM web app)
 */
export async function sendFacebookReply(pageId, recipientPsid, messageText, replyToMid) {
  const token = getPageToken(pageId);
  if (!token) throw new Error(`No token found for pageId ${pageId}`);

  const postBody = {
    recipient: { id: recipientPsid },
    message: { text: messageText },
    messaging_type: 'RESPONSE'
  };

  if (replyToMid && typeof replyToMid === 'string' && !replyToMid.startsWith('msg-') && !replyToMid.startsWith('att-')) {
    postBody.reply_to = { mid: replyToMid };
  }

  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(token)}`;
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postBody)
  });
  let data = await res.json();

  // Retry without reply_to if rejected
  if (data.error && postBody.reply_to) {
    delete postBody.reply_to;
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody)
    });
    data = await res.json();
  }

  // Automatic retry with HUMAN_AGENT message tag if outside 24-hour window
  if (data.error && (data.error.code === 10 || data.error.error_subcode === 2018278 || String(data.error.message || '').includes('window') || String(data.error.message || '').includes('24'))) {
    const humanAgentBody = {
      recipient: { id: recipientPsid },
      message: { text: messageText },
      messaging_type: 'MESSAGE_TAG',
      tag: 'HUMAN_AGENT'
    };
    const tagRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(humanAgentBody)
    });
    const tagData = await tagRes.json();
    if (!tagData.error) {
      return tagData;
    }
    // Fallback tag if HUMAN_AGENT is not provisioned on page
    if (tagData.error && tagData.error.code === 10) {
      const fallbackTagBody = {
        recipient: { id: recipientPsid },
        message: { text: messageText },
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE'
      };
      const fbRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fallbackTagBody)
      });
      const fbData = await fbRes.json();
      if (!fbData.error) {
        return fbData;
      }
    }
  }

  if (data.error) {
    const msg = data.error.message || "";
    if (data.error.code === 10 || data.error.error_subcode === 2018278 || msg.includes("window") || msg.includes("24") || msg.includes("ช่วงเวลาที่อนุญาต")) {
      throw new Error("ลูกค้าไม่ได้ส่งข้อความมาเกิน 24 ชม. แล้ว ตามนโยบาย Facebook (24-Hour Policy) ระบบภายนอกไม่อนุญาตให้ส่งข้อความ กรุณาเปิดตอบผ่าน Meta Business Suite โดยตรง");
    }
    throw new Error(msg || "Error sending Facebook reply");
  }
  return data;
}

/**
 * Graph API send attachment (used by CRM web app)
 */
export async function sendFacebookAttachment(pageId, recipientPsid, fileBase64, fileName, fileType, mimeType) {
  const token = getPageToken(pageId);
  if (!token) throw new Error(`No token found for pageId ${pageId}`);

  const buffer = Buffer.from(fileBase64, 'base64');
  const blob = new Blob([buffer], { type: mimeType || 'application/octet-stream' });
  const formData = new FormData();
  formData.append('recipient', JSON.stringify({ id: recipientPsid }));
  formData.append('message', JSON.stringify({
    attachment: {
      type: fileType || 'file',
      payload: { is_reusable: true }
    }
  }));
  formData.append('filedata', blob, fileName || 'attachment');

  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method: 'POST', body: formData });
  let data = await res.json();

  // Retry with HUMAN_AGENT tag if outside 24-hour window
  if (data.error && (data.error.code === 10 || data.error.error_subcode === 2018278 || String(data.error.message || '').includes('window') || String(data.error.message || '').includes('24'))) {
    const tagFormData = new FormData();
    tagFormData.append('recipient', JSON.stringify({ id: recipientPsid }));
    tagFormData.append('messaging_type', 'MESSAGE_TAG');
    tagFormData.append('tag', 'HUMAN_AGENT');
    tagFormData.append('message', JSON.stringify({
      attachment: {
        type: fileType || 'file',
        payload: { is_reusable: true }
      }
    }));
    tagFormData.append('filedata', blob, fileName || 'attachment');
    const tagRes = await fetch(url, { method: 'POST', body: tagFormData });
    const tagData = await tagRes.json();
    if (!tagData.error) return tagData;
  }

  if (data.error) {
    const msg = data.error.message || "";
    if (data.error.code === 10 || data.error.error_subcode === 2018278 || msg.includes("window") || msg.includes("24") || msg.includes("ช่วงเวลาที่อนุญาต")) {
      throw new Error("ลูกค้าไม่ได้ส่งข้อความมาเกิน 24 ชม. แล้ว ตามนโยบาย Facebook (24-Hour Policy) ระบบภายนอกไม่อนุญาตให้ส่งไฟล์/รูปภาพ กรุณาเปิดตอบผ่าน Meta Business Suite โดยตรง");
    }
    throw new Error(msg || "Error sending attachment");
  }
  return data;
}

/**
 * Graph API reply to comment (used by CRM web app)
 */
export async function replyFacebookComment(pageId, commentId, messageText) {
  const token = getPageToken(pageId);
  if (!token) throw new Error(`No token found for pageId ${pageId}`);

  const url = `https://graph.facebook.com/v19.0/${commentId}/comments?access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: messageText })
  });
  const data = await res.json();

  if (data.error) throw new Error(data.error.message || 'Error replying to comment');
  return data;
}

/**
 * Graph API reply to comment with attachment (used by CRM web app)
 */
export async function replyFacebookCommentAttachment(pageId, commentId, messageText, fileBase64, fileName, mimeType) {
  const token = getPageToken(pageId);
  if (!token) throw new Error(`No token found for pageId ${pageId}`);

  const formData = new FormData();
  if (messageText) formData.append('message', messageText);

  if (fileBase64) {
    const buffer = Buffer.from(fileBase64, 'base64');
    const blob = new Blob([buffer], { type: mimeType || 'image/jpeg' });
    formData.append('source', blob, fileName || 'photo.jpg');
  }

  const url = `https://graph.facebook.com/v19.0/${commentId}/comments?access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method: 'POST', body: formData });
  const data = await res.json();

  if (data.error) throw new Error(data.error.message || 'Error replying to comment with attachment');
  return data;
}

/**
 * Graph API private reply to comment (used by CRM web app)
 */
export async function sendFacebookPrivateReply(pageId, commentId, messageText) {
  const token = getPageToken(pageId);
  if (!token) throw new Error(`No token found for pageId ${pageId}`);

  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { comment_id: commentId },
      message: { text: messageText },
      messaging_type: 'RESPONSE'
    })
  });
  const data = await res.json();

  if (data.error) {
    const msg = data.error.message || "";
    if (data.error.code === 10900 || msg.includes("already received a private reply")) {
      throw new Error("คอมเมนต์นี้เคยได้รับข้อความส่วนตัว (Private Reply) ไปแล้ว 1 ครั้ง ตามนโยบาย Facebook ไม่อนุญาตให้ส่งซ้ำ กรุณาตอบใต้คอมเมนต์หน้าเพจแทน");
    }
    throw new Error(msg || "Error sending private reply");
  }
  return data;
}

/**
 * React to a Facebook Messenger message (sender_action: react / unreact)
 */
export async function reactFacebookMessage(pageId, recipientPsid, messageMid, reaction = '❤️', isRemoving = false) {
  const token = getPageToken(pageId);
  if (!token) throw new Error(`No token found for pageId ${pageId}`);

  const postBody = {
    recipient: { id: recipientPsid },
    sender_action: isRemoving ? 'unreact' : 'react',
    payload: isRemoving ? { message_id: messageMid } : { message_id: messageMid, reaction }
  };

  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postBody)
  });
  const data = await res.json();
  if (data.error) {
    console.warn('Facebook Messenger react API warning:', data.error);
  }
  return data;
}

/**
 * React or like a Facebook post comment
 */
export async function reactFacebookComment(pageId, commentId, reaction = 'LIKE', isRemoving = false) {
  const token = getPageToken(pageId);
  if (!token) throw new Error(`No token found for pageId ${pageId}`);

  if (isRemoving) {
    const url = `https://graph.facebook.com/v19.0/${commentId}/likes?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { method: 'DELETE' });
    return await res.json();
  }

  let reactionType = 'LIKE';
  if (reaction === '❤️' || reaction === 'LOVE') reactionType = 'LOVE';
  else if (reaction === '😂' || reaction === 'HAHA') reactionType = 'HAHA';
  else if (reaction === '😮' || reaction === 'WOW') reactionType = 'WOW';
  else if (reaction === '😢' || reaction === 'SAD') reactionType = 'SAD';
  else if (reaction === '😡' || reaction === 'ANGRY') reactionType = 'ANGRY';

  try {
    const url = `https://graph.facebook.com/v19.0/${commentId}/reactions?type=${reactionType}&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
    if (!data.error) return data;
  } catch (e) {
    // fallback to likes
  }

  const likeUrl = `https://graph.facebook.com/v19.0/${commentId}/likes?access_token=${encodeURIComponent(token)}`;
  const likeRes = await fetch(likeUrl, { method: 'POST' });
  return await likeRes.json();
}
