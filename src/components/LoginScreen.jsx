import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Eye, 
  EyeOff,
  UserCheck
} from 'lucide-react';

export const teamAccounts = [
  {
    id: 'user-tum',
    name: 'พี่ตั้ม (Owner / Super Admin)',
    email: 'tum@taaseegun.com',
    username: 'tum',
    password: 'password123',
    role: 'owner',
    roleLabel: '👑 เจ้าของระบบ (Super Admin)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-non',
    name: 'แอดมินนนท์ (Lead Sales)',
    email: 'non@taaseegun.com',
    username: 'non',
    password: 'password123',
    role: 'sales',
    roleLabel: '👤 ทีมขาย (Sales Admin)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-praew',
    name: 'แอดมินแพรว (Customer Support)',
    email: 'praew@taaseegun.com',
    username: 'praew',
    password: 'password123',
    role: 'support',
    roleLabel: '👤 ฝ่ายบริการลูกค้า (Support)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  }
];

export default function LoginScreen({ onLoginSuccess, teamMembers = teamAccounts }) {
  const [identifier, setIdentifier] = useState('tum');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const trimmedId = identifier.trim().toLowerCase();
      const account = teamMembers.find(
        acc => (acc.username.toLowerCase() === trimmedId || (acc.email && acc.email.toLowerCase() === trimmedId)) && acc.password === password
      );

      if (account) {
        onLoginSuccess(account);
      } else {
        setErrorMessage('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ลองคลิกเลือกบัญชีตัวอย่างด้านล่าง)');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickSelect = (acc) => {
    setIdentifier(acc.username);
    setPassword(acc.password);
    setErrorMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090d16',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #090d16 75%)',
      padding: '24px 16px',
      position: 'relative',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Background Glows */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '300px',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Main Login Card */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1877f2 0%, #7c3aed 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 16px rgba(24, 119, 242, 0.35)',
            marginBottom: '14px'
          }}>
            <Sparkles size={28} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', color: '#1e40af', fontWeight: '700', marginBottom: '8px' }}>
            <Globe size={13} /> crm.taaseegun.com
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            OmniSocial & Lead Hub
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            ระบบตอบแชทและบริหารลูกค้าสำหรับทีมงาน taaseegun
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: '600',
            marginBottom: '18px',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Username / Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ชื่อผู้ใช้ หรือ อีเมล (ID / Email)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 14px',
              backgroundColor: '#f8fafc',
              transition: 'var(--transition)'
            }}>
              <Mail size={18} color="#94a3b8" style={{ marginRight: '10px' }} />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="เช่น tum หรือ tum@taaseegun.com"
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.92rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              รหัสผ่าน (Password)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 14px',
              backgroundColor: '#f8fafc'
            }}>
              <Lock size={18} color="#94a3b8" style={{ marginRight: '10px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.92rem',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: '#94a3b8', padding: '2px' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.96rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(24, 119, 242, 0.4)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '24px'
            }}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบทำงาน (Log In)'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Quick Demo Switcher for พี่ตั้ม & Team */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', marginBottom: '10px', textAlign: 'center' }}>
            ⚡ เลือกบัญชีตัวอย่างเพื่อทดสอบเข้าสู่ระบบด่วน:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {teamMembers.map(acc => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleQuickSelect(acc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  backgroundColor: identifier === acc.username ? '#eff6ff' : '#f8fafc',
                  border: identifier === acc.username ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                  fontSize: '0.82rem',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>User: {acc.username}</div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  backgroundColor: acc.role === 'owner' ? '#fef3c7' : '#f1f5f9',
                  color: acc.role === 'owner' ? '#92400e' : '#475569',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {acc.roleLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
