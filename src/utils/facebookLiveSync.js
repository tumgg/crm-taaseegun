// Utility to fetch real live conversations and messages from Meta Graph API

// Helper: Extract numeric millisecond timestamp of last activity from any lead object
export function getLeadTimestamp(lead) {
  if (!lead) return 0;

  // 1. Direct timestamp if valid number
  if (typeof lead.timestamp === 'number' && !isNaN(lead.timestamp) && lead.timestamp > 0) {
    if (Array.isArray(lead.messages) && lead.messages.length > 0) {
      const lastMsg = lead.messages[lead.messages.length - 1];
      if (lastMsg?.timestamp && lastMsg.timestamp > lead.timestamp) {
        return lastMsg.timestamp;
      }
    }
    return lead.timestamp;
  }

  // 2. updatedTime ISO string from Facebook Meta Graph API
  if (lead.updatedTime) {
    const t = new Date(lead.updatedTime).getTime();
    if (!isNaN(t) && t > 0) return t;
  }

  // 3. Check last message created_time or timestamp
  if (Array.isArray(lead.messages) && lead.messages.length > 0) {
    const lastMsg = lead.messages[lead.messages.length - 1];
    if (lastMsg) {
      if (lastMsg.timestamp && !isNaN(lastMsg.timestamp)) return lastMsg.timestamp;
      if (lastMsg.created_time) {
        const t = new Date(lastMsg.created_time).getTime();
        if (!isNaN(t) && t > 0) return t;
      }
    }
  }

  // 4. Parse lead.date (e.g. "2026-10-05 14:11" or ISO string)
  if (lead.date) {
    let parsed = new Date(lead.date).getTime();
    if (!isNaN(parsed) && parsed > 0) return parsed;

    const parts = String(lead.date).trim().split(' ');
    if (parts.length >= 2) {
      const dParts = parts[0].split('-');
      const tParts = parts[1].split(':');
      if (dParts.length === 3 && tParts.length >= 2) {
        const d = new Date(
          parseInt(dParts[0], 10),
          parseInt(dParts[1], 10) - 1,
          parseInt(dParts[2], 10),
          parseInt(tParts[0], 10),
          parseInt(tParts[1], 10)
        );
        if (!isNaN(d.getTime())) return d.getTime();
      }
    }
  }

  return 0;
}

// Helper: Always sort array of leads by newest activity first
export function sortLeadsByLatest(leads) {
  if (!Array.isArray(leads)) return [];
  return [...leads].sort((a, b) => getLeadTimestamp(b) - getLeadTimestamp(a));
}

// Persistent storage for message reply quotes so quotes are never lost during sync or page refresh
const REPLY_QUOTES_KEY = 'omnisocial_reply_quotes_map_v1';

export function saveReplyQuoteCache(key, replyToObj) {
  try {
    if (!key || !replyToObj) return;
    const raw = localStorage.getItem(REPLY_QUOTES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(key)] = replyToObj;
    localStorage.setItem(REPLY_QUOTES_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save reply quote to cache:', e);
  }
}

export function getReplyQuoteCache(key) {
  try {
    if (!key) return null;
    const raw = localStorage.getItem(REPLY_QUOTES_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[String(key)] || null;
  } catch (e) {
    return null;
  }
}

// Helper: Format conversation time friendly (e.g., 2 นาทีก่อน, 14:49, เมื่อวาน, 24 ก.ย.)
export function formatConversationTime(lead) {
  const ts = getLeadTimestamp(lead);
  if (!ts) {
    return lead?.date?.split(' ')[1] || 'เมื่อสักครู่';
  }

  const msgDate = new Date(ts);
  const now = new Date();

  const diffMs = now.getTime() - ts;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'เมื่อสักครู่';
  if (diffMinutes < 60) return `${diffMinutes} นาทีก่อน`;

  const isToday =
    msgDate.getDate() === now.getDate() &&
    msgDate.getMonth() === now.getMonth() &&
    msgDate.getFullYear() === now.getFullYear();

  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(msgDate.getHours())}:${pad(msgDate.getMinutes())}`;

  if (isToday) return timeStr;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    msgDate.getDate() === yesterday.getDate() &&
    msgDate.getMonth() === yesterday.getMonth() &&
    msgDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return `เมื่อวาน ${timeStr}`;

  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  if (msgDate.getFullYear() === now.getFullYear()) {
    return `${msgDate.getDate()} ${thaiMonths[msgDate.getMonth()]}`;
  }

  const thaiShortYear = (msgDate.getFullYear() + 543) % 100;
  return `${msgDate.getDate()} ${thaiMonths[msgDate.getMonth()]} ${thaiShortYear}`;
}

export async function fetchLiveFacebookConversations(pageId, pageToken, pageName) {
  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=id,snippet,updated_time,unread_count,senders{id,name,email,picture}&access_token=${encodeURIComponent(pageToken)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Facebook API');
    }

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    // Process each conversation and fetch message details (top 15 conversations per page)
    const leadsPromises = data.data.slice(0, 15).map(async (conv, idx) => {
      try {
        // Find customer sender (exclude the page itself)
        const customerSender = conv.senders?.data?.find(s => s.id !== pageId) || conv.senders?.data?.[0];
        const customerName = (customerSender?.name && customerSender.name.trim()) 
          ? customerSender.name.trim() 
          : `ลูกค้า Facebook #${conv.id ? conv.id.slice(-4) : 'Inbox'}`;
        const customerEmail = customerSender?.email || '';
        const customerAvatar = customerSender?.picture?.data?.url || null;

        // Try fetching conversation messages with attachments and reply_to quotes
        let messageList = [];
        try {
          let msgData = null;
          try {
            const msgRes = await fetch(`https://graph.facebook.com/v19.0/${conv.id}/messages?fields=id,message,created_time,from,reply_to,attachments{id,mime_type,name,size,image_data,video_data,file_url}&access_token=${encodeURIComponent(pageToken)}`);
            msgData = await msgRes.json();
          } catch (fetchErr) {
            console.warn('Initial fetch with reply_to failed, retrying without reply_to:', fetchErr);
          }

          if (!msgData || msgData.error) {
            const fallbackRes = await fetch(`https://graph.facebook.com/v19.0/${conv.id}/messages?fields=id,message,created_time,from,attachments{id,mime_type,name,size,image_data,video_data,file_url}&access_token=${encodeURIComponent(pageToken)}`);
            msgData = await fallbackRes.json();
          }

          if (msgData.data && Array.isArray(msgData.data)) {
            // Reverse so oldest is first
            messageList = msgData.data.reverse().map(m => {
              const isFromPage = m.from?.id === pageId;
              const msgDate = m.created_time ? new Date(m.created_time) : new Date();
              const timeStr = `${String(msgDate.getHours()).padStart(2, '0')}:${String(msgDate.getMinutes()).padStart(2, '0')}`;

              // Parse attachments (photos, videos, audio, documents, stickers)
              const rawAtts = m.attachments?.data || [];
              const parsedAttachments = rawAtts.map(att => normalizeAttachment(att)).filter(Boolean);

              let text = typeof m.message === 'string' && m.message.trim() ? m.message.trim() : '';
              if (!text && parsedAttachments.length > 0) {
                if (parsedAttachments.some(a => a.isSticker)) {
                  text = '🏷️ สติกเกอร์';
                } else if (parsedAttachments.some(a => a.type === 'image')) {
                  text = '🖼️ รูปภาพ';
                } else if (parsedAttachments.some(a => a.type === 'video')) {
                  text = '🎥 วิดีโอ';
                } else {
                  text = '📎 ไฟล์แนบ';
                }
              } else if (!text) {
                text = '(ข้อความว่าง)';
              }

              // Extract reply_to info from Facebook Messenger payload if present
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

              // Check persistent reply quote cache if Facebook Graph API didn't return reply_to
              if (!parsedReplyTo && m.id) {
                parsedReplyTo = getReplyQuoteCache(m.id) || getReplyQuoteCache(`${conv.id}_${text}`) || null;
              }
              if (parsedReplyTo && m.id) {
                saveReplyQuoteCache(m.id, parsedReplyTo);
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

            // Post-process to resolve any replyTo against the messages in this thread
            messageList.forEach(item => {
              if (item.replyTo) {
                const ref = messageList.find(target => target.id === item.replyTo.id || target.id === item.replyTo.mid);
                if (ref) {
                  if (!item.replyTo.text || item.replyTo.text === '') {
                    item.replyTo.text = ref.text;
                  }
                  item.replyTo.sender = ref.sender;
                  item.replyTo.name = ref.sender === 'admin' ? (ref.adminName || 'คุณ (แอดมิน)') : customerName;
                  item.replyTo.attachments = ref.attachments;
                }
                if (item.id) {
                  saveReplyQuoteCache(item.id, item.replyTo);
                }
              }
            });
          }
        } catch (err) {
          console.warn('Could not fetch message details for conv', conv.id, err);
        }

        // Default message if fetch details failed
        if (messageList.length === 0 && conv.snippet) {
          messageList = [
            {
              id: `msg-${conv.id}`,
              sender: 'lead',
              text: conv.snippet,
              attachments: [],
              time: 'ล่าสุด',
              timestamp: conv.updated_time ? new Date(conv.updated_time).getTime() : Date.now()
            }
          ];
        }

        const updateDate = conv.updated_time ? new Date(conv.updated_time) : new Date();
        const convTimestamp = !isNaN(updateDate.getTime()) ? updateDate.getTime() : Date.now();
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${updateDate.getFullYear()}-${pad(updateDate.getMonth() + 1)}-${pad(updateDate.getDate())}`;
        const timeStr = `${pad(updateDate.getHours())}:${pad(updateDate.getMinutes())}`;

        // Clean inquiry snippet if it had placeholder
        const latestMsg = messageList.length > 0 ? messageList[messageList.length - 1] : null;
        let cleanInquiry = (typeof conv.snippet === 'string' && conv.snippet.trim()) ? conv.snippet.trim() : 'สนใจสอบถามบริการ';
        if (latestMsg && latestMsg.attachments?.length > 0 && (!cleanInquiry || cleanInquiry.includes('ไฟล์แนบ') || cleanInquiry.includes('สติกเกอร์') || cleanInquiry === 'สนใจสอบถามบริการ')) {
          cleanInquiry = latestMsg.text;
        }

        const latestMsgTime = latestMsg?.timestamp || (latestMsg?.created_time ? new Date(latestMsg.created_time).getTime() : 0);
        const effectiveTimestamp = Math.max(convTimestamp, latestMsgTime || 0);

        return {
          id: `fb-live-${conv.id}`,
          name: customerName,
          platform: 'facebook',
          channel: pageId,
          channelName: pageName || 'เพจ Facebook จริง',
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
          activePageToken: pageToken,
          messages: messageList
        };
      } catch (convErr) {
        console.warn('Failed parsing conversation', conv.id, convErr);
        return null;
      }
    });

    const results = (await Promise.all(leadsPromises)).filter(Boolean);
    return sortLeadsByLatest(results);
  } catch (error) {
    console.error('Error fetching live Facebook conversations:', error);
    throw error;
  }
}

// Normalize any attachment object from Graph API, Webhook, or local upload
export function normalizeAttachment(att) {
  if (!att) return null;

  // Graph API format (image_data, video_data, file_url)
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

  // Webhook format: { type: 'image', payload: { url: '...', sticker_id: ... } }
  if (att.payload || att.type) {
    const type = att.type || 'file';
    const isSticker = !!att.payload?.sticker_id || type === 'sticker';
    const directUrl = att.payload?.url || att.url;
    return {
      id: String(att.payload?.sticker_id || att.id || `att-${Date.now()}-${Math.random()}`),
      type: isSticker ? 'image' : type,
      mimeType: type === 'image' ? 'image/jpeg' : (type === 'video' ? 'video/mp4' : 'application/octet-stream'),
      name: att.name || (type === 'image' ? (isSticker ? 'สติกเกอร์' : 'รูปภาพ') : (type === 'video' ? 'วิดีโอ' : 'ไฟล์แนบ')),
      size: att.size || null,
      url: directUrl,
      previewUrl: directUrl,
      isSticker: isSticker
    };
  }

  // Fallback generic format
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

export async function sendFacebookMessengerReply(pageToken, recipientPsid, messageText, replyToMid = null) {
  try {
    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(pageToken)}`;
    const postBody = {
      recipient: { id: recipientPsid },
      message: { text: messageText },
      messaging_type: 'RESPONSE'
    };

    // In Facebook Send API, reply_to must be at the root of the JSON payload
    if (replyToMid && typeof replyToMid === 'string' && !replyToMid.startsWith('msg-') && !replyToMid.startsWith('att-')) {
      postBody.reply_to = { mid: replyToMid };
    }

    let res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    });
    let data = await res.json();

    // Fallback: If Facebook returns an error specifically because of reply_to, retry sending without reply_to
    if (data.error && postBody.reply_to) {
      console.warn('Facebook reply_to rejected, retrying without reply_to:', data.error);
      delete postBody.reply_to;
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postBody)
      });
      data = await res.json();
    }

    if (data.error) {
      throw new Error(data.error.message || 'ไม่สามารถส่งข้อความผ่าน Facebook API ได้');
    }
    return data;
  } catch (err) {
    console.error('Error sending Facebook Messenger reply:', err);
    throw err;
  }
}

// Send File / Photo / Video / Document attachment directly to customer's Messenger inbox
export async function sendFacebookAttachment(pageToken, recipientPsid, file) {
  try {
    let fileType = 'file';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    }

    const formData = new FormData();
    formData.append('recipient', JSON.stringify({ id: recipientPsid }));
    formData.append('message', JSON.stringify({
      attachment: {
        type: fileType,
        payload: {
          is_reusable: true
        }
      }
    }));
    formData.append('filedata', file);

    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(pageToken)}`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || 'ไม่สามารถส่งไฟล์แนบผ่าน Facebook API ได้');
    }
    return data;
  } catch (err) {
    console.error('Error sending Facebook attachment:', err);
    throw err;
  }
}

// 1. Reply publicly under a post comment (text only)
export async function replyToFacebookComment(pageToken, commentId, messageText) {
  try {
    const url = `https://graph.facebook.com/v19.0/${commentId}/comments?access_token=${encodeURIComponent(pageToken)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: messageText
      })
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || 'ไม่สามารถตอบใต้คอมเมนต์ผ่าน Facebook API ได้');
    }
    return data;
  } catch (err) {
    console.error('Error replying to Facebook comment:', err);
    throw err;
  }
}

// Reply publicly under a post comment with an image attachment
export async function replyToFacebookCommentWithAttachment(pageToken, commentId, file, messageText = '') {
  try {
    const formData = new FormData();
    if (messageText) {
      formData.append('message', messageText);
    }
    formData.append('source', file);

    const url = `https://graph.facebook.com/v19.0/${commentId}/comments?access_token=${encodeURIComponent(pageToken)}`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || 'ไม่สามารถส่งรูปภาพตอบกลับคอมเมนต์ได้');
    }
    return data;
  } catch (err) {
    console.error('Error replying to Facebook comment with attachment:', err);
    throw err;
  }
}

// 2. Reply privately into customer's Messenger Inbox from a post comment
export async function sendFacebookPrivateReply(pageToken, commentId, messageText) {
  try {
    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(pageToken)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: { comment_id: commentId },
        message: { text: messageText }
      })
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || 'ไม่สามารถส่งข้อความส่วนตัวเข้า Inbox จากคอมเมนต์ได้');
    }
    return data;
  } catch (err) {
    console.error('Error sending private reply to comment:', err);
    throw err;
  }
}
