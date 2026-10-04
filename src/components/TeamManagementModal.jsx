import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Key, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Sparkles,
  Lock
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
];

export default function TeamManagementModal({
  isOpen,
  onClose,
  teamMembers,
  onSaveTeamMembers,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Form state for new team member
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sales');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[3]);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const togglePassword = (id) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyCredentials = (member) => {
    const text = `🌐 ข้อมูลเข้าสู่ระบบ CRM (${window.location.hostname || 'crm.taaseegun.com'})\nURL: https://crm.taaseegun.com\nUsername: ${member.username}\nPassword: ${member.password}\nตำแหน่ง: ${member.roleLabel}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !username.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกชื่อ, Username และ Password ให้ครบถ้วน');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const exists = teamMembers.some(m => m.username.toLowerCase() === cleanUsername);
    if (exists) {
      setErrorMessage(`Username "${cleanUsername}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
      return;
    }

    let roleLabel = '👤 ทีมขาย (Sales Admin)';
    if (role === 'owner') roleLabel = '👑 เจ้าของระบบ (Super Admin)';
    else if (role === 'support') roleLabel = '👤 ฝ่ายบริการลูกค้า (Support)';
    else if (role === 'content') roleLabel = '📢 ฝ่ายคอนเทนต์ (Content Admin)';

    const newMember = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      email: email.trim() || `${cleanUsername}@taaseegun.com`,
      password: password.trim(),
      role: role,
      roleLabel: roleLabel,
      avatar: selectedAvatar
    };

    const updated = [...teamMembers, newMember];
    onSaveTeamMembers(updated);

    // Reset form
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('sales');
    setActiveTab('list');
  };

  const handleDeleteMember = (memberId, memberName) => {
    if (memberId === 'user-tum') {
      alert('ไม่สามารถลบบัญชีหลักของพี่ตั้ม (Owner) ได้ครับ');
      return;
    }

    if (confirm(`คุณต้องการลบสิทธิ์บัญชีของ "${memberName}" ออกจากระบบใช่หรือไม่?`)) {
      const updated = teamMembers.filter(m => m.id !== memberId);
      onSaveTeamMembers(updated);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div 
        className="animate-fade-in"
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#1877f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                จัดการทีมงาน & สิทธิ์เข้าใช้งาน (crm.taaseegun.com)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                กำหนดสิทธิ์และออกรหัสผ่านให้ทีมงานแอดมินสำหรับเข้าสู่ระบบ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: '#64748b',
              backgroundColor: '#f1f5f9',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px 0 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff'
        }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '8px 16px',
              borderBottom: activeTab === 'list' ? '2px solid #1877f2' : '2px solid transparent',
              color: activeTab === 'list' ? '#1877f2' : '#64748b',
              fontWeight: activeTab === 'list' ? '700' : '600',
              fontSize: '0.88rem',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={16} />
            รายชื่อทีมงาน ({teamMembers.length})
          </button>

          <button
            onClick={() => setActiveTab('add')}
            style={{
              padding: '8px 16px',
              borderBottom: activeTab === 'add' ? '2px solid #1877f2' : '2px solid transparent',
              color: activeTab === 'add' ? '#1877f2' : '#64748b',
              fontWeight: activeTab === 'add' ? '700' : '600',
              fontSize: '0.88rem',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <UserPlus size={16} />
            + เพิ่มทีมงานใหม่
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: member.id === 'user-tum' ? '#f0fdf4' : '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={member.avatar || AVATAR_OPTIONS[0]}
                      alt={member.name}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #e2e8f0'
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
                          {member.name}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          backgroundColor: member.role === 'owner' ? '#dcfce7' : '#eff6ff',
                          color: member.role === 'owner' ? '#15803d' : '#1d4ed8'
                        }}>
                          {member.roleLabel || member.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', display: 'flex', gap: '12px' }}>
                        <span>ID/Username: <strong>{member.username}</strong></span>
                        <span>อีเมล: {member.email}</span>
                      </div>
                      {/* Password line */}
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={13} color="#94a3b8" />
                        <span>รหัสผ่าน: </span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                          {showPasswordMap[member.id] ? member.password : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePassword(member.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                          title={showPasswordMap[member.id] ? 'ซ่อนรหัส' : 'ดูรหัสผ่าน'}
                        >
                          {showPasswordMap[member.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleCopyCredentials(member)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        backgroundColor: copiedId === member.id ? '#ecfdf5' : '#f1f5f9',
                        color: copiedId === member.id ? '#059669' : '#334155',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer'
                      }}
                      title="คัดลอกข้อมูลล็อกอินส่งให้ทีมงาน"
                    >
                      {copiedId === member.id ? (
                        <>
                          <Check size={14} /> คัดลอกแล้ว!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> คัดลอกส่งทีม
                        </>
                      )}
                    </button>

                    {member.id !== 'user-tum' && (
                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          color: '#dc2626',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          cursor: 'pointer'
                        }}
                        title="ลบสมาชิกทีมงาน"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: '12px',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                fontSize: '0.82rem',
                color: '#1e40af',
                lineHeight: '1.5'
              }}>
                💡 <strong>เคล็ดลับสำหรับพี่ตั้ม:</strong> เมื่อเพิ่มแอดมินใหม่แล้ว สามารถกดปุ่ม <strong>"คัดลอกส่งทีม"</strong> เพื่อนำข้อความ Username และ Password ไปส่งให้ทีมงานใน LINE หรือแชทได้ทันทีครับ!
              </div>
            </div>
          ) : (
            /* Add Member Form */
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {errorMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  fontSize: '0.84rem'
                }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  ชื่อ-นามสกุล / ชื่อเล่นทีมงาน *
                </label>
                <input
                  type="text"
                  placeholder="เช่น แอดมินเมย์, ทีมขายหนึ่ง"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Username (สำหรับล็อกอิน) *
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น may, sale01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    รหัสผ่าน (Password) *
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น pass1234, admin2026"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    ตำแหน่ง / สิทธิ์การใช้งาน *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="sales">👤 ทีมขาย (Sales Admin) — ดูแลยอดและตอบแชท</option>
                    <option value="support">👤 ฝ่ายบริการลูกค้า (Support) — ดูแลคอมเมนต์และคำถาม</option>
                    <option value="content">📢 ทีมคอนเทนต์ (Content Admin) — ดูแลโพสต์และคลิป</option>
                    <option value="owner">👑 ผู้ดูแลระบบ (Super Admin) — สิทธิ์เต็มทุกส่วน</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    อีเมล (ไม่บังคับ)
                  </label>
                  <input
                    type="email"
                    placeholder="เช่น may@taaseegun.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {/* Avatar selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                  เลือกรูปโปรไฟล์ประจำตัว
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`Avatar option ${idx + 1}`}
                      onClick={() => setSelectedAvatar(imgUrl)}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: selectedAvatar === imgUrl ? '3px solid #1877f2' : '2px solid transparent',
                        transform: selectedAvatar === imgUrl ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.15s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    backgroundColor: '#1877f2',
                    color: '#ffffff',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)'
                  }}
                >
                  ✓ บันทึกสร้างบัญชีทีมงาน
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
