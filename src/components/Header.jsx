import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Settings2, 
  PlusCircle, 
  Download, 
  Sparkles,
  MessageSquare,
  SlidersHorizontal,
  X,
  LogOut,
  Kanban
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onOpenAddLeadModal, 
  onExportCsv,
  onExportBackup,
  onResetData,
  totalLeadsCount,
  currentUser,
  onLogout,
  onOpenTeamModal,
  teamMembersCount = 3
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header style={{
      marginBottom: activeTab === 'chat' ? '6px' : '16px',
      borderBottom: '1px solid var(--border-subtle)',
      paddingBottom: activeTab === 'chat' ? '6px' : '12px',
      flexShrink: 0
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: activeTab === 'chat' ? '6px' : '10px'
      }}>
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1877f2 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 3px 10px rgba(24, 119, 242, 0.3)',
            flexShrink: 0
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h1 className="header-brand-title" style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
                OmniSocial & Lead Hub
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '1px 7px',
                background: '#eff6ff',
                color: '#1d4ed8',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: '700',
                border: '1px solid #bfdbfe'
              }}>
                🌐 crm.taaseegun.com
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '1px 6px',
                background: '#ecfdf5',
                color: '#059669',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: '600',
                border: '1px solid #a7f3d0'
              }}>
                <span className="live-dot"></span> Live
              </span>
            </div>
            {activeTab !== 'chat' && (
              <p className="header-brand-sub" style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '1px' }}>
                ระบบศูนย์กลางตอบแชทและบริหารจัดการลูกค้าโซเชียลมีเดียหลายเพจสำหรับทีมงาน
              </p>
            )}
          </div>
        </div>

        {/* Action Controls - Desktop View */}
        <div className="header-action-desktop">
          <button
            onClick={onOpenAddLeadModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '9px',
              fontWeight: '600',
              fontSize: '0.84rem',
              boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)'
            }}
          >
            <PlusCircle size={15} />
            + บันทึก Lead ลูกค้าใหม่
          </button>

          <button
            onClick={onExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ffffff',
              color: '#334155',
              padding: '8px 12px',
              borderRadius: '9px',
              fontWeight: '600',
              fontSize: '0.84rem',
              border: '1px solid #cbd5e1'
            }}
          >
            <Download size={14} />
            ส่งออก CSV
          </button>

          <button
            onClick={onExportBackup}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ffffff',
              color: '#475569',
              padding: '8px 11px',
              borderRadius: '9px',
              fontWeight: '600',
              fontSize: '0.84rem',
              border: '1px solid #e2e8f0'
            }}
            title="ดาวน์โหลดไฟล์สำรองข้อมูลทั้งหมดเป็น JSON"
          >
            💾 สำรอง JSON
          </button>

          <button
            onClick={onResetData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ffffff',
              color: '#64748b',
              padding: '8px 9px',
              borderRadius: '9px',
              fontWeight: '600',
              fontSize: '0.8rem',
              border: '1px solid #e2e8f0'
            }}
            title="รีเซ็ตกลับเป็นข้อมูลตัวอย่างเริ่มต้น"
          >
            🔄 รีเซ็ต
          </button>

          <button
            onClick={onOpenTeamModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '8px 12px',
              borderRadius: '9px',
              fontWeight: '700',
              fontSize: '0.84rem',
              border: '1px solid #bfdbfe',
              cursor: 'pointer'
            }}
            title="จัดการรายชื่อและรหัสผ่านทีมงานแอดมิน"
          >
            <Users size={15} />
            จัดการทีมงาน ({teamMembersCount})
          </button>

          {/* Current Logged in User Card & Logout */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '4px 10px 4px 6px',
              borderRadius: '10px'
            }}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
                  {currentUser.roleLabel || 'Admin'}
                </div>
              </div>

              <button
                onClick={onLogout}
                style={{
                  padding: '3px 7px',
                  borderRadius: '5px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  marginLeft: '4px'
                }}
                title="ออกจากระบบ"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>

        {/* Action Controls - Mobile View */}
        <div className="header-action-mobile">
          <button
            onClick={onOpenAddLeadModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.78rem',
              boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)'
            }}
          >
            <PlusCircle size={14} /> + Lead
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: isMobileMenuOpen ? '#0f172a' : '#f1f5f9',
              color: isMobileMenuOpen ? '#ffffff' : '#334155',
              padding: '6px 10px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.78rem',
              border: '1px solid #cbd5e1'
            }}
          >
            {isMobileMenuOpen ? <X size={15} /> : <SlidersHorizontal size={15} />}
            <span>จัดการ</span>
          </button>

          {currentUser && (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              title={currentUser.name}
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cbd5e1', cursor: 'pointer' }}
            />
          )}
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Menu for Management */}
      {isMobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #cbd5e1',
          padding: '12px',
          marginBottom: '8px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{currentUser.roleLabel || 'Admin'}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}
              >
                <LogOut size={13} /> ออกจากระบบ
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onExportCsv();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#334155'
              }}
            >
              <Download size={14} /> ส่งออก CSV
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onExportBackup();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#334155'
              }}
            >
              💾 สำรอง JSON
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTeamModal();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#1d4ed8'
              }}
            >
              <Users size={14} /> ทีมงาน ({teamMembersCount})
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onResetData();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#e11d48'
              }}
            >
              🔄 รีเซ็ตข้อมูล
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Tabs - Horizontally scrollable row on mobile */}
      <div className="header-nav-container">
        {/* Tab 1: Live Chat Center */}
        <button
          onClick={() => setActiveTab('chat')}
          className="header-nav-btn"
          style={{
            backgroundColor: activeTab === 'chat' ? '#1877f2' : 'transparent',
            color: activeTab === 'chat' ? '#ffffff' : '#1e293b',
            boxShadow: activeTab === 'chat' ? '0 3px 10px rgba(24, 119, 242, 0.25)' : 'none',
            border: activeTab === 'chat' ? 'none' : '1px solid #e2e8f0',
            fontWeight: activeTab === 'chat' ? '700' : '600'
          }}
        >
          <MessageSquare size={16} />
          <span>แชทสด & คอมเมนต์</span>
          <span style={{
            background: activeTab === 'chat' ? '#ffffff' : '#ef4444',
            color: activeTab === 'chat' ? '#1877f2' : '#ffffff',
            padding: '1px 6px',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: '800'
          }}>
            Live
          </span>
        </button>

        {/* Tab: Sales Pipeline (Kanban) */}
        <button
          onClick={() => setActiveTab('pipeline')}
          className="header-nav-btn"
          style={{
            backgroundColor: activeTab === 'pipeline' ? '#7c3aed' : 'transparent',
            color: activeTab === 'pipeline' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'pipeline' ? '0 3px 10px rgba(124, 58, 237, 0.25)' : 'none',
            border: activeTab === 'pipeline' ? 'none' : '1px solid #e2e8f0',
            fontWeight: activeTab === 'pipeline' ? '700' : '600'
          }}
        >
          <Kanban size={16} />
          <span>ไปป์ไลน์ (Kanban)</span>
          <span style={{
            background: activeTab === 'pipeline' ? '#ffffff' : '#ede9fe',
            color: activeTab === 'pipeline' ? '#7c3aed' : '#6d28d9',
            padding: '1px 6px',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: '800'
          }}>
            ขาย
          </span>
        </button>

        {/* Tab 2: CRM Leads Table */}
        <button
          onClick={() => setActiveTab('crm')}
          className="header-nav-btn"
          style={{
            backgroundColor: activeTab === 'crm' ? '#0f172a' : 'transparent',
            color: activeTab === 'crm' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'crm' ? '0 3px 8px rgba(15, 23, 42, 0.15)' : 'none',
            border: activeTab === 'crm' ? 'none' : '1px solid #e2e8f0',
            fontWeight: activeTab === 'crm' ? '700' : '500'
          }}
        >
          <Users size={16} />
          <span>ลูกค้า (CRM)</span>
          <span style={{
            background: activeTab === 'crm' ? '#3b82f6' : '#e2e8f0',
            color: activeTab === 'crm' ? '#ffffff' : '#475569',
            padding: '1px 6px',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: '700'
          }}>
            {totalLeadsCount}
          </span>
        </button>

        {/* Tab 3: Media Kit Analytics */}
        <button
          onClick={() => setActiveTab('analytics')}
          className="header-nav-btn"
          style={{
            backgroundColor: activeTab === 'analytics' ? '#0f172a' : 'transparent',
            color: activeTab === 'analytics' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'analytics' ? '0 3px 8px rgba(15, 23, 42, 0.15)' : 'none',
            border: activeTab === 'analytics' ? 'none' : '1px solid #e2e8f0',
            fontWeight: activeTab === 'analytics' ? '700' : '500'
          }}
        >
          <BarChart3 size={16} />
          <span>สถิติช่อง</span>
        </button>

        {/* Tab 4: API Setup */}
        <button
          onClick={() => setActiveTab('api-setup')}
          className="header-nav-btn"
          style={{
            backgroundColor: activeTab === 'api-setup' ? '#0f172a' : 'transparent',
            color: activeTab === 'api-setup' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'api-setup' ? '0 3px 8px rgba(15, 23, 42, 0.15)' : 'none',
            border: activeTab === 'api-setup' ? 'none' : '1px solid #e2e8f0',
            fontWeight: activeTab === 'api-setup' ? '700' : '500'
          }}
        >
          <Settings2 size={16} />
          <span>ต่อ API 4 เพจ</span>
        </button>
      </div>
    </header>
  );
}
