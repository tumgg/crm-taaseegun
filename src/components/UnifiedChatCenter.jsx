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
  REAL_GOOD_VIBES_TOKEN 
} from '../data/mockData';
import { playNotificationSound } from '../utils/sound';
import { analyzeMessageIntent, generateAIDraftReply } from '../utils/aiAssistant';
import { fetchLiveFacebookConversations } from '../utils/facebookLiveSync';

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

  // Sync real live conversations from Meta Graph API
  const handleSyncRealFacebook = async () => {
    const isValidToken = (t) => typeof t === 'string' && t.startsWith('EAA') && !t.includes('...') && t.length > 50;

    // 1. Look for a page that has a verified, real active token
    let connectedPage = facebookPages.find(p => isValidToken(p.activePageToken));

    // 2. Fallback to Good Vibes Texture page with verified token
    if (!connectedPage) {
      const goodVibes = facebookPages.find(p => p.id === REAL_GOOD_VIBES_PAGE_ID);
      if (goodVibes) {
        connectedPage = {
          ...goodVibes,
          activePageToken: REAL_GOOD_VIBES_TOKEN
        };
      } else {
        connectedPage = {
          id: REAL_GOOD_VIBES_PAGE_ID,
          name: 'รับพ่นสี Texture ฉาบเทคเจอร์ ราคาถูก By Good Vibes',
          activePageToken: REAL_GOOD_VIBES_TOKEN
        };
      }
    }

    if (!connectedPage || !isValidToken(connectedPage.activePageToken)) {
      alert('ยังไม่พบเพจที่ใส่ Access Token ที่ถูกต้อง กรุณาไปที่แท็บ "วิธีเชื่อมต่อ API ส่งข้อความ & หลายเพจ" เพื่อใส่ Token ก่อนครับ');
      return;
    }

    setIsSyncingFb(true);
    try {
      const realLeads = await fetchLiveFacebookConversations(connectedPage.id, connectedPage.activePageToken, connectedPage.name);
      if (realLeads.length === 0) {
        alert(`เชื่อมต่อกับเพจ "${connectedPage.name}" สำเร็จ แต่ยังไม่มีข้อความใหม่ใน Inbox ครับ`);
      } else {
        setLeads(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const newUnique = realLeads.filter(l => !existingIds.has(l.id));
          return [...newUnique, ...prev];
        });

        if (isSoundEnabled) {
          playNotificationSound();
        }

        setSelectedLeadId(realLeads[0].id);
        setToastNotification(`🎉 ซิงค์แชทจริงสำเร็จ! ดึง ${realLeads.length} บทสนทนาจริงจากเพจ "${connectedPage.name}" เข้ามาในระบบแล้ว!`);
        setTimeout(() => setToastNotification(null), 6000);
      }
    } catch (err) {
      alert(`ไม่สามารถดึงข้อมูลจาก Facebook API ได้: ${err.message}`);
    } finally {
      setIsSyncingFb(false);
    }
  };
  
  const chatMessagesEndRef = useRef(null);

  // Default active lead selection
  const activeLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !activeLead) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: replyText.trim(),
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
    <div className="animate-fade-in" style={{ position: 'relative' }}>
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
        padding: '10px 18px',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '10px'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSyncRealFacebook}
            disabled={isSyncingFb}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 15px',
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
            title="ดึงข้อความจริงล่าสุดจาก Inbox เพจ Good Vibes Texture ที่เชื่อมต่อ Meta API ไว้"
          >
            <RefreshCw size={14} className={isSyncingFb ? "animate-spin" : ""} />
            {isSyncingFb ? 'กำลังดึงแชทจริง...' : '⚡ ดึงแชทสดจากเพจ Facebook (Good Vibes)'}
          </button>
        </div>
      </div>

      {/* Main 3-Column Chat Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '330px 1fr 290px',
        height: 'calc(100vh - 210px)',
        minHeight: '620px',
        maxHeight: '780px',
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
          backgroundColor: '#f8fafc'
        }}>
          {/* Header & Filters */}
          <div style={{ padding: '14px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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
          <div style={{ flex: 1, overflowY: 'auto' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        color: lead.platform === 'facebook' ? '#1877f2' : lead.platform === 'youtube' ? '#dc2626' : '#0f172a'
                      }}>
                        {lead.platform === 'facebook' ? '📘 FB' : lead.platform === 'youtube' ? '▶ YT' : '🎵 TT'}
                      </span>
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
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
          {activeLead ? (
            <>
              {/* Active Chat Header */}
              <div style={{
                padding: '12px 18px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff'
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
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#fafafa'
              }}>
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
                <div ref={chatMessagesEndRef} />
              </div>

              {/* AI Suggestion Bar & Quick Reply Bar */}
              <div style={{
                padding: '6px 14px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto'
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
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
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
                    placeholder={`พิมพ์ตอบกลับ ${activeLead.name}... (กด Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)`}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontFamily: 'inherit',
                      resize: 'none'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      backgroundColor: replyText.trim() ? '#1877f2' : '#cbd5e1',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '0.86rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                      height: '42px'
                    }}
                  >
                    <Send size={15} /> ส่ง
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
        <div style={{
          borderLeft: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          padding: '16px 14px',
          overflowY: 'auto',
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
