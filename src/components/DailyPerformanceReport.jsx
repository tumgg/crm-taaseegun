import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Percent,
  Eye,
  Download,
  Filter,
  ArrowUpRight,
  MessageSquare,
  Building2,
  ChevronRight,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';
import { CustomerAvatar } from './UnifiedChatCenter';

// Helper: Extract YYYY-MM-DD from lead's inquiry date
export function getLeadDateKey(lead) {
  if (!lead) return '';
  if (lead.date && typeof lead.date === 'string') {
    const match = lead.date.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const ts = lead.timestamp || (lead.updatedTime ? new Date(lead.updatedTime).getTime() : null);
  if (ts) {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
  }
  return '';
}

// Helper: Check if status indicates closed & won deal
export function isWonStatus(status) {
  if (!status) return false;
  const s = String(status).toLowerCase();
  return (
    s.includes('won') ||
    s.includes('ปิดการขาย') ||
    s.includes('มัดจำ') ||
    s.includes('จบงาน') ||
    s.includes('ส่งมอบ') ||
    s.includes('สำเร็จ')
  );
}

// Helper: Extract date when deal was closed/won
export function getLeadWonDate(lead) {
  if (!isWonStatus(lead?.status)) return null;
  if (lead.wonDate && typeof lead.wonDate === 'string') {
    const match = lead.wonDate.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  return getLeadDateKey(lead);
}

// Helper: Format Thai Date
export function formatThaiDate(dateStr, includeWeekday = true) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);

  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  let prefix = '';
  if (dateStr === todayStr) prefix = 'วันนี้ • ';
  else if (dateStr === yesterdayStr) prefix = 'เมื่อวาน • ';

  const weekday = includeWeekday && !isNaN(d.getDay()) ? `${thaiDays[d.getDay()]} ` : '';
  const thaiYear = year + 543;
  return `${prefix}${weekday}${day} ${thaiMonths[month]} ${thaiYear}`;
}

export default function DailyPerformanceReport({
  leads = [],
  setLeads,
  facebookPages = [],
  onOpenChat
}) {
  const [dateRangePreset, setDateRangePreset] = useState('7days'); // 'today', 'yesterday', '7days', '14days', '30days', 'this_month', 'all', 'custom'
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [viewMode, setViewMode] = useState('daily_list'); // 'daily_list', 'cross_page_matrix'
  const [activeCustomerModal, setActiveCustomerModal] = useState(null); // { date: string, channel: string, leads: [] }
  const [modalFilter, setModalFilter] = useState('all'); // 'all', 'won', 'pipeline'
  const [editingDealId, setEditingDealId] = useState(null);
  const [editDealValue, setEditDealValue] = useState('');

  // Page Color/Theme Mapping
  const getPageInfo = (channelId, fallbackName = '') => {
    const page = facebookPages.find(p => p.id === channelId);
    const name = page?.name || fallbackName || 'เพจทั่วไป';
    let color = '#1877f2';
    let bg = '#eff6ff';
    let border = '#bfdbfe';

    if (name.includes('Good Vibes')) {
      color = '#0284c7';
      bg = '#f0f9ff';
      border = '#bae6fd';
    } else if (name.includes('ช่างเสือ') || name.includes('ทาสีกัน')) {
      color = '#16a34a';
      bg = '#f0fdf4';
      border = '#bbf7d0';
    } else if (name.includes('RoomsPainting') || name.includes('คอนโด')) {
      color = '#8b5cf6';
      bg = '#f5f3ff';
      border = '#ddd6fe';
    } else if (name.includes('ช่างหมี')) {
      color = '#d97706';
      bg = '#fffbeb';
      border = '#fde68a';
    }

    return { name, color, bg, border };
  };

  // Determine active date boundary
  const dateBoundary = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    if (dateRangePreset === 'today') {
      return { start: todayStr, end: todayStr };
    }
    if (dateRangePreset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = `${y.getFullYear()}-${pad(y.getMonth() + 1)}-${pad(y.getDate())}`;
      return { start: yStr, end: yStr };
    }
    if (dateRangePreset === '7days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 6);
      return { start: `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}`, end: todayStr };
    }
    if (dateRangePreset === '14days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 13);
      return { start: `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}`, end: todayStr };
    }
    if (dateRangePreset === '30days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 29);
      return { start: `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}`, end: todayStr };
    }
    if (dateRangePreset === 'this_month') {
      const startOfMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      return { start: startOfMonth, end: todayStr };
    }
    if (dateRangePreset === 'custom') {
      return { start: customStartDate || '2000-01-01', end: customEndDate || '2099-12-31' };
    }
    return { start: '2000-01-01', end: '2099-12-31' }; // 'all'
  }, [dateRangePreset, customStartDate, customEndDate]);

  // Aggregate leads by date and channel
  const { dailyStats, totals, crossPageMatrix, sortedDates } = useMemo(() => {
    const dateMap = new Map(); // dateKey -> { totalInbound, totalWon, totalPipeline, totalRevenue, pages: Map(channelId -> { inbound, won, revenue, leads: [] }) }
    const pagesSet = new Set();

    let grandInbound = 0;
    let grandWon = 0;
    let grandPipeline = 0;
    let grandRevenue = 0;

    leads.forEach(lead => {
      const dateKey = getLeadDateKey(lead);
      if (!dateKey) return;

      // Filter by date boundary
      if (dateBoundary.start && dateKey < dateBoundary.start) return;
      if (dateBoundary.end && dateKey > dateBoundary.end) return;

      const channelId = lead.channel || 'unknown';
      const channelName = lead.channelName || 'เพจไม่ระบุ';
      pagesSet.add(channelId);

      // Filter by channel if selected
      const matchChannel = selectedChannel === 'all' || lead.channel === selectedChannel;
      if (!matchChannel) return;

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          totalInbound: 0,
          totalWon: 0,
          totalPipeline: 0,
          totalRevenue: 0,
          pages: new Map(),
          allLeads: []
        });
      }

      const dayObj = dateMap.get(dateKey);
      dayObj.totalInbound += 1;
      dayObj.allLeads.push(lead);
      grandInbound += 1;

      const isWon = isWonStatus(lead.status);
      const dealVal = Number(lead.dealValue) || 0;

      if (isWon) {
        dayObj.totalWon += 1;
        dayObj.totalRevenue += dealVal;
        grandWon += 1;
        grandRevenue += dealVal;
      } else {
        dayObj.totalPipeline += 1;
        grandPipeline += 1;
      }

      // Per page grouping
      if (!dayObj.pages.has(channelId)) {
        dayObj.pages.set(channelId, {
          channelId,
          channelName,
          inbound: 0,
          won: 0,
          pipeline: 0,
          revenue: 0,
          leads: []
        });
      }
      const pageDayObj = dayObj.pages.get(channelId);
      pageDayObj.inbound += 1;
      pageDayObj.leads.push(lead);
      if (isWon) {
        pageDayObj.won += 1;
        pageDayObj.revenue += dealVal;
      } else {
        pageDayObj.pipeline += 1;
      }
    });

    // Sort dates descending (newest first)
    const sortedDatesList = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    const dailyStatsList = sortedDatesList.map(dateKey => {
      const item = dateMap.get(dateKey);
      const pagesArray = Array.from(item.pages.values());
      const winRate = item.totalInbound > 0 ? Math.round((item.totalWon / item.totalInbound) * 100) : 0;
      return {
        ...item,
        winRate,
        pages: pagesArray
      };
    });

    // Cross-page Matrix Calculation
    const matrixRows = sortedDatesList.map(dateKey => {
      const item = dateMap.get(dateKey);
      const row = {
        date: dateKey,
        totalInbound: item.totalInbound,
        totalWon: item.totalWon,
        totalRevenue: item.totalRevenue,
        pagesData: {}
      };

      facebookPages.forEach(p => {
        const pData = item.pages.get(p.id);
        row.pagesData[p.id] = {
          inbound: pData ? pData.inbound : 0,
          won: pData ? pData.won : 0,
          revenue: pData ? pData.revenue : 0,
          leads: pData ? pData.leads : []
        };
      });

      return row;
    });

    const overallWinRate = grandInbound > 0 ? Math.round((grandWon / grandInbound) * 100) : 0;
    const avgInboundPerDay = dailyStatsList.length > 0 ? (grandInbound / dailyStatsList.length).toFixed(1) : '0';

    return {
      dailyStats: dailyStatsList,
      totals: {
        inbound: grandInbound,
        won: grandWon,
        pipeline: grandPipeline,
        revenue: grandRevenue,
        winRate: overallWinRate,
        daysCount: dailyStatsList.length,
        avgInboundPerDay
      },
      crossPageMatrix: matrixRows,
      sortedDates: sortedDatesList
    };
  }, [leads, selectedChannel, dateBoundary, facebookPages]);

  // Max inbound for bar chart scaling
  const maxInboundInChart = useMemo(() => {
    return Math.max(1, ...dailyStats.map(d => d.totalInbound));
  }, [dailyStats]);

  // Handle Quick Status Change from Customer Modal
  const handleQuickStatusChange = (leadId, newStatus) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: newStatus,
          wonDate: isWonStatus(newStatus) ? (l.wonDate || todayStr) : l.wonDate
        };
      }
      return l;
    });
    setLeads(updated);

    // Refresh active modal leads
    if (activeCustomerModal) {
      setActiveCustomerModal(prev => ({
        ...prev,
        leads: prev.leads.map(l => l.id === leadId ? {
          ...l,
          status: newStatus,
          wonDate: isWonStatus(newStatus) ? (l.wonDate || todayStr) : l.wonDate
        } : l)
      }));
    }
  };

  // Handle Deal Value Save
  const handleSaveDealValue = (leadId) => {
    const num = parseFloat(editDealValue.replace(/,/g, '')) || 0;
    const updated = leads.map(l => l.id === leadId ? { ...l, dealValue: num } : l);
    setLeads(updated);
    setEditingDealId(null);
    setEditDealValue('');

    if (activeCustomerModal) {
      setActiveCustomerModal(prev => ({
        ...prev,
        leads: prev.leads.map(l => l.id === leadId ? { ...l, dealValue: num } : l)
      }));
    }
  };

  // Export CSV of Daily Summary
  const handleExportDailyCsv = () => {
    if (dailyStats.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = ['วันที่', 'เพจ', 'จำนวนคนทัก (Inbound)', 'ปิดการขายสำเร็จ (Won)', 'อยู่ระหว่างคุย (Pipeline)', 'อัตราปิดงาน (%)', 'มูลค่าปิดงาน (บาท)'];
    const rows = [];

    dailyStats.forEach(day => {
      if (selectedChannel === 'all') {
        day.pages.forEach(p => {
          const winRate = p.inbound > 0 ? Math.round((p.won / p.inbound) * 100) : 0;
          rows.push([
            `"${day.date}"`,
            `"${p.channelName.replace(/"/g, '""')}"`,
            p.inbound,
            p.won,
            p.pipeline,
            `${winRate}%`,
            p.revenue
          ]);
        });
      } else {
        rows.push([
          `"${day.date}"`,
          `"${day.pages[0]?.channelName || 'เพจ'}"`,
          day.totalInbound,
          day.totalWon,
          day.totalPipeline,
          `${day.winRate}%`,
          day.totalRevenue
        ]);
      }
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `daily_inbound_deals_${dateBoundary.start}_to_${dateBoundary.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered leads in the detail modal
  const modalDisplayLeads = useMemo(() => {
    if (!activeCustomerModal) return [];
    if (modalFilter === 'won') return activeCustomerModal.leads.filter(l => isWonStatus(l.status));
    if (modalFilter === 'pipeline') return activeCustomerModal.leads.filter(l => !isWonStatus(l.status));
    return activeCustomerModal.leads;
  }, [activeCustomerModal, modalFilter]);

  return (
    <div className="daily-report-container animate-fade-in" style={{ paddingBottom: '32px' }}>
      {/* 1. Header & Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
            }}>
              <Calendar size={18} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              สถิติคนทัก & ยอดปิดจ็อบรายวัน (Daily Inbound & Closed Deals)
            </h2>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            ดูจำนวนลูกค้าที่ทักเข้ามาในแต่ละวัน แยกรายเพจ และจำนวนคนที่ปิดการขาย/จบงานได้สำเร็จ พร้อมมูลค่าเงินและอัตราความสำเร็จ
          </p>
        </div>

        {/* Action Button: Export CSV */}
        <button
          onClick={handleExportDailyCsv}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '9px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          <Download size={14} />
          <span>ส่งออกสรุปรายวัน (CSV)</span>
        </button>
      </div>

      {/* 2. Filter & Controls Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Left: Date Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginRight: '4px' }}>
            ช่วงเวลา:
          </span>

          {[
            { id: 'today', label: 'วันนี้' },
            { id: 'yesterday', label: 'เมื่อวาน' },
            { id: '7days', label: '7 วันล่าสุด' },
            { id: '14days', label: '14 วัน' },
            { id: '30days', label: '30 วัน' },
            { id: 'this_month', label: 'เดือนนี้' },
            { id: 'all', label: 'ทั้งหมด' }
          ].map(preset => {
            const isActive = dateRangePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setDateRangePreset(preset.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? '700' : '500',
                  backgroundColor: isActive ? '#0f172a' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Right: Page Selector & View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Facebook Page Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>เพจ:</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                backgroundColor: '#f8fafc',
                fontWeight: '600',
                color: '#1e293b',
                cursor: 'pointer',
                maxWidth: '260px'
              }}
            >
              <option value="all">🌐 รวมทุกเพจ Facebook ({facebookPages.length} เพจ)</option>
              {facebookPages.map(page => (
                <option key={page.id} value={page.id}>
                  📄 {page.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Daily List vs Cross-Page Matrix */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            padding: '3px',
            borderRadius: '9px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setViewMode('daily_list')}
              style={{
                padding: '5px 11px',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: viewMode === 'daily_list' ? '700' : '500',
                backgroundColor: viewMode === 'daily_list' ? '#ffffff' : 'transparent',
                color: viewMode === 'daily_list' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'daily_list' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              📅 สรุปตามวัน
            </button>
            <button
              onClick={() => setViewMode('cross_page_matrix')}
              style={{
                padding: '5px 11px',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: viewMode === 'cross_page_matrix' ? '700' : '500',
                backgroundColor: viewMode === 'cross_page_matrix' ? '#ffffff' : 'transparent',
                color: viewMode === 'cross_page_matrix' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'cross_page_matrix' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              📊 ตารางเทียบ 4 เพจ
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Card 1: Total Inbound */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 18px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #1877f2',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>
              ลูกค้าทักเข้าทั้งหมด (Inbound)
            </span>
            <Users size={16} color="#1877f2" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
            {totals.inbound.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>คน</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '6px', fontWeight: '600' }}>
            เฉลี่ย {totals.avgInboundPerDay} คน/วัน ({totals.daysCount} วันที่แสดง)
          </div>
        </div>

        {/* Card 2: Closed & Won */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 18px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #10b981',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>
              ปิดจ็อบจบงานได้ (Closed Won)
            </span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#059669', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
            {totals.won.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>คน</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '6px', fontWeight: '600' }}>
            อัตราปิดงาน {totals.winRate}% (Win Rate)
          </div>
        </div>

        {/* Card 3: Total Revenue Closed */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 18px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #059669',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>
              มูลค่าปิดงานสำเร็จ (Won Revenue)
            </span>
            <DollarSign size={16} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#047857', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
            ฿{totals.revenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
            {totals.won > 0 ? `เฉลี่ย ฿${Math.round(totals.revenue / totals.won).toLocaleString()} / งาน` : 'รอปิดดีลแรก'}
          </div>
        </div>

        {/* Card 4: In Pipeline */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 18px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #f59e0b',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>
              อยู่ระหว่างคุย & ไปป์ไลน์ (Active)
            </span>
            <TrendingUp size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#d97706', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
            {totals.pipeline.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>คน</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '6px', fontWeight: '600' }}>
            ทักใหม่ / นัดดูหน้างาน / เสนอราคา
          </div>
        </div>
      </div>

      {/* 4. Visual Daily Trend Bar Chart */}
      {dailyStats.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
                📊 แนวโน้มคนทักเข้า VS ปิดจ็อบสำเร็จในแต่ละวัน
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                เปรียบเทียบจำนวนคนที่ทักแชทเข้ามา (สีน้ำเงิน) กับจำนวนคนที่ปิดการขาย/จบงานสำเร็จ (สีเขียว)
              </span>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3b82f6' }}></span>
                <span style={{ color: '#1e40af' }}>คนทักเข้า (Inbound)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }}></span>
                <span style={{ color: '#065f46' }}>ปิดจ็อบสำเร็จ (Won)</span>
              </div>
            </div>
          </div>

          {/* Interactive Bars Container */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            height: '160px',
            paddingTop: '20px',
            paddingBottom: '26px',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto'
          }}>
            {dailyStats.slice(0, 14).reverse().map(day => {
              const inboundHeightPct = Math.max(12, Math.round((day.totalInbound / maxInboundInChart) * 100));
              const wonHeightPct = day.totalWon > 0 ? Math.max(8, Math.round((day.totalWon / maxInboundInChart) * 100)) : 0;
              const dateLabel = day.date.slice(5); // "10-16"

              return (
                <div
                  key={day.date}
                  onClick={() => setActiveCustomerModal({ date: day.date, channel: selectedChannel, leads: day.allLeads })}
                  style={{
                    flex: '1',
                    minWidth: '54px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'transform 0.15s ease'
                  }}
                  title={`${day.date}: ทัก ${day.totalInbound} คน | ปิดงาน ${day.totalWon} คน (คลิกเพื่อดูรายชื่อ)`}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Values on top */}
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: '#1e3a8a',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {day.totalInbound}
                  </div>

                  {/* Bars Container */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    width: '100%',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    {/* Inbound Bar */}
                    <div style={{
                      width: '18px',
                      height: `${inboundHeightPct}%`,
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                    }} />

                    {/* Won Bar */}
                    <div style={{
                      width: '18px',
                      height: `${wonHeightPct}%`,
                      backgroundColor: day.totalWon > 0 ? '#10b981' : '#f1f5f9',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s ease',
                      boxShadow: day.totalWon > 0 ? '0 2px 4px rgba(16, 185, 129, 0.2)' : 'none'
                    }} />
                  </div>

                  {/* Date label at bottom */}
                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    color: '#64748b',
                    marginTop: '8px',
                    whiteSpace: 'nowrap'
                  }}>
                    {dateLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Main Content: Daily List View OR Cross-Page Matrix */}
      {viewMode === 'daily_list' ? (
        /* View 1: Daily Breakdown Table */
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '800', fontSize: '0.96rem', color: '#0f172a' }}>
                📋 ตารางสรุปรายวัน ({dailyStats.length} วัน)
              </span>
              <span style={{
                fontSize: '0.74rem',
                backgroundColor: '#e2e8f0',
                color: '#334155',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: '700'
              }}>
                รวม {totals.inbound} คนทัก • {totals.won} ปิดงาน
              </span>
            </div>
          </div>

          {dailyStats.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Calendar size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#64748b' }}>ไม่มีข้อมูลคนทักเข้ามาในช่วงเวลานี้</div>
              <div style={{ fontSize: '0.85rem' }}>ลองปรับตัวเลือกช่วงเวลา หรือเลือกดู "ทั้งหมด"</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                    <th style={{ padding: '12px 18px', width: '220px' }}>📅 วันที่</th>
                    <th style={{ padding: '12px 14px' }}>เพจที่ลูกค้าทักเข้ามา</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>📥 คนทักมา</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>🤝 ปิดจ็อบสำเร็จ</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>⏳ กำลังคุย</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>🎯 Win Rate</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>💰 ยอดปิดงาน</th>
                    <th style={{ padding: '12px 18px', textAlign: 'center' }}>รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.map((day, idx) => {
                    const isEven = idx % 2 === 0;

                    return (
                      <tr
                        key={day.date}
                        style={{
                          backgroundColor: isEven ? '#ffffff' : '#fcfdfd',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isEven ? '#ffffff' : '#fcfdfd'; }}
                      >
                        {/* 1. Date */}
                        <td style={{ padding: '14px 18px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.92rem' }}>{formatThaiDate(day.date)}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                            {day.date}
                          </div>
                        </td>

                        {/* 2. Pages Breakdown Chips */}
                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {day.pages.map(p => {
                              const pInfo = getPageInfo(p.channelId, p.channelName);
                              return (
                                <button
                                  key={p.channelId}
                                  onClick={() => setActiveCustomerModal({ date: day.date, channel: p.channelId, channelName: p.channelName, leads: p.leads })}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 9px',
                                    borderRadius: '7px',
                                    fontSize: '0.76rem',
                                    fontWeight: '700',
                                    backgroundColor: pInfo.bg,
                                    color: pInfo.color,
                                    border: `1px solid ${pInfo.border}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title={`คลิกดูรายชื่อลูกค้าเพจ ${p.channelName} ของวันนี้ (${p.inbound} คน)`}
                                >
                                  <span>{pInfo.name}</span>
                                  <span style={{
                                    backgroundColor: pInfo.color,
                                    color: '#ffffff',
                                    padding: '1px 5px',
                                    borderRadius: '999px',
                                    fontSize: '0.68rem',
                                    fontWeight: '800'
                                  }}>
                                    {p.inbound}
                                  </span>
                                  {p.won > 0 && (
                                    <span style={{
                                      backgroundColor: '#10b981',
                                      color: '#ffffff',
                                      padding: '1px 5px',
                                      borderRadius: '999px',
                                      fontSize: '0.68rem',
                                      fontWeight: '800'
                                    }}>
                                      ✓ {p.won}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* 3. Total Inbound */}
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: '800',
                            fontSize: '0.92rem'
                          }}>
                            {day.totalInbound}
                          </span>
                        </td>

                        {/* 4. Total Won */}
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            backgroundColor: day.totalWon > 0 ? '#ecfdf5' : '#f8fafc',
                            color: day.totalWon > 0 ? '#059669' : '#94a3b8',
                            border: day.totalWon > 0 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                            fontWeight: '800',
                            fontSize: '0.92rem'
                          }}>
                            {day.totalWon > 0 ? `🎉 ${day.totalWon}` : '0'}
                          </span>
                        </td>

                        {/* 5. In Pipeline */}
                        <td style={{ padding: '14px 14px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>
                          {day.totalPipeline}
                        </td>

                        {/* 6. Win Rate */}
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                            <span style={{ fontWeight: '800', color: day.winRate > 0 ? '#059669' : '#94a3b8' }}>
                              {day.winRate}%
                            </span>
                            <div style={{
                              width: '46px',
                              height: '4px',
                              borderRadius: '2px',
                              backgroundColor: '#e2e8f0',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${day.winRate}%`,
                                height: '100%',
                                backgroundColor: '#10b981'
                              }} />
                            </div>
                          </div>
                        </td>

                        {/* 7. Total Won Revenue */}
                        <td style={{ padding: '14px 14px', textAlign: 'right', fontWeight: '800', color: day.totalRevenue > 0 ? '#047857' : '#94a3b8' }}>
                          {day.totalRevenue > 0 ? `฿${day.totalRevenue.toLocaleString()}` : '-'}
                        </td>

                        {/* 8. Action: View Customers */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            onClick={() => setActiveCustomerModal({ date: day.date, channel: selectedChannel, leads: day.allLeads })}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; }}
                          >
                            <Eye size={13} />
                            <span>ดูรายชื่อ ({day.totalInbound})</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* View 2: Cross-Page Matrix Table */
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '800', fontSize: '0.96rem', color: '#0f172a' }}>
                📊 ตารางเปรียบเทียบคนทัก & ยอดปิดงาน แยก 4 เพจ
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                แสดง (คนทัก / ปิดงาน) ในแต่ละวันสำหรับทุกเพจพร้อมกัน
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                  <th style={{ padding: '12px 18px', width: '180px' }}>📅 วันที่</th>
                  {facebookPages.map(page => {
                    const pInfo = getPageInfo(page.id, page.name);
                    return (
                      <th key={page.id} style={{ padding: '12px 14px', textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                        <div style={{ color: pInfo.color, fontWeight: '800', fontSize: '0.84rem' }}>{pInfo.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500' }}>ทักเข้า / ปิดได้</div>
                      </th>
                    );
                  })}
                  <th style={{ padding: '12px 16px', textAlign: 'center', backgroundColor: '#f1f5f9', borderLeft: '1px solid #e2e8f0', fontWeight: '800', color: '#0f172a' }}>
                    รวมทั้งวัน
                  </th>
                </tr>
              </thead>
              <tbody>
                {crossPageMatrix.map((row, idx) => {
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={row.date}
                      style={{
                        backgroundColor: isEven ? '#ffffff' : '#fcfdfd',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      {/* Date */}
                      <td style={{ padding: '12px 18px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <div>{formatThaiDate(row.date)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{row.date}</div>
                      </td>

                      {/* Each Page Column */}
                      {facebookPages.map(page => {
                        const pData = row.pagesData[page.id] || { inbound: 0, won: 0, revenue: 0, leads: [] };
                        const hasLeads = pData.inbound > 0;

                        return (
                          <td
                            key={page.id}
                            style={{
                              padding: '12px 14px',
                              textAlign: 'center',
                              borderLeft: '1px solid #f1f5f9'
                            }}
                          >
                            {hasLeads ? (
                              <button
                                onClick={() => setActiveCustomerModal({ date: row.date, channel: page.id, channelName: page.name, leads: pData.leads })}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  backgroundColor: pData.won > 0 ? '#ecfdf5' : '#eff6ff',
                                  border: pData.won > 0 ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                                  cursor: 'pointer',
                                  fontSize: '0.82rem',
                                  fontWeight: '700'
                                }}
                                title="คลิกเพื่อดูรายชื่อลูกค้า"
                              >
                                <span style={{ color: '#1d4ed8' }}>{pData.inbound} ทัก</span>
                                <span style={{ color: '#94a3b8' }}>/</span>
                                <span style={{ color: pData.won > 0 ? '#059669' : '#64748b' }}>
                                  {pData.won > 0 ? `🎉 ${pData.won}` : '0 ปิด'}
                                </span>
                              </button>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total of Day */}
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        borderLeft: '1px solid #e2e8f0',
                        fontWeight: '800'
                      }}>
                        <div style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                          {row.totalInbound} คน
                        </div>
                        <div style={{ fontSize: '0.74rem', color: row.totalWon > 0 ? '#059669' : '#94a3b8' }}>
                          {row.totalWon > 0 ? `ปิดได้ ${row.totalWon} คน` : '0 ปิดงาน'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Customer Detail Modal for Specific Day */}
      {activeCustomerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            animation: 'modalSlideIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    👥 รายชื่อลูกค้าที่ทักเข้ามา: {formatThaiDate(activeCustomerModal.date)}
                  </h3>
                  <span style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: '800'
                  }}>
                    {activeCustomerModal.leads.length} คน
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {activeCustomerModal.channelName ? `เพจ: ${activeCustomerModal.channelName}` : 'รวมทุกลุ่มเพจ Facebook'}
                </div>
              </div>

              <button
                onClick={() => setActiveCustomerModal(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Sub-filter Toolbar */}
            <div style={{
              padding: '10px 24px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>แสดง:</span>
              {[
                { id: 'all', label: `ทั้งหมด (${activeCustomerModal.leads.length})` },
                { id: 'won', label: `ปิดการขายแล้ว (${activeCustomerModal.leads.filter(l => isWonStatus(l.status)).length})` },
                { id: 'pipeline', label: `กำลังคุย / อยู่ในไปป์ไลน์ (${activeCustomerModal.leads.filter(l => !isWonStatus(l.status)).length})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setModalFilter(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: modalFilter === f.id ? '700' : '500',
                    backgroundColor: modalFilter === f.id ? '#0f172a' : '#f1f5f9',
                    color: modalFilter === f.id ? '#ffffff' : '#475569',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Modal Customer List Body */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              {modalDisplayLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  ไม่มีลูกค้าในหมวดนี้
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {modalDisplayLeads.map(lead => {
                    const isWon = isWonStatus(lead.status);
                    const pInfo = getPageInfo(lead.channel, lead.channelName);

                    return (
                      <div
                        key={lead.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: isWon ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          backgroundColor: isWon ? '#f0fdf4' : '#ffffff',
                          gap: '14px',
                          flexWrap: 'wrap'
                        }}
                      >
                        {/* Left: Customer Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                          <CustomerAvatar name={lead.name} avatar={lead.avatar} size={38} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>
                                {lead.name}
                              </span>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: pInfo.bg,
                                color: pInfo.color,
                                border: `1px solid ${pInfo.border}`,
                                fontWeight: '700'
                              }}>
                                {pInfo.name}
                              </span>
                            </div>
                            <div style={{
                              fontSize: '0.78rem',
                              color: '#64748b',
                              marginTop: '2px',
                              maxWidth: '340px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              💬 {lead.inquiry || 'ลูกค้าทักเข้ามาสอบถาม'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                              🕒 {lead.date || 'วันนี้'}
                            </div>
                          </div>
                        </div>

                        {/* Right: Deal Value + Status Selector + Chat Action */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          {/* Deal Value Editor */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>มูลค่า:</span>
                            {editingDealId === lead.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="text"
                                  value={editDealValue}
                                  onChange={(e) => setEditDealValue(e.target.value)}
                                  placeholder="0"
                                  autoFocus
                                  style={{
                                    width: '80px',
                                    padding: '4px 6px',
                                    borderRadius: '6px',
                                    border: '1px solid #3b82f6',
                                    fontSize: '0.8rem',
                                    fontWeight: '700'
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveDealValue(lead.id);
                                    if (e.key === 'Escape') setEditingDealId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveDealValue(lead.id)}
                                  style={{
                                    padding: '3px 8px',
                                    backgroundColor: '#10b981',
                                    color: '#fff',
                                    borderRadius: '5px',
                                    border: 'none',
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    fontWeight: '700'
                                  }}
                                >
                                  บันทึก
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingDealId(lead.id);
                                  setEditDealValue(String(lead.dealValue || ''));
                                }}
                                style={{
                                  backgroundColor: '#f8fafc',
                                  border: '1px dashed #cbd5e1',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '0.8rem',
                                  fontWeight: '800',
                                  color: (lead.dealValue && lead.dealValue > 0) ? '#059669' : '#64748b',
                                  cursor: 'pointer'
                                }}
                                title="คลิกเพื่อแก้ไขมูลค่าดีล"
                              >
                                {lead.dealValue && lead.dealValue > 0 ? `฿${lead.dealValue.toLocaleString()}` : '+ ใส่ยอดเงิน'}
                              </button>
                            )}
                          </div>

                          {/* Quick Status Dropdown */}
                          <select
                            value={lead.status || 'ทักใหม่ (New)'}
                            onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '7px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              backgroundColor: isWon ? '#dcfce7' : '#f1f5f9',
                              color: isWon ? '#15803d' : '#334155',
                              border: isWon ? '1px solid #86efac' : '1px solid #cbd5e1',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="ทักใหม่ (New)">📥 ทักใหม่ (New)</option>
                            <option value="ติดต่อแล้ว">💬 ติดต่อแล้ว</option>
                            <option value="นัดดูหน้างาน">📐 นัดดูหน้างาน</option>
                            <option value="เสนอราคาแล้ว">📄 เสนอราคาแล้ว</option>
                            <option value="มัดจำแล้ว (Won)">🤝 มัดจำแล้ว (Won)</option>
                            <option value="ปิดการขายแล้ว (Won)">🏆 ปิดการขายแล้ว (Won)</option>
                            <option value="จบงานแล้ว">✨ จบงานแล้ว</option>
                            <option value="ยกเลิก / ไม่สะดวก">❌ ยกเลิก / ไม่สะดวก</option>
                          </select>

                          {/* Jump to Chat Center */}
                          {onOpenChat && (
                            <button
                              onClick={() => {
                                setActiveCustomerModal(null);
                                onOpenChat(lead.id);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '7px',
                                backgroundColor: '#1877f2',
                                color: '#ffffff',
                                fontSize: '0.76rem',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              title="เปิดหน้าแชทเพื่อตอบกลับลูกค้ารายนี้"
                            >
                              <MessageSquare size={12} />
                              <span>เปิดแชท</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#64748b'
            }}>
              <span>
                💡 คุณสามารถเปลี่ยนสถานะเป็น <strong>"ปิดการขายแล้ว (Won)"</strong> หรือใส่ยอดเงินได้ทันที ระบบจะอัปเดตสถิติรายวันแบบเรียลไทม์
              </span>
              <button
                onClick={() => setActiveCustomerModal(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
