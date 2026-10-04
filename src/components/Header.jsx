import React from 'react';
import { 
  BarChart3, 
  Users, 
  Settings2, 
  PlusCircle, 
  Download, 
  ExternalLink, 
  Share2, 
  Sparkles,
  MessageSquare
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
  return (
    <header style={{
      marginBottom: activeTab === 'chat' ? '8px' : '16px',
      borderBottom: '1px solid var(--border-subtle)',
      paddingBottom: activeTab === 'chat' ? '8px' : '12px',
      flexShrink: 0
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: activeTab === 'chat' ? '8px' : '12px'
      }}>
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1877f2 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
                OmniSocial & Lead Hub
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 9px',
                background: '#eff6ff',
                color: '#1d4ed8',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '700',
                border: '1px solid #bfdbfe'
              }}>
                🌐 crm.taaseegun.com
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                background: '#ecfdf5',
                color: '#059669',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: '600',
                border: '1px solid #a7f3d0'
              }}>
                <span className="live-dot"></span> Live
              </span>
            </div>
            {activeTab !== 'chat' && (
              <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
                ระบบศูนย์กลางตอบแชทและบริหารจัดการลูกค้าโซเชียลมีเดียหลายเพจสำหรับทีมงาน
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenAddLeadModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(24, 119, 242, 0.25)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565d8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1877f2'}
          >
            <PlusCircle size={16} />
            + บันทึก Lead ลูกค้าใหม่
          </button>

          <button
            onClick={onExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#334155',
              padding: '9px 13px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.85rem',
              border: '1px solid #cbd5e1',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <Download size={15} />
            ส่งออก CSV
          </button>

          <button
            onClick={onExportBackup}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#475569',
              padding: '9px 12px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.85rem',
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
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#64748b',
              padding: '9px 10px',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.82rem',
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
              gap: '6px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '9px 13px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: '1px solid #bfdbfe',
              cursor: 'pointer'
            }}
            title="จัดการรายชื่อและรหัสผ่านทีมงานแอดมิน (crm.taaseegun.com)"
          >
            <Users size={16} />
            จัดการทีมงาน ({teamMembersCount})
          </button>

          {/* Current Logged in User Card & Logout */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '5px 12px 5px 6px',
              borderRadius: '12px'
            }}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {currentUser.roleLabel || 'Admin'}
                </div>
              </div>

              <button
                onClick={onLogout}
                style={{
                  marginLeft: '6px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  border: '1px solid #fecaca'
                }}
                title="ออกจากระบบ"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid transparent',
        flexWrap: 'wrap'
      }}>
        {/* Tab 1: Live Chat Center */}
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: activeTab === 'chat' ? '700' : '600',
            fontSize: '0.92rem',
            backgroundColor: activeTab === 'chat' ? '#1877f2' : 'transparent',
            color: activeTab === 'chat' ? '#ffffff' : '#1e293b',
            boxShadow: activeTab === 'chat' ? '0 4px 12px rgba(24, 119, 242, 0.25)' : 'none',
            border: activeTab === 'chat' ? 'none' : '1px solid #e2e8f0'
          }}
        >
          <MessageSquare size={18} />
          💬 ศูนย์ตอบแชท & คอมเมนต์ (Live Inbox)
          <span style={{
            background: activeTab === 'chat' ? '#ffffff' : '#ef4444',
            color: activeTab === 'chat' ? '#1877f2' : '#ffffff',
            padding: '2px 7px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: '800'
          }}>
            ตอบได้ในนี้
          </span>
        </button>

        {/* Tab 2: CRM Leads Table */}
        <button
          onClick={() => setActiveTab('crm')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: activeTab === 'crm' ? '700' : '500',
            fontSize: '0.92rem',
            backgroundColor: activeTab === 'crm' ? '#0f172a' : 'transparent',
            color: activeTab === 'crm' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'crm' ? '0 4px 10px rgba(15, 23, 42, 0.15)' : 'none'
          }}
        >
          <Users size={18} />
          ตารางรวบรวมลูกค้า (CRM Leads)
          <span style={{
            background: activeTab === 'crm' ? '#3b82f6' : '#e2e8f0',
            color: activeTab === 'crm' ? '#ffffff' : '#475569',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: '700'
          }}>
            {totalLeadsCount}
          </span>
        </button>

        {/* Tab 3: Media Kit Analytics */}
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: activeTab === 'analytics' ? '700' : '500',
            fontSize: '0.92rem',
            backgroundColor: activeTab === 'analytics' ? '#0f172a' : 'transparent',
            color: activeTab === 'analytics' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'analytics' ? '0 4px 10px rgba(15, 23, 42, 0.15)' : 'none'
          }}
        >
          <BarChart3 size={18} />
          สถิติช่อง (Media Kit Analytics)
        </button>

        {/* Tab 4: API Setup */}
        <button
          onClick={() => setActiveTab('api-setup')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: activeTab === 'api-setup' ? '700' : '500',
            fontSize: '0.92rem',
            backgroundColor: activeTab === 'api-setup' ? '#0f172a' : 'transparent',
            color: activeTab === 'api-setup' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'api-setup' ? '0 4px 10px rgba(15, 23, 42, 0.15)' : 'none'
          }}
        >
          <Settings2 size={18} />
          วิธีเชื่อมต่อ API ส่งข้อความ & หลายเพจ
        </button>
      </div>
    </header>
  );
}
