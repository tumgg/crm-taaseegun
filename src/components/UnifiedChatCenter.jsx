import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Search, 
  MessageSquare, 
  FileText, 
  Video, 
  Check, 
  CheckCheck, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Paperclip, 
  Smile, 
  User, 
  Phone, 
  Mail, 
  Tag, 
  DollarSign, 
  AlertCircle,
  CornerDownRight,
  ShieldCheck,
  ChevronRight,
  Filter,
  Volume2,
  VolumeX,
  Calendar,
  Bell,
  Zap,
  Bot,
  RefreshCw
} from 'lucide-react';
import { 
  leadStatusOptions, 
  quickReplyTemplates, 
  interactionTypeOptions,
  REAL_GOOD_VIBES_PAGE_ID,
  REAL_GOOD_VIBES_TOKEN,
  REAL_TAASEEGUN_PAGE_ID,
  REAL_TAASEEGUN_TOKEN,
  REAL_ROOMS_PAINTING_PAGE_ID,
  REAL_ROOMS_PAINTING_TOKEN,
  REAL_TEXTURE_BEAR_PAGE_ID,
  REAL_TEXTURE_BEAR_TOKEN
} from '../data/mockData';
import { playNotificationSound } from '../utils/sound';
import { analyzeMessageIntent, generateAIDraftReply } from '../utils/aiAssistant';
import { fetchLiveFacebookConversations, sendFacebookMessengerReply } from '../utils/facebookLiveSync';
import { supabase } from '../utils/supabaseClient';

export default function UnifiedChatCenter({ 
  leads, 
  setLeads, 
  facebookPages, 
  selectedLeadId, 
  setSelectedLeadId,
  currentUser 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'inbox', 'video_comment', 'post_comment', 'due_followup'
  const [filterChannel, setFilterChannel] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [replyMode, setReplyMode] = useState('inbox'); // 'inbox' (Private) or 'comment' (Public reply)
  const [activeAdminName, setActiveAdminName] = useState(currentUser?.name || 'แอดมินนนท์');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAutoPilotEnabled, setIsAutoPilotEnabled] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [isSyncingFb, setIsSyncingFb] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);

  // Sync real live conversations from Meta Graph API for all connected pages
  const handleSyncRealFacebook = async (silent = false) => {
    const isValidToken = (t) => typeof t === 'string' && t.startsWith('EAA') && !t.includes('...') && t.length > 50;

    // Collect all pages with verified tokens
    let pagesToSync = (facebookPages || []).filter(p => isValidToken(p.activePageToken));

    // Ensure Good Vibes is included
    if (!pagesToSync.some(p => p.id === REAL_GOOD_VIBES_PAGE_ID)) {
      pagesToSync.push({
        id: REAL_GOOD_VIBES_PAGE_ID,
        name: 'รับพ่นสี Texture ฉาบเทคเจอร์ ราคาถูก By Good Vibes',
        activePageToken: REAL_GOOD_VIBES_TOKEN
      });
    }

    // Ensure Taaseegun is included
    if (!pagesToSync.some(p => p.id === REAL_TAASEEGUN_PAGE_ID)) {
      pagesToSync.push({
        id: REAL_TAASEEGUN_PAGE_ID,
        name: 'บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี',
        activePageToken: REAL_TAASEEGUN_TOKEN
      });
    }

    // Ensure RoomsPainting is included
    if (!pagesToSync.some(p => p.id === REAL_ROOMS_PAINTING_PAGE_ID)) {
      pagesToSync.push({
        id: REAL_ROOMS_PAINTING_PAGE_ID,
        name: 'ทาสีคอนโด ทาสีภายใน - RoomsPainting',
        activePageToken: REAL_ROOMS_PAINTING_TOKEN
      });
    }

    // Ensure Texture Bear (ช่างหมี) is included
    if (!pagesToSync.some(p => p.id === REAL_TEXTURE_BEAR_PAGE_ID)) {
      pagesToSync.push({
        id: REAL_TEXTURE_BEAR_PAGE_ID,
        name: 'รับทำสีเทกเจอร์ texture สีตกแต่งพิเศษ by ช่างหมี',
        activePageToken: REAL_TEXTURE_BEAR_TOKEN
      });
    }

    if (!silent) setIsSyncingFb(true);
    try {
      const syncPromises = pagesToSync.map(async (page) => {
        try {
          const pageLeads = await fetchLiveFacebookConversations(page.id, page.activePageToken, page.name);
          return { pageName: page.name, leads: pageLeads, error: null };
        } catch (err) {
          console.warn(`Sync error for ${page.name}:`, err);
          return { pageName: page.name, leads: [], error: err.message };
        }
      });

      const results = await Promise.all(syncPromises);
      let allNewLeads = [];
      let pageSummaries = [];

      for (const res of results) {
        if (res.leads.length > 0) {
          allNewLeads.push(...res.leads);
          const shortName = res.pageName.includes('Good Vibes') 
            ? 'Good Vibes' 
            : res.pageName.includes('ทาสีกัน') 
              ? 'ทาสีกัน' 
              : res.pageName.includes('RoomsPainting') 
                ? 'RoomsPainting' 
                : res.pageName.includes('ช่างหมี')
                  ? 'ช่างหมี'
                  : res.pageName;
          pageSummaries.push(`${shortName}: ${res.leads.length} แชท`);
        }
      }

      if (allNewLeads.length === 0) {
        if (!silent) alert('เชื่อมต่อสำเร็จ แต่ยังไม่มีบทสนทนาใหม่ใน Inbox ของเพจที่เชื่อมต่อครับ');
      } else {
        let hasNewUpdates = false;
        let newLeadsCount = 0;

        setLeads(prev => {
          const incomingMap = new Map(allNewLeads.map(l => [l.id, l]));
          
          // Update existing conversations with latest messages from Facebook
          const updatedExisting = prev.map(oldLead => {
            const incoming = incomingMap.get(oldLead.id);
            if (!incoming) return oldLead;
            incomingMap.delete(oldLead.id);

            const oldMsgCount = oldLead.messages?.length || 0;
            const newMsgCount = incoming.messages?.length || 0;
            if (newMsgCount > oldMsgCount) {
              hasNewUpdates = true;
            }

            return {
              ...oldLead,
              inquiry: incoming.inquiry || oldLead.inquiry,
              date: incoming.date || oldLead.date,
              unreadCount: incoming.unreadCount ?? oldLead.unreadCount,
              status: (incoming.unreadCount && incoming.unreadCount > 0) ? 'ทักใหม่ (New)' : oldLead.status,
              customerPsid: incoming.customerPsid || oldLead.customerPsid,
              activePageToken: incoming.activePageToken || oldLead.activePageToken,
              messages: (incoming.messages && incoming.messages.length > 0)
                ? incoming.messages 
                : oldLead.messages
            };
          });

          // Brand new leads that were not in state yet
          const completelyNew = Array.from(incomingMap.values());
          newLeadsCount = completelyNew.length;
          if (newLeadsCount > 0) hasNewUpdates = true;

          return [...completelyNew, ...updatedExisting];
        });

        if (isSoundEnabled && (hasNewUpdates || !silent)) {
          playNotificationSound();
        }

        if (!silent || hasNewUpdates) {
          if (newLeadsCount > 0 && allNewLeads.length > 0) {
            setSelectedLeadId(allNewLeads[0].id);
          }
          setToastNotification(hasNewUpdates 
            ? `🔔 มีข้อความใหม่เข้ามา! (${pageSummaries.join(', ')})`
            : `🎉 ซิงค์แชทสดสำเร็จ! รวม ${allNewLeads.length} แชทจริงจาก Facebook (${pageSummaries.join(', ')})`);
          setTimeout(() => setToastNotification(null), 5000);
        }
      }
    } catch (err) {
      if (!silent) alert(`ไม่สามารถดึงข้อมูลจาก Facebook API ได้: ${err.message}`);
    } finally {
      if (!silent) setIsSyncingFb(false);
    }
  };

  // Background Auto-sync effect (every 30 seconds if enabled)
  useEffect(() => {
    if (!isAutoSyncEnabled) return;
    const interval = setInterval(() => {
      handleSyncRealFacebook(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [isAutoSyncEnabled, facebookPages, isSoundEnabled]);

  const [isRealtimeWebhookActive, setIsRealtimeWebhookActive] = useState(false);

  // Subscribe to Instant 1-Second Real-Time Webhook Messages via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('live-facebook-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_facebook_messages' },
        (payload) => {
          const newRow = payload.new;
          if (!newRow) return;

          console.log('⚡ [1-Second Realtime Event Received]:', newRow);
          setIsRealtimeWebhookActive(true);

          const timeStr = new Date(newRow.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = new Date(newRow.created_at || Date.now()).toISOString().slice(0, 10);

          const newIncomingMessage = {
            id: newRow.message_mid || `msg-${Date.now()}`,
            sender: 'lead',
            text: newRow.message_text,
            time: timeStr
          };

          const matchedPageName = newRow.raw_event?.pageName || 
            (newRow.page_id === REAL_GOOD_VIBES_PAGE_ID ? 'Good Vibes' :
             newRow.page_id === REAL_TAASEEGUN_PAGE_ID ? 'ทาสีกัน' :
             newRow.page_id === REAL_ROOMS_PAINTING_PAGE_ID ? 'RoomsPainting' :
             newRow.page_id === REAL_TEXTURE_BEAR_PAGE_ID ? 'ช่างหมี เทกเจอร์' : 'เพจ Facebook');

          let isFound = false;

          setLeads((prev) => {
            const updated = prev.map((lead) => {
              const isMatch = (lead.customerPsid && lead.customerPsid === newRow.sender_psid) ||
                (lead.id && lead.id.includes(newRow.sender_psid)) ||
                (lead.name && newRow.sender_name && lead.name === newRow.sender_name);

              if (isMatch) {
                isFound = true;
                const existingMsgs = lead.messages || [];
                if (existingMsgs.some(m => m.id === newIncomingMessage.id || (m.text === newIncomingMessage.text && m.time === newIncomingMessage.time))) {
                  return lead;
                }
                return {
                  ...lead,
                  inquiry: newRow.message_text,
                  date: `${dateStr} ${timeStr}`,
                  status: 'ทักใหม่ (New)',
                  customerPsid: newRow.sender_psid,
                  messages: [...existingMsgs, newIncomingMessage]
                };
              }
              return lead;
            });

            if (!isFound) {
              const brandNewLead = {
                id: `fb-live-${newRow.sender_psid}`,
                name: newRow.sender_name || `ลูกค้าใหม่ Facebook #${newRow.sender_psid.slice(-4)}`,
                platform: 'facebook',
                channel: newRow.page_id,
                channelName: matchedPageName,
                sourceType: 'inbox',
                sourceTitle: 'Messenger Inbox (Live 1s)',
                sourceLink: `https://www.facebook.com/${newRow.page_id}/inbox/`,
                contact: 'Facebook Messenger',
                inquiry: newRow.message_text,
                dealValue: 0,
                status: 'ทักใหม่ (New)',
                date: `${dateStr} ${timeStr}`,
                followUpDate: null,
                admin: 'แอดมินเพจ',
                notes: `ทักสดผ่าน Webhook จากเพจ ${matchedPageName}`,
                isLiveFacebookLead: true,
                unreadCount: 1,
                tag: 'ลูกค้าใหม่สดๆ 1 วิ',
                customerPsid: newRow.sender_psid,
                messages: [newIncomingMessage]
              };
              return [brandNewLead, ...updated];
            }

            return updated;
          });

          if (isSoundEnabled) {
            playNotificationSound();
          }

          setToastNotification(`⚡ [สด 1 วินาที] ข้อความใหม่จาก "${newRow.sender_name || 'ลูกค้า'}" (${matchedPageName}): "${newRow.message_text}"`);
          setTimeout(() => setToastNotification(null), 6000);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeWebhookActive(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSoundEnabled]);
  
  const chatMessagesContainerRef = useRef(null);

  // Default active lead selection
  const activeLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  // Auto scroll to bottom of chat messages container ONLY (without scrolling the browser window)
  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [activeLead?.messages, activeLead?.id]);

  // Check if a lead has follow-up due
  const isFollowUpDue = (followUpDate) => {
    if (!followUpDate) return false;
    const target = new Date(followUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target <= today;
  };

  // Filter conversations
  const filteredConversations = leads.filter(lead => {
    const matchesSearch = 
      (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.inquiry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.sourceTitle && lead.sourceTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesType = true;
    if (filterType === 'due_followup') {
      matchesType = isFollowUpDue(lead.followUpDate);
    } else if (filterType !== 'all') {
      matchesType = lead.sourceType === filterType;
    }

    const matchesChannel = filterChannel === 'all' || (filterChannel === 'all-fb' ? lead.platform === 'facebook' : lead.channel === filterChannel);

    return matchesSearch && matchesType && matchesChannel;
  });

  // Intent analysis of current active lead
  const currentIntent = activeLead ? analyzeMessageIntent(
    activeLead.messages && activeLead.messages.length > 0 
      ? activeLead.messages[activeLead.messages.length - 1].text 
      : activeLead.inquiry
  ) : null;

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !activeLead) return;

    const messageTextToSend = replyText.trim();
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: messageTextToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      adminName: activeAdminName,
      isCommentReply: replyMode === 'comment'
    };

    const updatedLeads = leads.map(lead => {
      if (lead.id === activeLead.id) {
        const existingMessages = lead.messages || [];
        const nextStatus = lead.status.includes('New') || lead.status.includes('ทักใหม่')
          ? 'ติดต่อกลับแล้ว (Contacted)'
          : lead.status;

        return {
          ...lead,
          status: nextStatus,
          messages: [...existingMessages, newMessage]
        };
      }
      return lead;
    });

    setLeads(updatedLeads);
    setReplyText('');

    // If real live Facebook lead with customerPsid, attempt real API message delivery
    if (activeLead.customerPsid && replyMode === 'inbox') {
      const pageToken = activeLead.activePageToken || 
        (activeLead.channel === REAL_GOOD_VIBES_PAGE_ID ? REAL_GOOD_VIBES_TOKEN :
         activeLead.channel === REAL_TAASEEGUN_PAGE_ID ? REAL_TAASEEGUN_TOKEN :
         activeLead.channel === REAL_ROOMS_PAINTING_PAGE_ID ? REAL_ROOMS_PAINTING_TOKEN :
         activeLead.channel === REAL_TEXTURE_BEAR_PAGE_ID ? REAL_TEXTURE_BEAR_TOKEN : null);

      if (pageToken) {
        try {
          await sendFacebookMessengerReply(pageToken, activeLead.customerPsid, messageTextToSend);
          setToastNotification(`✅ ส่งข้อความตรงเข้า Facebook Messenger ของ ${activeLead.name} สำเร็จ!`);
          setTimeout(() => setToastNotification(null), 5000);
        } catch (sendErr) {
          console.warn('Facebook Messenger send warning:', sendErr);
          setToastNotification(`บันทึกในระบบแล้ว (หมายเหตุ Facebook API: ${sendErr.message || 'ลูกค้าทักมาเกิน 24 ชม.'})`);
          setTimeout(() => setToastNotification(null), 6000);
        }
      }
    }
  };

  // AI Smart Draft Reply Generator
  const handleGenerateAiDraft = () => {
    if (!activeLead) return;
    setIsAiGenerating(true);
    setTimeout(() => {
      const draft = generateAIDraftReply(activeLead);
      setReplyText(draft);
      setIsAiGenerating(false);
    }, 400);
  };

  // Quick Reply Template inserter
  const handleApplyQuickReply = (text) => {
    setReplyText(prev => prev ? `${prev} ${text}` : text);
  };

  // Set Follow-up Date Helper
  const handleSetFollowUpDays = (days) => {
    if (!activeLead) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const dateStr = targetDate.toISOString().slice(0, 10);
    handleUpdateLeadField('followUpDate', dateStr);
    setToastNotification(`ตั้งเตือนติดตามผลกับ "${activeLead.name}" วันที่ ${dateStr} เรียบร้อยแล้ว`);
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Update Lead Field
  const handleUpdateLeadField = (field, value) => {
    if (!activeLead) return;
    setLeads(prev => prev.map(l => l.id === activeLead.id ? { ...l, [field]: value } : l));
  };

  // Simulate incoming live customer message / comment (DEMO LIVE TEST)
  const handleSimulateIncomingMessage = () => {
    const mockInbounds = [
      {
        name: 'คุณพัชรินทร์ (เจ้าของแบรนด์ Beauty)',
        platform: 'facebook',
        channel: 'fb-page-1',
        channelName: 'FB: เพจหลัก Tech & Lifestyle',
        sourceType: 'inbox',
        sourceTitle: 'Messenger แชทสด',
        contact: '087-999-1234 / Line: patcha_brand',
        inquiry: 'สวัสดีค่ะ สนใจลงโฆษณาคลิป YouTube เดือนหน้า มีแพ็กเกจรวมโพสต์เพจด้วยไหมคะ ขอเรทการ์ดด่วนค่ะ',
        tag: 'Sponsorship / Media',
        dealValue: 50000
      },
      {
        name: 'คุณธนกร',
        platform: 'facebook',
        channel: 'fb-page-2',
        channelName: 'FB: เพจรีวิว Gadget Review',
        sourceType: 'video_comment',
        sourceTitle: 'คลิป Reels: แกะกล่องเคสกันกระแทกไทเทเนียม',
        contact: 'FB Profile: Thanakorn K.',
        inquiry: 'คอมเมนต์ใต้ Reels: ตัวในคลิปราคาเท่าไหร่ครับ มีของพร้อมส่งไหม ขอพิกัดสั่งซื้อหน่อยครับ',
        tag: 'Product Inquiry',
        dealValue: 1490
      }
    ];

    const pick = mockInbounds[Math.floor(Math.random() * mockInbounds.length)];
    const newId = `lead-sim-${Date.now()}`;
    const newLead = {
      ...pick,
      id: newId,
      status: 'ทักใหม่ (New)',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      admin: 'ยังไม่ได้มอบหมาย',
      notes: 'ลูกค้าทักเข้ามาสดๆ ผ่านระบบ Realtime',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          text: pick.inquiry,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isComment: pick.sourceType === 'video_comment'
        }
      ]
    };

    // Play chime sound if enabled
    if (isSoundEnabled) {
      playNotificationSound();
    }

    setToastNotification(`🔔 มีข้อความใหม่จาก ${newLead.name} (${newLead.channelName})`);
    setTimeout(() => setToastNotification(null), 4000);

    // If auto-pilot enabled, reply automatically after 1 second!
    if (isAutoPilotEnabled) {
      setTimeout(() => {
        const autoReply = generateAIDraftReply(newLead);
        newLead.messages.push({
          id: `msg-auto-${Date.now()}`,
          sender: 'admin',
          text: autoReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          adminName: '🤖 AI Auto-Pilot',
          isCommentReply: newLead.sourceType === 'video_comment'
        });
        newLead.status = 'ติดต่อกลับแล้ว (Contacted)';
        newLead.notes += ' | AI Auto-Pilot ตอบกลับเรียบร้อยแล้ว';
        setLeads(prev => [newLead, ...prev]);
        setSelectedLeadId(newId);
        if (isSoundEnabled) playNotificationSound();
      }, 1000);
    } else {
      setLeads(prev => [newLead, ...prev]);
      setSelectedLeadId(newId);
    }
  };

  // Helper for source type badge
  const renderSourceTypeBadge = (sourceType) => {
    if (sourceType === 'inbox') {
      return (
        <span style={{ fontSize: '0.72rem', color: '#1877f2', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <MessageSquare size={12} /> Inbox แชท
        </span>
      );
    }
    if (sourceType === 'video_comment') {
      return (
        <span style={{ fontSize: '0.72rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Video size={12} /> คอมเมนต์ใต้คลิป
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.72rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <FileText size={12} /> คอมเมนต์หน้าเพจ
      </span>
    );
  };

  const dueFollowUpsCount = leads.filter(l => isFollowUpDue(l.followUpDate)).length;

  return (
    <div className="animate-fade-in chat-center-root" style={{ position: 'relative' }}>
      {/* Toast Notification Alert */}
      {toastNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 1000,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-xl)',
          fontWeight: '600',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid #334155'
        }}>
          <Bell size={18} color="#f59e0b" />
          <span>{typeof toastNotification === 'object' && toastNotification !== null ? `${toastNotification.title || ''} ${toastNotification.message || ''}` : toastNotification}</span>
        </div>
      )}

      {/* Top Controls Bar for Live Chat Center */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '6px 14px',
        marginBottom: '8px',
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-dot"></span> Live Inbox Active
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setIsSoundEnabled(!isSoundEnabled);
              if (!isSoundEnabled) playNotificationSound();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: isSoundEnabled ? '#eff6ff' : '#f1f5f9',
              color: isSoundEnabled ? '#1d4ed8' : '#64748b',
              fontSize: '0.78rem',
              fontWeight: '600',
              border: isSoundEnabled ? '1px solid #bfdbfe' : '1px solid #cbd5e1'
            }}
            title="เปิด/ปิดเสียงแจ้งเตือนเมื่อมีลูกค้าทักเข้ามา"
          >
            {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            เสียงเตือน: {isSoundEnabled ? 'เปิด (มีเสียง)' : 'ปิด'}
          </button>

          {/* AI Auto-Pilot Mode Toggle */}
          <button
            onClick={() => setIsAutoPilotEnabled(!isAutoPilotEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: isAutoPilotEnabled ? '#ecfdf5' : '#f8fafc',
              color: isAutoPilotEnabled ? '#059669' : '#64748b',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: isAutoPilotEnabled ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
            }}
            title="เมื่อเปิดใช้งาน AI จะตอบข้อความแรกให้ลูกค้าทันทีใน 1 วินาที"
          >
            <Bot size={14} />
            AI Auto-Pilot: {isAutoPilotEnabled ? 'ON (ตอบอัตโนมัติ)' : 'OFF'}
          </button>
        </div>

        {/* Live Sync Real Facebook & Simulation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSyncRealFacebook(false)}
            disabled={isSyncingFb}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: 'none',
              boxShadow: '0 2px 8px rgba(24, 119, 242, 0.35)',
              cursor: isSyncingFb ? 'not-allowed' : 'pointer',
              opacity: isSyncingFb ? 0.75 : 1
            }}
            title="ดึงข้อความจริงล่าสุดจาก Inbox ทุกเพจ Facebook ที่เชื่อมต่อไว้ (Good Vibes, ทาสีกัน, RoomsPainting & ช่างหมี เทกเจอร์)"
          >
            <RefreshCw size={14} className={isSyncingFb ? "animate-spin" : ""} />
            {isSyncingFb ? 'กำลังดึงแชทสดทุกเพจ...' : '⚡ ดึงแชทสด Facebook (4 เพจ)'}
          </button>

          {/* Auto-Sync Toggle Button */}
          <button
            onClick={() => {
              const nextState = !isAutoSyncEnabled;
              setIsAutoSyncEnabled(nextState);
              if (nextState) {
                setToastNotification('🟢 เปิดระบบ Auto-Sync: คอยดึงแชทใหม่ทุก 30 วินาทีอัตโนมัติ');
                setTimeout(() => setToastNotification(null), 4000);
              } else {
                setToastNotification('⚪ ปิดระบบ Auto-Sync เรียบร้อย');
                setTimeout(() => setToastNotification(null), 3000);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 11px',
              borderRadius: '8px',
              backgroundColor: isAutoSyncEnabled ? '#ecfdf5' : '#f8fafc',
              color: isAutoSyncEnabled ? '#059669' : '#64748b',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: isAutoSyncEnabled ? '1.5px solid #10b981' : '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
            title="เปิด/ปิดการเช็กแชทใหม่ให้อัตโนมัติทุก 30 วินาทีในพื้นหลัง"
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isAutoSyncEnabled ? '#10b981' : '#94a3b8',
              display: 'inline-block'
            }} />
            Auto-Sync 30s: {isAutoSyncEnabled ? 'ON' : 'OFF'}
          </button>

          {/* Instant 1-Second Real-Time Webhook Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 11px',
              borderRadius: '8px',
              backgroundColor: isRealtimeWebhookActive ? '#f0fdf4' : '#f8fafc',
              color: isRealtimeWebhookActive ? '#15803d' : '#64748b',
              fontSize: '0.76rem',
              fontWeight: '700',
              border: isRealtimeWebhookActive ? '1.5px solid #86efac' : '1px solid #cbd5e1'
            }}
            title="ระบบ Webhook เชื่อมต่อสดกับ Supabase Realtime พร้อมผลักข้อความลูกค้าเข้าหน้าจอใน 1 วินาที"
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isRealtimeWebhookActive ? '#22c55e' : '#94a3b8',
              display: 'inline-block',
              boxShadow: isRealtimeWebhookActive ? '0 0 8px rgba(34, 197, 94, 0.7)' : 'none'
            }} />
            ⚡ สด 1 วิ: {isRealtimeWebhookActive ? 'พร้อมรับข้อความทันที' : 'กำลังเชื่อมต่อ'}
          </div>
        </div>
      </div>

      {/* Main 3-Column Chat Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '330px 1fr 290px',
        flex: 1,
        minHeight: 0,
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* ============================================================== */}
        {/* 1. LEFT PANE: CONVERSATION LIST                                 */}
        {/* ============================================================== */}
        <div style={{
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* Header & Filters */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                รวมแชทและคอมเมนต์
              </h3>
              <span style={{
                fontSize: '0.74rem',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                {filteredConversations.length} รายการ
              </span>
            </div>

            {/* Page Filter Tabs (5 buttons with clean wrap) */}
            <div style={{ display: 'flex', gap: '3px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterChannel('all')}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === 'all' ? '700' : '500',
                  backgroundColor: filterChannel === 'all' ? '#0f172a' : '#f1f5f9',
                  color: filterChannel === 'all' ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ทุกเพจ
              </button>
              <button
                onClick={() => setFilterChannel(REAL_GOOD_VIBES_PAGE_ID)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === REAL_GOOD_VIBES_PAGE_ID ? '700' : '500',
                  backgroundColor: filterChannel === REAL_GOOD_VIBES_PAGE_ID ? '#1877f2' : '#f1f5f9',
                  color: filterChannel === REAL_GOOD_VIBES_PAGE_ID ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Good Vibes Texture"
              >
                🎨 Good Vibes
              </button>
              <button
                onClick={() => setFilterChannel(REAL_TAASEEGUN_PAGE_ID)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === REAL_TAASEEGUN_PAGE_ID ? '700' : '500',
                  backgroundColor: filterChannel === REAL_TAASEEGUN_PAGE_ID ? '#d97706' : '#f1f5f9',
                  color: filterChannel === REAL_TAASEEGUN_PAGE_ID ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="บริษัท ทาสีกัน จำกัด"
              >
                🏠 ทาสีกัน
              </button>
              <button
                onClick={() => setFilterChannel(REAL_ROOMS_PAINTING_PAGE_ID)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === REAL_ROOMS_PAINTING_PAGE_ID ? '700' : '500',
                  backgroundColor: filterChannel === REAL_ROOMS_PAINTING_PAGE_ID ? '#7c3aed' : '#f1f5f9',
                  color: filterChannel === REAL_ROOMS_PAINTING_PAGE_ID ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="ทาสีคอนโด RoomsPainting"
              >
                🏢 RoomsPainting
              </button>
              <button
                onClick={() => setFilterChannel(REAL_TEXTURE_BEAR_PAGE_ID)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === REAL_TEXTURE_BEAR_PAGE_ID ? '700' : '500',
                  backgroundColor: filterChannel === REAL_TEXTURE_BEAR_PAGE_ID ? '#ea580c' : '#f1f5f9',
                  color: filterChannel === REAL_TEXTURE_BEAR_PAGE_ID ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="รับทำสีเทกเจอร์ by ช่างหมี"
              >
                🐻 ช่างหมี
              </button>
            </div>

            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '6px 10px',
              marginBottom: '8px'
            }}>
              <Search size={14} color="#94a3b8" style={{ marginRight: '6px' }} />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, ข้อความ, คลิป..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.8rem',
                  width: '100%',
                  color: '#1e293b'
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                onClick={() => setFilterType('all')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'all' ? '700' : '500',
                  backgroundColor: filterType === 'all' ? '#0f172a' : '#ffffff',
                  color: filterType === 'all' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1'
                }}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterType('due_followup')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'due_followup' ? '700' : '500',
                  backgroundColor: filterType === 'due_followup' ? '#dc2626' : '#ffffff',
                  color: filterType === 'due_followup' ? '#ffffff' : '#dc2626',
                  border: '1px solid #fecaca'
                }}
              >
                ⏰ ถึงเวลาตาม ({dueFollowUpsCount})
              </button>
              <button
                onClick={() => setFilterType('video_comment')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'video_comment' ? '700' : '500',
                  backgroundColor: filterType === 'video_comment' ? '#f59e0b' : '#ffffff',
                  color: filterType === 'video_comment' ? '#ffffff' : '#b45309',
                  border: '1px solid #fde68a'
                }}
              >
                🎬 ใต้คลิป
              </button>
              <button
                onClick={() => setFilterType('inbox')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'inbox' ? '700' : '500',
                  backgroundColor: filterType === 'inbox' ? '#1877f2' : '#ffffff',
                  color: filterType === 'inbox' ? '#ffffff' : '#1d4ed8',
                  border: '1px solid #bfdbfe'
                }}
              >
                📥 Inbox
              </button>
            </div>
          </div>

          {/* Scrollable Conversation List */}
          <div 
            className="scrollable-pane" 
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain'
            }}
          >
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                ไม่พบบทสนทนาที่ตรงกัน
              </div>
            ) : (
              filteredConversations.map(lead => {
                const isSelected = lead.id === activeLead?.id;
                const hasUnread = lead.status.includes('New') || lead.status.includes('ทักใหม่');
                const hasDueFollowUp = isFollowUpDue(lead.followUpDate);
                const lastMsg = lead.messages && lead.messages.length > 0 
                  ? lead.messages[lead.messages.length - 1].text 
                  : lead.inquiry;

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#ffffff' : (hasUnread ? '#fffdfa' : 'transparent'),
                      borderLeft: isSelected ? '4px solid #1877f2' : (hasDueFollowUp ? '4px solid #ef4444' : (hasUnread ? '4px solid #f59e0b' : '4px solid transparent')),
                      transition: 'var(--transition)'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = hasUnread ? '#fffdfa' : 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <div style={{ fontWeight: hasUnread ? '800' : '600', fontSize: '0.85rem', color: '#0f172a', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.name}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {lead.date?.split(' ')[1] || 'เมื่อสักครู่'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      {lead.channel === REAL_TAASEEGUN_PAGE_ID ? (
                        <span style={{
                          fontSize: '0.66rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#fffbeb',
                          color: '#b45309',
                          fontWeight: '700',
                          border: '1px solid #fde68a'
                        }}>
                          🏠 ทาสีกัน
                        </span>
                      ) : lead.channel === REAL_ROOMS_PAINTING_PAGE_ID ? (
                        <span style={{
                          fontSize: '0.66rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#f5f3ff',
                          color: '#6d28d9',
                          fontWeight: '700',
                          border: '1px solid #ddd6fe'
                        }}>
                          🏢 RoomsPainting
                        </span>
                      ) : lead.channel === REAL_TEXTURE_BEAR_PAGE_ID ? (
                        <span style={{
                          fontSize: '0.66rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#fff7ed',
                          color: '#c2410c',
                          fontWeight: '700',
                          border: '1px solid #fed7aa'
                        }}>
                          🐻 ช่างหมี
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.66rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          fontWeight: '700',
                          border: '1px solid #bfdbfe'
                        }}>
                          🎨 Good Vibes
                        </span>
                      )}
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      {renderSourceTypeBadge(lead.sourceType)}
                      
                      {hasDueFollowUp && (
                        <span style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          marginLeft: 'auto'
                        }}>
                          ⏰ ตามวันนี้
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontSize: '0.76rem',
                      color: hasUnread ? '#1e293b' : '#64748b',
                      fontWeight: hasUnread ? '600' : '400',
                      lineHeight: '1.35',
                      maxHeight: '34px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {lastMsg}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. MIDDLE PANE: LIVE CHAT & REPLY STREAM                        */}
        {/* ============================================================== */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {activeLead ? (
            <>
              {/* Active Chat Header */}
              <div style={{
                padding: '12px 18px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                flexShrink: 0
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                      {activeLead.name}
                    </h3>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: '700',
                      border: '1px solid #bfdbfe'
                    }}>
                      {activeLead.channelName}
                    </span>

                    {/* AI Intent Badge */}
                    {currentIntent && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: currentIntent.badgeColor,
                        backgroundColor: `${currentIntent.badgeColor}15`,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: `1px solid ${currentIntent.badgeColor}30`
                      }}>
                        {currentIntent.label}
                      </span>
                    )}
                  </div>

                  {activeLead.sourceTitle && (
                    <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span>{renderSourceTypeBadge(activeLead.sourceType)}:</span>
                      <strong style={{ color: '#334155' }}>{activeLead.sourceTitle}</strong>
                      {activeLead.sourceLink && (
                        <a href={activeLead.sourceLink} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={activeLead.status}
                    onChange={(e) => handleUpdateLeadField('status', e.target.value)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    {leadStatusOptions.filter(o => o.value !== 'all').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Context Alert if customer came from a Comment */}
              {(activeLead.sourceType === 'video_comment' || activeLead.sourceType === 'post_comment') && (
                <div style={{
                  backgroundColor: '#fffbeb',
                  borderBottom: '1px solid #fef3c7',
                  padding: '8px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#92400e' }}>
                    <AlertCircle size={15} color="#d97706" />
                    <span>
                      คอมเมนต์สอบถามใต้ {activeLead.sourceTitle || 'คลิป/โพสต์'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    backgroundColor: '#ffffff',
                    padding: '2px',
                    borderRadius: '6px',
                    border: '1px solid #fde68a',
                    fontSize: '0.72rem',
                    fontWeight: '600'
                  }}>
                    <button
                      onClick={() => setReplyMode('inbox')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: replyMode === 'inbox' ? '#1877f2' : 'transparent',
                        color: replyMode === 'inbox' ? '#ffffff' : '#475569'
                      }}
                    >
                      💬 ส่งเข้า Inbox ส่วนตัว
                    </button>
                    <button
                      onClick={() => setReplyMode('comment')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: replyMode === 'comment' ? '#d97706' : 'transparent',
                        color: replyMode === 'comment' ? '#ffffff' : '#475569'
                      }}
                    >
                      ↩️ ตอบใต้คอมเมนต์เดิม
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Messages Stream */}
              <div 
                ref={chatMessagesContainerRef}
                className="scrollable-pane" 
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: '#fafafa'
                }}
              >
                {(!activeLead.messages || activeLead.messages.length === 0) && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px 14px 14px 2px',
                      padding: '12px 16px',
                      maxWidth: '80%',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', marginBottom: '3px' }}>
                        {activeLead.name}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: '1.45' }}>
                        {activeLead.inquiry}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                        {activeLead.date}
                      </div>
                    </div>
                  </div>
                )}

                {(activeLead.messages || []).map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id || idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        backgroundColor: isAdmin ? '#1877f2' : '#ffffff',
                        color: isAdmin ? '#ffffff' : '#1e293b',
                        border: isAdmin ? 'none' : '1px solid #e2e8f0',
                        borderRadius: isAdmin ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        padding: '11px 15px',
                        maxWidth: '75%',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          color: isAdmin ? '#bfdbfe' : '#64748b',
                          marginBottom: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>{isAdmin ? `👤 ${msg.adminName || 'แอดมิน'}` : activeLead.name}</span>
                          {msg.isComment && (
                            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem' }}>
                              จากคอมเมนต์
                            </span>
                          )}
                          {msg.isCommentReply && (
                            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem' }}>
                              ตอบใต้คอมเมนต์
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.86rem', lineHeight: '1.45', wordBreak: 'break-word' }}>
                          {msg.text}
                        </div>

                        <div style={{
                          fontSize: '0.68rem',
                          color: isAdmin ? '#dbeafe' : '#94a3b8',
                          textAlign: 'right',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '4px'
                        }}>
                          <span>{msg.time}</span>
                          {isAdmin && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Suggestion Bar & Quick Reply Bar */}
              <div style={{
                padding: '6px 14px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                flexShrink: 0
              }}>
                {/* AI Draft Button */}
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={isAiGenerating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    border: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
                  }}
                  title="ให้ AI วิเคราะห์คำถามและร่างคำตอบภาษาไทยให้อัตโนมัติ"
                >
                  <Sparkles size={13} className={isAiGenerating ? 'spin-anim' : ''} />
                  {isAiGenerating ? 'กำลังร่าง...' : '✨ AI ร่างคำตอบให้อัตโนมัติ'}
                </button>

                <span style={{ color: '#cbd5e1' }}>|</span>

                {quickReplyTemplates.map(qr => (
                  <button
                    key={qr.id}
                    onClick={() => handleApplyQuickReply(qr.text)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: '999px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.73rem',
                      color: '#334155',
                      whiteSpace: 'nowrap',
                      fontWeight: '500'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    {qr.title}
                  </button>
                ))}
              </div>

              {/* Message Composer Form */}
              <form onSubmit={handleSendMessage} style={{
                padding: '10px 14px',
                borderTop: '2px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                flexShrink: 0,
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <textarea
                    rows="2"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`พิมพ์ข้อความตอบกลับ ${activeLead.name}... (กด Enter เพื่อส่ง, Shift+Enter ขึ้นบรรทัดใหม่)`}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontFamily: 'inherit',
                      resize: 'none',
                      backgroundColor: '#f8fafc',
                      transition: 'border-color 0.2s, background-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1877f2';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />

                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    style={{
                      padding: '0 18px',
                      borderRadius: '10px',
                      backgroundColor: replyText.trim() ? '#1877f2' : '#cbd5e1',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                      height: '52px',
                      boxShadow: replyText.trim() ? '0 2px 8px rgba(24, 119, 242, 0.35)' : 'none',
                      transition: 'var(--transition)',
                      flexShrink: 0
                    }}
                  >
                    <Send size={16} /> ส่งข้อความ
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              เลือกบทสนทนาทางซ้ายเพื่อเริ่มตอบแชท
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 3. RIGHT PANE: CRM PROFILE & FOLLOW-UP REMINDER                 */}
        {/* ============================================================== */}
        <div className="scrollable-pane" style={{
          borderLeft: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          padding: '16px 14px',
          height: '100%',
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {activeLead ? (
            <>
              {/* Follow-up Reminder Module */}
              <div style={{
                backgroundColor: isFollowUpDue(activeLead.followUpDate) ? '#fef2f2' : '#f8fafc',
                border: isFollowUpDue(activeLead.followUpDate) ? '1px solid #fecaca' : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Clock size={16} color={isFollowUpDue(activeLead.followUpDate) ? '#dc2626' : '#64748b'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isFollowUpDue(activeLead.followUpDate) ? '#b91c1c' : '#1e293b' }}>
                    ⏰ ติดตามผล (Follow-up)
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                  {activeLead.followUpDate ? (
                    <div>
                      วันนัดหมาย: <strong>{activeLead.followUpDate}</strong>{' '}
                      {isFollowUpDue(activeLead.followUpDate) && <span style={{ color: '#dc2626', fontWeight: '800' }}>[ครบกำหนดแล้ว!]</span>}
                    </div>
                  ) : (
                    'ยังไม่ได้ตั้งวันติดตามผล'
                  )}
                </div>

                {/* Quick Follow-up Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  <button
                    onClick={() => handleSetFollowUpDays(1)}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: '#334155'
                    }}
                  >
                    +1 วัน
                  </button>
                  <button
                    onClick={() => handleSetFollowUpDays(2)}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: '#334155'
                    }}
                  >
                    +2 วัน
                  </button>
                  <button
                    onClick={() => handleSetFollowUpDays(7)}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: '#334155'
                    }}
                  >
                    +1 สัปดาห์
                  </button>
                </div>

                {/* Send Follow-up template button */}
                <button
                  onClick={() => {
                    const name = (activeLead.name || 'ลูกค้า').replace(/\(.*?\)/g, '').trim();
                    setReplyText(`สวัสดีครับคุณ${name} ทางเราขออนุญาตติดตามเรื่องข้อเสนอและเรทการ์ดที่ส่งให้ก่อนหน้านี้ครับ สะดวกพิจารณาหรือมีคำถามตรงไหนเพิ่มเติมไหมครับผม 😊`);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #93c5fd',
                    color: '#1d4ed8',
                    fontSize: '0.73rem',
                    fontWeight: '700'
                  }}
                >
                  💬 ใส่ข้อความทักตามผล
                </button>
              </div>

              {/* Customer Profile */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ข้อมูลลูกค้า
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <User size={14} color="#64748b" />
                    <strong>{activeLead.name}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Phone size={14} color="#64748b" />
                    <span>{activeLead.contact}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Tag size={14} color="#64748b" />
                    <span>{activeLead.tag}</span>
                  </div>
                </div>
              </div>

              {/* Deal Value */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>
                  มูลค่าดีลคาดการณ์ (บาท):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>฿</span>
                  <input
                    type="number"
                    value={activeLead.dealValue || 0}
                    onChange={(e) => handleUpdateLeadField('dealValue', Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              {/* Admin Assignment */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>
                  แอดมินผู้ดูแล:
                </label>
                <select
                  value={activeLead.admin}
                  onChange={(e) => handleUpdateLeadField('admin', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem'
                  }}
                >
                  <option value="แอดมินนนท์">แอดมินนนท์</option>
                  <option value="แอดมินแพรว">แอดมินแพรว</option>
                  <option value="แอดมินโบว์">แอดมินโบว์</option>
                  <option value="ยังไม่ได้มอบหมาย">ยังไม่ได้มอบหมาย</option>
                </select>
              </div>

              {/* Internal Notes Notepad */}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>
                  โน้ตภายใน (Admin Notes):
                </label>
                <textarea
                  rows="4"
                  value={activeLead.notes || ''}
                  onChange={(e) => handleUpdateLeadField('notes', e.target.value)}
                  placeholder="บันทึกข้อตกลง ข้อกำหนด..."
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.76rem',
                    fontFamily: 'inherit',
                    backgroundColor: '#fffbeb'
                  }}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
