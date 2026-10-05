import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Settings2, 
  PlusCircle, 
  Sparkles,
  MessageSquare,
  SlidersHorizontal,
  LogOut,
  Kanban,
  ChevronDown,
  RotateCcw,
  FileSpreadsheet,
  Database,
  UserCheck,
  Cloud
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
  teamMembersCount = 3,
  cloudSyncState = { status: 'connected', activeAdmins: 3 },
  onRefreshCloudSync
}) {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const toolsDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target)) {
        setIsToolsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header style={{
      marginBottom: activeTab === 'chat' ? '8px' : '16px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '8px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      flexShrink: 0
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* 1. Left: Brand & Domain (Clean & Friendly) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1877f2 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)',
            flexShrink: 0
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
                OmniSocial
              </span>
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
                crm.taaseegun.com
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '1px 6px',
                background: '#ecfdf5',
                color: '#059669',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: '700',
                border: '1px solid #a7f3d0'
              }}>
                <span className="live-dot"></span> Live
              </span>

              {/* Multi-Admin Cloud Sync Pill */}
              <button
                type="button"
                onClick={onRefreshCloudSync}
                title={
                  cloudSyncState?.status === 'connected'
                    ? `☁️ ระบบซิงก์เรียลไทม์กับ Supabase Cloud เรียบร้อย (แอดมิน ${cloudSyncState.activeAdmins || 3} คนเห็นตรงกัน 100%) คลิกเพื่อรีเฟรช`
                    : cloudSyncState?.status === 'syncing'
                    ? '🔄 กำลังซิงก์ข้อมูลขึ้น Supabase Cloud...'
                    : '🟡 โหมดออฟไลน์ / บันทึกข้อมูลในเบราว์เซอร์อัตโนมัติ คลิกเพื่อลองเชื่อมต่อใหม่'
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  border: cloudSyncState?.status === 'connected' 
                    ? '1px solid #bbf7d0' 
                    : cloudSyncState?.status === 'syncing'
                    ? '1px solid #bfdbfe' 
                    : '1px solid #fde047',
                  backgroundColor: cloudSyncState?.status === 'connected' 
                    ? '#f0fdf4' 
                    : cloudSyncState?.status === 'syncing'
                    ? '#eff6ff' 
                    : '#fefce8',
                  color: cloudSyncState?.status === 'connected' 
                    ? '#15803d' 
                    : cloudSyncState?.status === 'syncing'
                    ? '#1d4ed8' 
                    : '#854d0e',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Cloud size={11} className={cloudSyncState?.status === 'syncing' ? 'spin-icon' : ''} />
                <span>
                  {cloudSyncState?.status === 'connected' 
                    ? 'Cloud ซิงก์ 3 แอดมิน' 
                    : cloudSyncState?.status === 'syncing' 
                    ? 'กำลังซิงก์...' 
                    : 'ออฟไลน์'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Center: Friendly Navigation Pill Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          {/* Tab 1: Live Chat Center */}
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'chat' ? '#ffffff' : 'transparent',
              color: activeTab === 'chat' ? '#1877f2' : '#475569',
              fontWeight: activeTab === 'chat' ? '800' : '600',
              fontSize: '0.84rem',
              boxShadow: activeTab === 'chat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare size={15} />
            <span>แชทสด & คอมเมนต์</span>
            <span style={{
              background: activeTab === 'chat' ? '#1877f2' : '#ef4444',
              color: '#ffffff',
              padding: '1px 6px',
              borderRadius: '999px',
              fontSize: '0.66rem',
              fontWeight: '800'
            }}>
              Live
            </span>
          </button>

          {/* Tab 2: Sales Pipeline (Kanban) */}
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'pipeline' ? '#ffffff' : 'transparent',
              color: activeTab === 'pipeline' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'pipeline' ? '800' : '600',
              fontSize: '0.84rem',
              boxShadow: activeTab === 'pipeline' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Kanban size={15} />
            <span>ไปป์ไลน์ (Kanban)</span>
            <span style={{
              background: activeTab === 'pipeline' ? '#ede9fe' : '#e2e8f0',
              color: activeTab === 'pipeline' ? '#7c3aed' : '#64748b',
              padding: '1px 6px',
              borderRadius: '999px',
              fontSize: '0.66rem',
              fontWeight: '800'
            }}>
              ขาย
            </span>
          </button>

          {/* Tab 3: CRM Leads Table */}
          <button
            type="button"
            onClick={() => setActiveTab('crm')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 13px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'crm' ? '#ffffff' : 'transparent',
              color: activeTab === 'crm' ? '#0f172a' : '#475569',
              fontWeight: activeTab === 'crm' ? '800' : '600',
              fontSize: '0.84rem',
              boxShadow: activeTab === 'crm' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={15} />
            <span>ลูกค้า (CRM)</span>
            <span style={{
              background: activeTab === 'crm' ? '#e2e8f0' : '#e2e8f0',
              color: '#334155',
              padding: '1px 6px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: '700'
            }}>
              {totalLeadsCount}
            </span>
          </button>

          {/* Tab 4: Media Kit Analytics */}
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 13px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'analytics' ? '#ffffff' : 'transparent',
              color: activeTab === 'analytics' ? '#0f172a' : '#475569',
              fontWeight: activeTab === 'analytics' ? '800' : '600',
              fontSize: '0.84rem',
              boxShadow: activeTab === 'analytics' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={15} />
            <span>สถิติช่อง</span>
          </button>

          {/* Tab 5: API Setup */}
          <button
            type="button"
            onClick={() => setActiveTab('api-setup')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 13px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'api-setup' ? '#ffffff' : 'transparent',
              color: activeTab === 'api-setup' ? '#0f172a' : '#475569',
              fontWeight: activeTab === 'api-setup' ? '800' : '600',
              fontSize: '0.84rem',
              boxShadow: activeTab === 'api-setup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Settings2 size={15} />
            <span>ต่อ API 4 เพจ</span>
          </button>
        </div>

        {/* 3. Right: Quick Actions & Profile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Quick Add Lead Button */}
          <button
            type="button"
            onClick={onOpenAddLeadModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              padding: '7px 13px',
              borderRadius: '9px',
              fontWeight: '700',
              fontSize: '0.82rem',
              boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={15} />
            <span>+ บันทึก Lead</span>
          </button>

          {/* Tools Menu Dropdown (Clean, tucked away, friendly!) */}
          <div ref={toolsDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: isToolsDropdownOpen ? '#eff6ff' : '#f8fafc',
                color: isToolsDropdownOpen ? '#1877f2' : '#334155',
                border: '1px solid #cbd5e1',
                padding: '7px 11px',
                borderRadius: '9px',
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
              title="เครื่องมือส่งออก สำรอง และจัดการข้อมูล"
            >
              <SlidersHorizontal size={14} />
              <span>เครื่องมือ</span>
              <ChevronDown size={13} />
            </button>

            {isToolsDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '210px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                zIndex: 1000,
                overflow: 'hidden',
                padding: '6px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onOpenTeamModal();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Users size={15} color="#2563eb" />
                  <span>จัดการทีมงาน ({teamMembersCount} คน)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onExportCsv();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FileSpreadsheet size={15} color="#059669" />
                  <span>ส่งออกข้อมูลเป็น CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onExportBackup();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Database size={15} color="#7c3aed" />
                  <span>สำรองฐานข้อมูล (JSON)</span>
                </button>

                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    onResetData();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <RotateCcw size={14} color="#dc2626" />
                  <span>รีเซ็ตข้อมูลเริ่มต้น</span>
                </button>
              </div>
            )}
          </div>

          {/* Current User Profile Pill & Dropdown */}
          {currentUser && (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '4px 8px 4px 5px',
                  borderRadius: '999px',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>
                  {currentUser.name}
                </span>
                <ChevronDown size={13} color="#64748b" />
              </button>

              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '200px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  padding: '8px'
                }}>
                  <div style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {currentUser.roleLabel || 'Super Admin'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenTeamModal();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <UserCheck size={14} /> ข้อมูลทีมงาน
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '4px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={14} /> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
