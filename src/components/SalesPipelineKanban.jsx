import React, { useState, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  Search, 
  Filter, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Plus, 
  Phone,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal
} from 'lucide-react';
import { getPageTheme, CustomerAvatar } from './UnifiedChatCenter';

export const isFollowUpDue = (followUpDate) => {
  if (!followUpDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return followUpDate <= today;
};

export const PIPELINE_STAGES = [
  {
    id: 'ทักใหม่ (New)',
    title: 'ทักใหม่',
    icon: '📥',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'ลูกค้าเพิ่งทักแชท/คอมเมนต์'
  },
  {
    id: 'ติดต่อแล้ว',
    title: 'คุยรายละเอียดแล้ว',
    icon: '💬',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    description: 'กำลังสอบถามพื้นที่/ลายสี'
  },
  {
    id: 'นัดดูหน้างาน',
    title: 'นัดดูหน้างาน / วัดพื้นที่',
    icon: '📐',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'ลงคิวช่างเข้าวัดหน้างานจริง'
  },
  {
    id: 'เสนอราคาแล้ว',
    title: 'เสนอราคาแล้ว (รอสรุป)',
    icon: '📄',
    color: '#d97706',
    bgColor: '#fef3c7',
    borderColor: '#fcd34d',
    description: 'ส่งใบเสนอราคาเรียบร้อย'
  },
  {
    id: 'มัดจำแล้ว (Won)',
    title: 'มัดจำแล้ว / ปิดการขาย',
    icon: '🤝',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    description: 'โอนมัดจำ เตรียมลงคิวช่าง'
  },
  {
    id: 'จบงานแล้ว',
    title: 'จบงาน / ส่งมอบงาน',
    icon: '🏆',
    color: '#059669',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    description: 'ทาสีเสร็จ ส่งมอบเรียบร้อย'
  },
  {
    id: 'ยกเลิก / ไม่สะดวก',
    title: 'ไม่สะดวก / ยกเลิก',
    icon: '❌',
    color: '#64748b',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    description: 'ยังไม่พร้อม / ยกเลิกดีล'
  }
];

export default function SalesPipelineKanban({
  leads,
  setLeads,
  facebookPages,
  onOpenChat,
  onOpenAddLeadModal
}) {
  const [filterChannel, setFilterChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [editingDealId, setEditingDealId] = useState(null);
  const [editDealValue, setEditDealValue] = useState('');

  // Map legacy/various statuses to standard Pipeline Stage IDs
  const normalizeStatus = (status) => {
    if (!status) return 'ทักใหม่ (New)';
    const s = String(status).toLowerCase();
    if (s.includes('new') || s.includes('ทักใหม่')) return 'ทักใหม่ (New)';
    if (s.includes('นัด') || s.includes('วัดพื้นที่') || s.includes('ดูหน้างาน')) return 'นัดดูหน้างาน';
    if (s.includes('เสนอราคา') || s.includes('quot')) return 'เสนอราคาแล้ว';
    if (s.includes('มัดจำ') || s.includes('won') || s.includes('ปิดการขาย')) return 'มัดจำแล้ว (Won)';
    if (s.includes('จบงาน') || s.includes('ส่งมอบ') || s.includes('complete')) return 'จบงานแล้ว';
    if (s.includes('ยกเลิก') || s.includes('lost') || s.includes('ไม่สะดวก')) return 'ยกเลิก / ไม่สะดวก';
    return 'ติดต่อแล้ว';
  };

  // Filter leads based on page channel and search
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchChannel = filterChannel === 'all' || lead.channel === filterChannel;
      const matchSearch = !searchQuery.trim() ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.inquiry && lead.inquiry.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.contact && lead.contact.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchChannel && matchSearch;
    });
  }, [leads, filterChannel, searchQuery]);

  // Group leads into stages
  const columnsData = useMemo(() => {
    const grouped = {};
    PIPELINE_STAGES.forEach(stage => {
      grouped[stage.id] = [];
    });

    filteredLeads.forEach(lead => {
      const stageKey = normalizeStatus(lead.status);
      if (grouped[stageKey]) {
        grouped[stageKey].push(lead);
      } else {
        grouped['ติดต่อแล้ว'].push(lead);
      }
    });

    return grouped;
  }, [filteredLeads]);

  // High-Level Pipeline Financial KPIs
  const pipelineMetrics = useMemo(() => {
    let totalPipelineValue = 0;
    let closedWonValue = 0;
    let pendingQuotesValue = 0;
    let wonCount = 0;
    let totalActiveCount = 0;

    leads.forEach(l => {
      const val = Number(l.dealValue) || 0;
      const stage = normalizeStatus(l.status);
      totalPipelineValue += val;

      if (stage === 'มัดจำแล้ว (Won)' || stage === 'จบงานแล้ว') {
        closedWonValue += val;
        wonCount += 1;
      }
      if (stage === 'เสนอราคาแล้ว' || stage === 'นัดดูหน้างาน') {
        pendingQuotesValue += val;
      }
      if (stage !== 'ยกเลิก / ไม่สะดวก') {
        totalActiveCount += 1;
      }
    });

    const winRate = totalActiveCount > 0 ? Math.round((wonCount / totalActiveCount) * 100) : 0;

    return {
      totalPipelineValue,
      closedWonValue,
      pendingQuotesValue,
      winRate
    };
  }, [leads]);

  // Handle Drag and Drop
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          status: targetStageId
        };
      }
      return lead;
    }));

    setDraggedLeadId(null);
  };

  // Quick Move stage via button
  const handleMoveStage = (leadId, nextStageId) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: nextStageId } : l));
  };

  // Deal Value Inline Editing
  const handleStartEditDeal = (lead) => {
    setEditingDealId(lead.id);
    setEditDealValue(String(lead.dealValue || 0));
  };

  const handleSaveDealValue = (leadId) => {
    const num = parseFloat(editDealValue) || 0;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, dealValue: num } : l));
    setEditingDealId(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '100%',
      gap: '12px'
    }}>
      {/* 1. TOP EXECUTIVE KPI METRICS BAR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px'
      }}>
        {/* Metric 1: Total Pipeline */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
              มูลค่าไปป์ไลน์รวมทุกเพจ
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              ฿{pipelineMetrics.totalPipelineValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Metric 2: Closed Won Deals */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
              ยอดปิดการขายแล้ว (มัดจำ/จบงาน)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>
              ฿{pipelineMetrics.closedWonValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Metric 3: Active Quotes in Progress */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
              ยอดรอนัดดูหน้างาน / เสนอราคา
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#d97706' }}>
              ฿{pipelineMetrics.pendingQuotesValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Metric 4: Win Rate % */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#f5f3ff',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
              อัตราการปิดการขาย (Win Rate)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#7c3aed' }}>
              {pipelineMetrics.winRate}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER & ACTION TOOLBAR */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '10px 14px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Left: Page Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '100%' }}>
          <button
            onClick={() => setFilterChannel('all')}
            style={{
              padding: '5px 12px',
              borderRadius: '999px',
              border: filterChannel === 'all' ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
              backgroundColor: filterChannel === 'all' ? '#0f172a' : '#ffffff',
              color: filterChannel === 'all' ? '#ffffff' : '#334155',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ทุกเพจ ({leads.length})
          </button>

          {(facebookPages || []).map(p => {
            const isSelected = filterChannel === p.id;
            const theme = getPageTheme(p.id);
            const count = leads.filter(l => l.channel === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setFilterChannel(p.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '999px',
                  border: isSelected ? `1.5px solid ${theme.primary}` : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? theme.bgSelected : '#ffffff',
                  color: isSelected ? theme.darkText : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>{theme.icon}</span>
                <span>{theme.shortName}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Search box & Add Lead */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อลูกค้า, ข้อความ..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={onOpenAddLeadModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)'
            }}
          >
            <Plus size={14} /> + เพิ่มลูกค้า
          </button>
        </div>
      </div>

      {/* 3. KANBAN HORIZONTALLY SCROLLABLE BOARD */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '14px',
        alignItems: 'flex-start'
      }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = columnsData[stage.id] || [];
          const stageTotalValue = stageLeads.reduce((acc, l) => acc + (Number(l.dealValue) || 0), 0);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              style={{
                width: '280px',
                minWidth: '280px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: `1.5px solid ${stage.borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: stage.bgColor,
                borderRadius: '11px 11px 0 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '0.86rem', color: stage.color }}>
                    <span>{stage.icon}</span>
                    <span>{stage.title}</span>
                  </div>
                  <span style={{
                    backgroundColor: stage.color,
                    color: '#ffffff',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: '800'
                  }}>
                    {stageLeads.length}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                  <span>ยอดคาดการณ์:</span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>
                    ฿{stageTotalValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div style={{
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 280px)',
                minHeight: '80px'
              }}>
                {stageLeads.length === 0 ? (
                  <div style={{
                    padding: '24px 10px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.76rem',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '8px',
                    margin: '4px 0'
                  }}>
                    ลากลูกค้ามาวางในช่องนี้
                  </div>
                ) : (
                  stageLeads.map(lead => {
                    const theme = getPageTheme(lead.channel);
                    const isDueToday = isFollowUpDue(lead.followUpDate);
                    const isEditingThisDeal = editingDealId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '10px',
                          border: `1px solid ${theme.cardBorder || '#e2e8f0'}`,
                          borderLeft: `4px solid ${isDueToday ? '#ef4444' : theme.primary}`,
                          padding: '11px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                          cursor: 'grab',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.04)';
                        }}
                      >
                        {/* Top: Customer Avatar, Name & Page Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <CustomerAvatar lead={lead} size={28} border="1px solid #e2e8f0" />
                            <div style={{ fontWeight: '800', fontSize: '0.86rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {lead.name}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: '700',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: theme.badgeBg || '#f1f5f9',
                            color: theme.darkText || '#334155',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}>
                            {theme.icon} {theme.shortName}
                          </span>
                        </div>

                        {/* Inquiry / Needs preview */}
                        <div style={{
                          fontSize: '0.76rem',
                          color: '#475569',
                          lineHeight: '1.35',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {lead.inquiry || 'สนใจสอบถามบริการ'}
                        </div>

                        {/* Deal Value Editor */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          marginTop: '2px'
                        }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>มูลค่าดีล:</span>
                          {isEditingThisDeal ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                value={editDealValue}
                                onChange={(e) => setEditDealValue(e.target.value)}
                                autoFocus
                                style={{
                                  width: '80px',
                                  padding: '1px 4px',
                                  fontSize: '0.74rem',
                                  borderRadius: '4px',
                                  border: '1px solid #2563eb'
                                }}
                              />
                              <button
                                onClick={() => handleSaveDealValue(lead.id)}
                                style={{
                                  padding: '2px 5px',
                                  backgroundColor: '#10b981',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '0.65rem',
                                  cursor: 'pointer'
                                }}
                              >
                                บันทึก
                              </button>
                            </div>
                          ) : (
                            <span 
                              onClick={() => handleStartEditDeal(lead)}
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                color: lead.dealValue > 0 ? '#059669' : '#94a3b8',
                                cursor: 'pointer',
                                borderBottom: '1px dashed #cbd5e1'
                              }}
                              title="คลิกเพื่อแก้ไขมูลค่าดีล"
                            >
                              ฿{(Number(lead.dealValue) || 0).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Footer: Admin & Follow up */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.68rem',
                          color: '#64748b',
                          marginTop: '4px'
                        }}>
                          <span>👤 {lead.admin || 'แอดมิน'}</span>
                          {lead.followUpDate ? (
                            <span style={{
                              fontWeight: isDueToday ? '800' : '600',
                              color: isDueToday ? '#dc2626' : '#64748b',
                              backgroundColor: isDueToday ? '#fee2e2' : 'transparent',
                              padding: isDueToday ? '1px 5px' : '0',
                              borderRadius: '4px'
                            }}>
                              ⏰ {isDueToday ? 'ตามวันนี้' : lead.followUpDate.slice(5)}
                            </span>
                          ) : (
                            <span>{lead.date ? lead.date.slice(5, 10) : ''}</span>
                          )}
                        </div>

                        {/* Card Actions: Open Chat & Quick Stage Move */}
                        <div style={{
                          display: 'flex',
                          gap: '6px',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '6px',
                          marginTop: '2px'
                        }}>
                          <button
                            type="button"
                            onClick={() => onOpenChat && onOpenChat(lead.id)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '5px',
                              borderRadius: '6px',
                              backgroundColor: '#1877f2',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            <MessageSquare size={13} /> แชทคุย
                          </button>

                          {/* Quick Stage Switcher Select */}
                          <select
                            value={normalizeStatus(lead.status)}
                            onChange={(e) => handleMoveStage(lead.id, e.target.value)}
                            style={{
                              padding: '4px 6px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.7rem',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              cursor: 'pointer',
                              maxWidth: '100px'
                            }}
                            title="ย้ายสถานะ"
                          >
                            {PIPELINE_STAGES.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
