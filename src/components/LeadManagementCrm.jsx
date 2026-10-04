import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Phone, 
  Mail, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Tag, 
  UserCheck, 
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit3,
  ExternalLink,
  Layers,
  Sparkles,
  Video,
  FileText,
  MessageCircle,
  CornerDownRight,
  Send
} from 'lucide-react';
import { leadStatusOptions, interactionTypeOptions } from '../data/mockData';

export default function LeadManagementCrm({ 
  leads, 
  setLeads, 
  facebookPages, 
  onOpenAddLeadModal,
  selectedChannelFilter,
  setSelectedChannelFilter,
  onOpenChat
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedSourceTypeFilter, setSelectedSourceTypeFilter] = useState('all'); // 'all', 'inbox', 'post_comment', 'video_comment'
  const [activeLeadModal, setActiveLeadModal] = useState(null); // For viewing/editing notes
  const [replySuccessMessage, setReplySuccessMessage] = useState(null);

  // Helper to check if follow-up is due
  const isFollowUpDue = (followUpDate) => {
    if (!followUpDate) return false;
    const target = new Date(followUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target <= today;
  };

  // Filter leads based on search query, channel, status, and source type (Inbox vs Comment vs Follow-up)
  const filteredLeads = leads.filter(lead => {
    // Search query matching
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.inquiry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.sourceTitle && lead.sourceTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Channel filtering
    let matchesChannel = true;
    if (selectedChannelFilter !== 'all') {
      if (selectedChannelFilter === 'all-fb') {
        matchesChannel = lead.platform === 'facebook';
      } else {
        matchesChannel = lead.channel === selectedChannelFilter;
      }
    }

    // Status filtering
    const matchesStatus = selectedStatusFilter === 'all' || lead.status === selectedStatusFilter;

    // Source Type / Follow-up filtering
    let matchesSourceType = true;
    if (selectedSourceTypeFilter === 'due_followup') {
      matchesSourceType = isFollowUpDue(lead.followUpDate);
    } else if (selectedSourceTypeFilter !== 'all') {
      matchesSourceType = lead.sourceType === selectedSourceTypeFilter;
    }

    return matchesSearch && matchesChannel && matchesStatus && matchesSourceType;
  });

  // Calculate Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status.includes('New') || l.status.includes('ทักใหม่')).length;
  const inboxCount = leads.filter(l => l.sourceType === 'inbox').length;
  const commentsCount = leads.filter(l => l.sourceType === 'post_comment' || l.sourceType === 'video_comment').length;
  const inPipelineValue = leads
    .filter(l => l.status.includes('Quoted') || l.status.includes('Negotiating') || l.status.includes('เสนอราคา') || l.status.includes('เจรจา'))
    .reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const wonValue = leads
    .filter(l => l.status.includes('Won') || l.status.includes('ปิดการขาย'))
    .reduce((sum, l) => sum + (l.dealValue || 0), 0);

  // Quick Status Change Handler
  const handleStatusChange = (leadId, newStatus) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status: newStatus };
      }
      return lead;
    }));
  };

  // Quick convert comment to Inbox message
  const handleMoveCommentToInbox = (lead) => {
    const updated = leads.map(l => {
      if (l.id === lead.id) {
        return {
          ...l,
          sourceType: 'inbox',
          status: 'ติดต่อกลับแล้ว (Contacted)',
          notes: `${l.notes ? l.notes + ' | ' : ''}ดึงจากคอมเมนต์เข้า Inbox Messenger เรียบร้อยแล้ว`
        };
      }
      return l;
    });
    setLeads(updated);
    setReplySuccessMessage(`ดึงข้อความของ "${lead.name}" จากคอมเมนต์เข้าแชท Inbox เรียบร้อยแล้ว!`);
    setTimeout(() => setReplySuccessMessage(null), 3000);
  };

  // Delete lead handler
  const handleDeleteLead = (leadId) => {
    if (confirm('คุณต้องการลบข้อมูลลูกค้ารายนี้ใช่หรือไม่?')) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
    }
  };

  // Get status color helper
  const getStatusColor = (status) => {
    const found = leadStatusOptions.find(opt => opt.value === status);
    return found ? { color: found.color, bg: found.bg } : { color: '#64748b', bg: '#f1f5f9' };
  };

  // Channel badge helper
  const renderChannelBadge = (lead) => {
    if (lead.platform === 'facebook') {
      return (
        <span className="badge badge-facebook" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          📘 {lead.channelName || 'Facebook'}
        </span>
      );
    }
    if (lead.platform === 'youtube') {
      return (
        <span className="badge badge-youtube">
          ▶ YouTube Channel
        </span>
      );
    }
    if (lead.platform === 'tiktok') {
      return (
        <span className="badge badge-tiktok">
          🎵 TikTok Account
        </span>
      );
    }
    return (
      <span className="badge badge-instagram">
        📷 Instagram
      </span>
    );
  };

  // Source Type Badge helper
  const renderSourceTypeBadge = (lead) => {
    if (lead.sourceType === 'inbox') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.74rem',
          fontWeight: '700',
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          border: '1px solid #bfdbfe'
        }}>
          <MessageSquare size={12} /> Inbox แชทส่วนตัว
        </span>
      );
    }
    if (lead.sourceType === 'post_comment') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.74rem',
          fontWeight: '700',
          backgroundColor: '#f5f3ff',
          color: '#6d28d9',
          border: '1px solid #ddd6fe'
        }}>
          <FileText size={12} /> คอมเมนต์หน้าเพจ
        </span>
      );
    }
    if (lead.sourceType === 'video_comment') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.74rem',
          fontWeight: '700',
          backgroundColor: '#fffbeb',
          color: '#b45309',
          border: '1px solid #fde68a'
        }}>
          <Video size={12} /> คอมเมนต์ใต้คลิป
        </span>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      {/* Toast Alert */}
      {replySuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} /> {replySuccessMessage}
        </div>
      )}

      {/* Title & Introduction */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          color: '#0f172a',
          marginBottom: '4px'
        }}>
          ตารางรวบรวมข้อความลูกค้า (Inbox + คอมเมนต์หน้าเพจ & ใต้คลิป)
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          รวบรวมทุกข้อความที่ลูกค้าทักเข้ามา ไม่ว่าจะเป็น <strong>Inbox แชทหลังบ้าน</strong>, <strong>คอมเมนต์ใต้โพสต์หน้าเพจ</strong>, หรือ <strong>คอมเมนต์ใต้คลิปวิดีโอ/Reels/Shorts/TikTok</strong> จากทุกเพจของคุณไว้ที่เดียว
        </p>
      </div>

      {/* CRM Highlight Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="metric-title">ลูกค้าติดต่อทั้งหมด (Total Inbound)</div>
          <div className="metric-value">{totalLeads} ราย</div>
          <div className="metric-sub" style={{ color: '#3b82f6' }}>
            จากเพจ Facebook จริง ({facebookPages[0]?.name || 'Good Vibes Texture'})
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffdfa' }}>
          <div className="metric-title" style={{ color: '#b45309' }}>💬 คอมเมนต์ใต้คลิป & โพสต์</div>
          <div className="metric-value" style={{ color: '#b45309' }}>{commentsCount} ข้อความ</div>
          <div className="metric-sub" style={{ color: '#d97706' }}>
            ถามราคา / สต็อกสินค้า / สปอนเซอร์
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #1877f2', backgroundColor: '#f9fbff' }}>
          <div className="metric-title" style={{ color: '#1e40af' }}>📥 ข้อความ Inbox Direct</div>
          <div className="metric-value" style={{ color: '#1e40af' }}>{inboxCount} แชท</div>
          <div className="metric-sub" style={{ color: '#2563eb' }}>
            Messenger & DM หลังบ้าน
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #ef4444', backgroundColor: newLeads > 0 ? '#fffafa' : '#fff' }}>
          <div className="metric-title" style={{ color: '#dc2626' }}>ทักใหม่ ยังไม่ตอบ (New Inquiries)</div>
          <div className="metric-value" style={{ color: '#dc2626' }}>{newLeads} ราย</div>
          <div className="metric-sub" style={{ color: '#dc2626' }}>
            {newLeads > 0 ? '⚠️ ควรตอบกลับเพื่อปิดการขาย' : '✅ ตอบครบทุกข้อความแล้ว'}
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="metric-title">มูลค่าดีลคาดการณ์รวม</div>
          <div className="metric-value" style={{ color: '#059669' }}>
            ฿{(inPipelineValue + wonValue).toLocaleString()}
          </div>
          <div className="metric-sub" style={{ color: '#16a34a' }}>
            Pipeline + ปิดการขายแล้ว
          </div>
        </div>
      </div>

      {/* Interaction Type Quick Selector (INBOX vs COMMENTS TABS) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', whiteSpace: 'nowrap' }}>
          กรองตามที่มาของข้อความ:
        </span>

        <button
          onClick={() => setSelectedSourceTypeFilter('all')}
          style={{
            padding: '7px 14px',
            borderRadius: '999px',
            fontSize: '0.84rem',
            fontWeight: selectedSourceTypeFilter === 'all' ? '700' : '500',
            backgroundColor: selectedSourceTypeFilter === 'all' ? '#0f172a' : '#ffffff',
            color: selectedSourceTypeFilter === 'all' ? '#ffffff' : '#475569',
            border: '1px solid #cbd5e1'
          }}
        >
          🌐 ทั้งหมด ({leads.length})
        </button>

        <button
          onClick={() => setSelectedSourceTypeFilter('due_followup')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '999px',
            fontSize: '0.84rem',
            fontWeight: selectedSourceTypeFilter === 'due_followup' ? '700' : '500',
            backgroundColor: selectedSourceTypeFilter === 'due_followup' ? '#dc2626' : '#ffffff',
            color: selectedSourceTypeFilter === 'due_followup' ? '#ffffff' : '#dc2626',
            border: '1px solid #fecaca'
          }}
        >
          <Clock size={14} /> ⏰ ถึงเวลาติดตามผล ({leads.filter(l => isFollowUpDue(l.followUpDate)).length})
        </button>

        <button
          onClick={() => setSelectedSourceTypeFilter('video_comment')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '999px',
            fontSize: '0.84rem',
            fontWeight: selectedSourceTypeFilter === 'video_comment' ? '700' : '500',
            backgroundColor: selectedSourceTypeFilter === 'video_comment' ? '#b45309' : '#ffffff',
            color: selectedSourceTypeFilter === 'video_comment' ? '#ffffff' : '#b45309',
            border: '1px solid #fde68a'
          }}
        >
          <Video size={14} /> 🎬 คอมเมนต์ใต้คลิป / Reels / Shorts ({leads.filter(l => l.sourceType === 'video_comment').length})
        </button>

        <button
          onClick={() => setSelectedSourceTypeFilter('post_comment')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '999px',
            fontSize: '0.84rem',
            fontWeight: selectedSourceTypeFilter === 'post_comment' ? '700' : '500',
            backgroundColor: selectedSourceTypeFilter === 'post_comment' ? '#6d28d9' : '#ffffff',
            color: selectedSourceTypeFilter === 'post_comment' ? '#ffffff' : '#6d28d9',
            border: '1px solid #ddd6fe'
          }}
        >
          <FileText size={14} /> 📝 คอมเมนต์หน้าเพจ / โพสต์ ({leads.filter(l => l.sourceType === 'post_comment').length})
        </button>

        <button
          onClick={() => setSelectedSourceTypeFilter('inbox')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '999px',
            fontSize: '0.84rem',
            fontWeight: selectedSourceTypeFilter === 'inbox' ? '700' : '500',
            backgroundColor: selectedSourceTypeFilter === 'inbox' ? '#1877f2' : '#ffffff',
            color: selectedSourceTypeFilter === 'inbox' ? '#ffffff' : '#1877f2',
            border: '1px solid #bfdbfe'
          }}
        >
          <MessageSquare size={14} /> 📥 ข้อความ Inbox Direct ({inboxCount})
        </button>
      </div>

      {/* Filter and Action Toolbar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Search bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '8px 12px',
          width: '100%',
          maxWidth: '320px'
        }}>
          <Search size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="ค้นหาข้อความ, ชื่อคลิป, ชื่อลูกค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: '0.88rem',
              color: '#1e293b'
            }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Channel Filter (Specifically Multi-Page Facebook) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>เพจ/ช่อง:</span>
            <select
              value={selectedChannelFilter}
              onChange={(e) => setSelectedChannelFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                fontWeight: '600',
                color: '#1e293b'
              }}
            >
              <option value="all">🌐 ทุกข้อความจากเพจจริง</option>
              {facebookPages.map(page => (
                <option key={page.id} value={page.id}>
                  📄 {page.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>สถานะ:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }}
            >
              {leadStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button if any active */}
          {(searchQuery || selectedChannelFilter !== 'all' || selectedStatusFilter !== 'all' || selectedSourceTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedChannelFilter('all');
                setSelectedStatusFilter('all');
                setSelectedSourceTypeFilter('all');
              }}
              style={{
                fontSize: '0.8rem',
                color: '#dc2626',
                fontWeight: '600',
                padding: '4px 8px'
              }}
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.88rem'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>ข้อมูลลูกค้า</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>ประเภท & โพสต์/คลิปต้นทาง</th>
                <th style={{ padding: '14px 16px', fontWeight: '700', minWidth: '280px' }}>ข้อความที่ลูกค้าทัก / ถามเข้ามา</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>ช่องทางติดต่อ</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>มูลค่าดีล</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>สถานะ</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>ผู้ดูแล</th>
                <th style={{ padding: '14px 16px', fontWeight: '700', textAlign: 'center' }}>จัดการด่วน</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍</div>
                    <div style={{ fontWeight: '600', color: '#475569' }}>ไม่พบข้อความที่ตรงกับเงื่อนไขการค้นหา</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                      ลองเปลี่ยนตัวกรอง หรือคลิก "+ บันทึก Lead ลูกค้าใหม่"
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => {
                  const statusStyle = getStatusColor(lead.status);
                  const isComment = lead.sourceType === 'post_comment' || lead.sourceType === 'video_comment';

                  return (
                    <tr 
                      key={lead.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                        backgroundColor: isComment ? '#fffefa' : (idx % 2 === 0 ? '#ffffff' : '#fafafa')
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = isComment ? '#fffefa' : (idx % 2 === 0 ? '#ffffff' : '#fafafa')}
                    >
                      {/* Customer Name & Date */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{lead.name}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                          📅 {lead.date}
                        </div>
                        <div style={{ marginTop: '6px' }}>
                          {renderChannelBadge(lead)}
                        </div>
                      </td>

                      {/* Source Type & Clip / Post Source */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '240px' }}>
                        <div style={{ marginBottom: '6px' }}>
                          {renderSourceTypeBadge(lead)}
                        </div>
                        
                        {lead.sourceTitle && (
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            color: '#334155',
                            backgroundColor: '#f1f5f9',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            lineHeight: '1.4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '4px'
                          }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.sourceTitle}>
                              {lead.sourceTitle}
                            </span>
                            {lead.sourceLink && (
                              <a
                                href={lead.sourceLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#3b82f6', flexShrink: 0 }}
                                title="เปิดดูโพสต์หรือคลิปต้นทาง"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        )}

                        <span style={{
                          display: 'inline-block',
                          marginTop: '6px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          border: '1px solid #e2e8f0'
                        }}>
                          🏷️ {lead.tag}
                        </span>
                      </td>

                      {/* Inquiry & Notes */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{
                          color: '#1e293b',
                          lineHeight: '1.45',
                          fontSize: '0.86rem',
                          fontWeight: lead.status.includes('New') ? '600' : '400'
                        }}>
                          {lead.inquiry}
                        </div>

                        {/* If it's a comment, show Quick Convert to Inbox button! */}
                        {isComment && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleMoveCommentToInbox(lead)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                border: '1px solid #bfdbfe'
                              }}
                              title="ดึงข้อความจากคอมเมนต์นี้ไปคุยต่อใน Inbox Messenger"
                            >
                              <Send size={12} /> ทัก Inbox ลูกค้าคนนี้ →
                            </button>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              (ป้องกันตกหล่น)
                            </span>
                          </div>
                        )}

                        {lead.notes && (
                          <div style={{
                            marginTop: '8px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fef3c7',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            color: '#92400e',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px'
                          }}>
                            <span>📌</span>
                            <span>{lead.notes}</span>
                          </div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: '500' }}>
                          {lead.contact}
                        </div>
                      </td>

                      {/* Deal Value */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.92rem' }}>
                          {lead.dealValue ? `฿${lead.dealValue.toLocaleString()}` : '-'}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            color: statusStyle.color,
                            backgroundColor: statusStyle.bg,
                            border: `1px solid ${statusStyle.color}40`,
                            cursor: 'pointer'
                          }}
                        >
                          {leadStatusOptions.filter(o => o.value !== 'all').map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Admin */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                          👤 {lead.admin}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => onOpenChat && onOpenChat(lead.id)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              color: '#ffffff',
                              backgroundColor: '#1877f2',
                              fontWeight: '700',
                              fontSize: '0.78rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="เปิดตอบแชทลูกค้ารายนี้ทันที"
                          >
                            <MessageCircle size={14} /> ตอบแชท
                          </button>
                          <button
                            onClick={() => setActiveLeadModal(lead)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: '#475569',
                              backgroundColor: '#f1f5f9'
                            }}
                            title="ดู/แก้ไขโน้ต"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: '#ef4444',
                              backgroundColor: '#fef2f2'
                            }}
                            title="ลบข้อมูล"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          fontSize: '0.82rem',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>แสดง {filteredLeads.length} จากทั้งหมด {leads.length} รายการ (แยกประเภท Inbox และ คอมเมนต์ชัดเจน)</div>
          <div>
            💡 <strong>คำแนะนำ:</strong> สามารถเชื่อมต่อ Facebook Webhook Event <code>feed</code> เพื่อดึงคอมเมนต์หน้าเพจและ Reels แบบ Realtime
          </div>
        </div>
      </div>

      {/* Edit / Quick Note Modal */}
      {activeLeadModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>
              📝 บันทึกข้อมูลและโน้ตลูกค้า
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                ชื่อลูกค้า:
              </label>
              <input
                type="text"
                value={activeLeadModal.name}
                onChange={(e) => setActiveLeadModal({ ...activeLeadModal, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                ประเภทที่มาของข้อความ:
              </label>
              <select
                value={activeLeadModal.sourceType || 'inbox'}
                onChange={(e) => setActiveLeadModal({ ...activeLeadModal, sourceType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <option value="inbox">📥 ข้อความ Inbox Direct / DM</option>
                <option value="post_comment">📝 คอมเมนต์หน้าเพจ / โพสต์</option>
                <option value="video_comment">🎬 คอมเมนต์ใต้คลิป / Reels / Shorts</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                ชื่อคลิป หรือ โพสต์ต้นทาง:
              </label>
              <input
                type="text"
                value={activeLeadModal.sourceTitle || ''}
                onChange={(e) => setActiveLeadModal({ ...activeLeadModal, sourceTitle: e.target.value })}
                placeholder="เช่น คลิป: รีวิวไมค์ไร้สาย..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                ข้อมูลติดต่อ (เบอร์ / Line / Email):
              </label>
              <input
                type="text"
                value={activeLeadModal.contact}
                onChange={(e) => setActiveLeadModal({ ...activeLeadModal, contact: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                มูลค่าดีลคาดการณ์ (บาท):
              </label>
              <input
                type="number"
                value={activeLeadModal.dealValue || 0}
                onChange={(e) => setActiveLeadModal({ ...activeLeadModal, dealValue: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                โน้ตภายใน / ความคืบหน้าการติดตาม:
              </label>
              <textarea
                rows="4"
                value={activeLeadModal.notes || ''}
                onChange={(e) => setActiveLeadModal({ ...activeLeadModal, notes: e.target.value })}
                placeholder="เช่น ตอบกลับใต้คอมเมนต์แล้ว นัดคุยต่อใน Inbox..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setActiveLeadModal(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: '600'
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setLeads(prev => prev.map(l => l.id === activeLeadModal.id ? activeLeadModal : l));
                  setActiveLeadModal(null);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#1877f2',
                  color: '#ffffff',
                  fontWeight: '600'
                }}
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
