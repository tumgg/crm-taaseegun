// Utility to fetch real live conversations and messages from Meta Graph API

export async function fetchLiveFacebookConversations(pageId, pageToken, pageName) {
  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=id,snippet,updated_time,unread_count,senders&access_token=${encodeURIComponent(pageToken)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Facebook API');
    }

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    // Process each conversation and fetch message details
    const leadsPromises = data.data.slice(0, 10).map(async (conv, idx) => {
      try {
        // Find customer sender (exclude the page itself)
        const customerSender = conv.senders?.data?.find(s => s.id !== pageId) || conv.senders?.data?.[0];
        const customerName = (customerSender?.name && customerSender.name.trim()) 
          ? customerSender.name.trim() 
          : `ลูกค้า Facebook #${conv.id ? conv.id.slice(-4) : 'Inbox'}`;
        const customerEmail = customerSender?.email || '';

        // Try fetching conversation messages with attachments
        let messageList = [];
        try {
          const msgRes = await fetch(`https://graph.facebook.com/v19.0/${conv.id}/messages?fields=id,message,created_time,from,attachments{id,mime_type,name,size,image_data,video_data,file_url}&access_token=${encodeURIComponent(pageToken)}`);
          const msgData = await msgRes.json();
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

              return {
                id: m.id || `msg-${Date.now()}-${Math.random()}`,
                sender: isFromPage ? 'admin' : 'lead',
                adminName: isFromPage ? (pageName || 'แอดมินเพจ') : undefined,
                text: text,
                attachments: parsedAttachments,
                time: timeStr
              };
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
              time: 'ล่าสุด'
            }
          ];
        }

        const updateDate = conv.updated_time ? new Date(conv.updated_time) : new Date();
        const dateStr = updateDate.toISOString().slice(0, 10);
        const timeStr = `${String(updateDate.getHours()).padStart(2, '0')}:${String(updateDate.getMinutes()).padStart(2, '0')}`;

        // Clean inquiry snippet if it had placeholder
        const latestMsg = messageList.length > 0 ? messageList[messageList.length - 1] : null;
        let cleanInquiry = (typeof conv.snippet === 'string' && conv.snippet.trim()) ? conv.snippet.trim() : 'สนใจสอบถามบริการ';
        if (latestMsg && latestMsg.attachments?.length > 0 && (!cleanInquiry || cleanInquiry.includes('ไฟล์แนบ') || cleanInquiry.includes('สติกเกอร์') || cleanInquiry === 'สนใจสอบถามบริการ')) {
          cleanInquiry = latestMsg.text;
        }

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
          followUpDate: null,
          admin: 'ช่างเสือ ทาสี',
          notes: `ทักมาจากโฆษณา/Inbox หน้าเพจจริง (${conv.id})`,
          isLiveFacebookLead: true,
          unreadCount: conv.unread_count || 0,
          tag: 'ลูกค้าเพจจริง',
          convId: conv.id,
          customerPsid: customerSender?.id || null,
          activePageToken: pageToken,
          messages: messageList
        };
      } catch (convErr) {
        console.warn('Failed parsing conversation', conv.id, convErr);
        return null;
      }
    });

    const results = (await Promise.all(leadsPromises)).filter(Boolean);
    return results;
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

export async function sendFacebookMessengerReply(pageToken, recipientPsid, messageText) {
  try {
    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(pageToken)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient: { id: recipientPsid },
        message: { text: messageText },
        messaging_type: 'RESPONSE'
      })
    });
    const data = await res.json();
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
