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
      // Find customer sender (exclude the page itself)
      const customerSender = conv.senders?.data?.find(s => s.id !== pageId) || conv.senders?.data?.[0];
      const customerName = customerSender?.name || `ลูกค้า Facebook #${conv.id.slice(-4)}`;
      const customerEmail = customerSender?.email || '';

      // Try fetching conversation messages
      let messageList = [];
      try {
        const msgRes = await fetch(`https://graph.facebook.com/v19.0/${conv.id}/messages?fields=id,message,created_time,from&access_token=${encodeURIComponent(pageToken)}`);
        const msgData = await msgRes.json();
        if (msgData.data && Array.isArray(msgData.data)) {
          // Reverse so oldest is first
          messageList = msgData.data.reverse().map(m => {
            const isFromPage = m.from?.id === pageId;
            const msgDate = new Date(m.created_time);
            const timeStr = `${String(msgDate.getHours()).padStart(2, '0')}:${String(msgDate.getMinutes()).padStart(2, '0')}`;
            return {
              id: m.id,
              sender: isFromPage ? 'admin' : 'lead',
              adminName: isFromPage ? (pageName || 'แอดมินเพจ') : undefined,
              text: m.message || '(ไฟล์แนบ / สติกเกอร์)',
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
            time: 'ล่าสุด'
          }
        ];
      }

      const updateDate = conv.updated_time ? new Date(conv.updated_time) : new Date();
      const dateStr = updateDate.toISOString().slice(0, 10);
      const timeStr = `${String(updateDate.getHours()).padStart(2, '0')}:${String(updateDate.getMinutes()).padStart(2, '0')}`;

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
        inquiry: conv.snippet || 'สนใจสอบถามบริการ',
        dealValue: 0,
        status: conv.unread_count > 0 ? 'ทักใหม่ (New)' : 'ติดต่อแล้ว',
        date: dateStr,
        followUpDate: null,
        admin: 'ช่างเสือ ทาสี',
        notes: `ทักมาจากโฆษณา/Inbox หน้าเพจจริง (${conv.id})`,
        isLiveFacebookLead: true,
        unreadCount: conv.unread_count || 0,
        messages: messageList
      };
    });

    const results = await Promise.all(leadsPromises);
    return results;
  } catch (error) {
    console.error('Error fetching live Facebook conversations:', error);
    throw error;
  }
}
