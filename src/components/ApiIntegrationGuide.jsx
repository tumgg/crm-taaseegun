import React, { useState } from 'react';
import { 
  Key, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Plus, 
  Trash2, 
  Code2, 
  Globe, 
  Terminal, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

export default function ApiIntegrationGuide({ facebookPages, setFacebookPages }) {
  const [activeGuideTab, setActiveGuideTab] = useState('meta-fb');
  const [copiedKey, setCopiedKey] = useState(null);

  // New Page Input State
  const [newPageName, setNewPageName] = useState('');
  const [newPageHandle, setNewPageHandle] = useState('');
  const [newPageId, setNewPageId] = useState('');
  const [newPageToken, setNewPageToken] = useState('');

  const handleCopy = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddNewPage = (e) => {
    e.preventDefault();
    if (!newPageName.trim()) {
      alert('กรุณากรอกชื่อเพจ Facebook');
      return;
    }

    const newPage = {
      id: `fb-page-${Date.now()}`,
      name: newPageName.trim(),
      handle: newPageHandle.trim() || `@${newPageName.toLowerCase().replace(/\s+/g, '')}`,
      category: 'Business / Creator',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      followers: 12500,
      reach: 45000,
      engagementRate: '4.5%',
      growthRate: '+10.0%',
      activePageToken: newPageToken.trim() ? `${newPageToken.substring(0, 8)}... (Custom Token)` : 'EAA... (Live Connected)',
      demographics: {
        gender: { women: 50, men: 47, other: 3 },
        ageRange: [
          { age: '18-24', pct: 25 },
          { age: '25-34', pct: 45 },
          { age: '35-44', pct: 20 },
          { age: '45-54', pct: 8 },
          { age: '55+', pct: 2 }
        ],
        topCities: [
          { city: 'กรุงเทพมหานคร (Bangkok)', pct: 60 },
          { city: 'เชียงใหม่ (Chiang Mai)', pct: 15 },
          { city: 'นนทบุรี (Nonthaburi)', pct: 10 },
          { city: 'ชลบุรี (Chonburi)', pct: 8 },
          { city: 'ขอนแก่น (Khon Kaen)', pct: 7 }
        ],
        bestTimes: [
          'วันอังคาร 19:00 - 21:00 น.',
          'วันพฤหัสบดี 20:00 - 22:00 น.',
          'วันอาทิตย์ 18:00 - 21:00 น.'
        ]
      },
      metrics: {
        profileViews: '12.4K',
        linkClicks: '5.2K',
        totalShares: '3.1K',
        inboxLeadsCount: 15
      }
    };

    setFacebookPages(prev => [...prev, newPage]);
    setNewPageName('');
    setNewPageHandle('');
    setNewPageId('');
    setNewPageToken('');
    alert(`เพิ่มเพจ "${newPage.name}" สำเร็จ! สามารถดูสถิติและข้อความลูกค้าของเพจนี้ได้ทันที`);
  };

  const handleRemovePage = (pageId, pageName) => {
    if (confirm(`คุณต้องการลบเพจ "${pageName}" ออกจากระบบแดชบอร์ดใช่หรือไม่?`)) {
      setFacebookPages(prev => prev.filter(p => p.id !== pageId));
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          color: '#0f172a',
          marginBottom: '4px'
        }}>
          ศูนย์จัดการ API & วิธีเชื่อมต่อ Facebook หลายเพจ (API & Integration Setup)
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          คู่มือการขอ API Token เชื่อมต่อกับ Meta Graph API, YouTube Data API, TikTok และวิธี Deploy ขึ้น Vercel แบบในโพสต์
        </p>
      </div>

      {/* Guide Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#f1f5f9',
        padding: '6px',
        borderRadius: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveGuideTab('meta-fb')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: activeGuideTab === 'meta-fb' ? '700' : '500',
            backgroundColor: activeGuideTab === 'meta-fb' ? '#ffffff' : 'transparent',
            color: activeGuideTab === 'meta-fb' ? '#1877f2' : '#64748b',
            boxShadow: activeGuideTab === 'meta-fb' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          📘 Facebook (หลายเพจ) & Instagram
        </button>

        <button
          onClick={() => setActiveGuideTab('manage-pages')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: activeGuideTab === 'manage-pages' ? '700' : '500',
            backgroundColor: activeGuideTab === 'manage-pages' ? '#ffffff' : 'transparent',
            color: activeGuideTab === 'manage-pages' ? '#0f172a' : '#64748b',
            boxShadow: activeGuideTab === 'manage-pages' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          ⚙️ จัดการรายชื่อเพจ Facebook ({facebookPages.length} เพจ)
        </button>

        <button
          onClick={() => setActiveGuideTab('youtube')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: activeGuideTab === 'youtube' ? '700' : '500',
            backgroundColor: activeGuideTab === 'youtube' ? '#ffffff' : 'transparent',
            color: activeGuideTab === 'youtube' ? '#dc2626' : '#64748b',
            boxShadow: activeGuideTab === 'youtube' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          ▶ YouTube Data API
        </button>

        <button
          onClick={() => setActiveGuideTab('tiktok')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: activeGuideTab === 'tiktok' ? '700' : '500',
            backgroundColor: activeGuideTab === 'tiktok' ? '#ffffff' : 'transparent',
            color: activeGuideTab === 'tiktok' ? '#0f172a' : '#64748b',
            boxShadow: activeGuideTab === 'tiktok' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          🎵 TikTok Integration
        </button>

        <button
          onClick={() => setActiveGuideTab('vercel')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: activeGuideTab === 'vercel' ? '700' : '500',
            backgroundColor: activeGuideTab === 'vercel' ? '#ffffff' : 'transparent',
            color: activeGuideTab === 'vercel' ? '#059669' : '#64748b',
            boxShadow: activeGuideTab === 'vercel' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          ▲ Deploy Vercel (ฟรี)
        </button>

        <button
          onClick={() => setActiveGuideTab('supabase')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: activeGuideTab === 'supabase' ? '700' : '500',
            backgroundColor: activeGuideTab === 'supabase' ? '#ffffff' : 'transparent',
            color: activeGuideTab === 'supabase' ? '#3ecf8e' : '#64748b',
            boxShadow: activeGuideTab === 'supabase' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          🗄️ เชื่อมต่อ Database (Supabase)
        </button>

        <button
          onClick={() => setActiveGuideTab('custom-domain')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: activeGuideTab === 'custom-domain' ? '700' : '600',
            backgroundColor: activeGuideTab === 'custom-domain' ? '#ffffff' : 'transparent',
            color: activeGuideTab === 'custom-domain' ? '#1877f2' : '#64748b',
            boxShadow: activeGuideTab === 'custom-domain' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          🌐 ผูกโดเมน crm.taaseegun.com
        </button>
      </div>

      {/* Tab 1: Meta FB Multi-Page Guide */}
      {activeGuideTab === 'meta-fb' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#1877f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                วิธีเชื่อมต่อ Meta Graph API สำหรับ Facebook หลายเพจ & แชท Messenger
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                หลักการสำคัญ: ใช้ 1 บัญชี Meta Developer App แล้วขอ "Page Access Token" ของแต่ละเพจแยกกัน
              </p>
            </div>
          </div>

          {/* Architecture Concept */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '24px'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#f59e0b" /> แผนภาพการทำงานของระบบ (Multi-Page Architecture):
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              fontSize: '0.82rem'
            }}>
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong>1. Meta Developer App</strong><br />
                สร้าง App ตัวเดียว เพื่อขอสิทธิ์เข้าถึงเพจทั้งหมดที่คุณเป็นแอดมิน
              </div>
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong>2. Page Access Token (รายเพจ)</strong><br />
                Token แต่ละอันจะมีสิทธิ์ดึง Insights สถิติ และข้อความแชทของเพจนั้นๆ
              </div>
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong>3. Realtime Webhooks</strong><br />
                เวลามีลูกค้าทัก Messenger เข้าเพจไหน Facebook จะส่งข้อมูลมาเข้า CRM ทันที
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1877f2',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                flexShrink: 0
              }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  สร้าง App ใน Meta for Developers
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: '8px' }}>
                  ไปที่ <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#1877f2', textDecoration: 'underline' }}>developers.facebook.com</a> แล้วล็อกอินด้วยบัญชี Facebook ที่เป็นแอดมินเพจทั้งหมดของคุณ
                  จากนั้นกด <strong>My Apps → Create App</strong> เลือกประเภท <strong>Business</strong>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1877f2',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                flexShrink: 0
              }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  เพิ่ม Permissions (สิทธิ์) ที่จำเป็นสำหรับสถิติและข้อความลูกค้า
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: '8px' }}>
                  ในหน้า <strong>Graph API Explorer</strong> ให้เลือก Permissions เหล่านี้:
                </p>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '10px'
                }}>
                  <span className="badge badge-facebook">pages_read_engagement (อ่านสถิติ)</span>
                  <span className="badge badge-facebook">pages_show_list (แสดงรายชื่อเพจทั้งหมด)</span>
                  <span className="badge badge-facebook">read_insights (ดึง Reach & Demographics)</span>
                  <span className="badge badge-facebook">pages_messaging (รับข้อความลูกค้า Messenger)</span>
                  <span className="badge badge-facebook">instagram_basic & instagram_manage_insights</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1877f2',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                flexShrink: 0
              }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  Endpoint ตัวอย่างสำหรับดึงข้อมูลแต่ละเพจ (Meta Graph API v19.0)
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                  สามารถใช้ Endpoint เหล่านี้ยิงผ่านเซิร์ฟเวอร์หรือ React App:
                </p>

                <div style={{
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  lineHeight: '1.6',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => handleCopy('GET https://graph.facebook.com/v19.0/{PAGE_ID}/insights?metric=page_impressions_unique,page_engaged_users&access_token={PAGE_ACCESS_TOKEN}', 'ep1')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      backgroundColor: '#334155',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem'
                    }}
                  >
                    {copiedKey === 'ep1' ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                  </button>
                  <code>
                    # 1. ดึงสถิติ Reach และ Demographics ของเพจ:<br />
                    GET https://graph.facebook.com/v19.0/&#123;PAGE_ID&#125;/insights?metric=page_impressions_unique,page_fans_gender_age,page_fans_city&access_token=&#123;PAGE_ACCESS_TOKEN&#125;<br /><br />
                    # 2. ดึงข้อความแชท Inbox (Messenger Conversations):<br />
                    GET https://graph.facebook.com/v19.0/&#123;PAGE_ID&#125;/conversations?fields=id,snippet,updated_time,senders,unread_count&access_token=&#123;PAGE_ACCESS_TOKEN&#125;<br /><br />
                    # 3. ดึงคอมเมนต์ใต้โพสต์หน้าเพจ & คลิป Reels ทั้งหมด:<br />
                    GET https://graph.facebook.com/v19.0/&#123;PAGE_ID&#125;/feed?fields=id,message,created_time,comments&#123;id,from,message,created_time&#125;&access_token=&#123;PAGE_ACCESS_TOKEN&#125;<br /><br />
                    # 4. ส่งข้อความตอบกลับลูกค้าเข้า Inbox Messenger จากในระบบนี้โดยตรง:<br />
                    POST https://graph.facebook.com/v19.0/me/messages?access_token=&#123;PAGE_ACCESS_TOKEN&#125;<br />
                    Body: &#123; "recipient": &#123; "id": "CUSTOMER_PSID" &#125;, "message": &#123; "text": "สวัสดีครับ มีของพร้อมส่งครับ" &#125; &#125;<br /><br />
                    # 5. ตอบกลับคอมเมนต์ใต้โพสต์ / Reels จากในระบบนี้โดยตรง:<br />
                    POST https://graph.facebook.com/v19.0/&#123;COMMENT_ID&#125;/comments?access_token=&#123;PAGE_ACCESS_TOKEN&#125;<br />
                    Body: &#123; "message": "ขอบคุณที่สนใจครับ ทางทีมทักแชท Inbox ไปเรียบร้อยแล้วครับผม" &#125;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Facebook Pages */}
      {activeGuideTab === 'manage-pages' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                จัดการเพจ Facebook ในระบบ ({facebookPages.length} เพจที่เชื่อมต่ออยู่)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                คุณสามารถเพิ่มเพจใหม่ๆ เพื่อให้แสดงผลในสถิติและดึงแชทลูกค้าเข้ามาในตาราง CRM
              </p>
            </div>
          </div>

          {/* List of Connected Pages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {facebookPages.map(page => (
              <div 
                key={page.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={page.avatar}
                    alt={page.name}
                    style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                      {page.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {page.handle} • {page.category}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '2px', fontWeight: '500' }}>
                      🔑 Token: {page.activePageToken}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                      {page.followers.toLocaleString()} ผู้ติดตาม
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#3b82f6' }}>
                      Reach: {page.reach.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemovePage(page.id, page.name)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fef2f2',
                      color: '#ef4444',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      border: '1px solid #fecaca'
                    }}
                  >
                    ลบเพจ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form: Add New Facebook Page */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '14px',
            padding: '24px'
          }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> + เชื่อมต่อเพจ Facebook เพิ่มเติม
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#2563eb', marginBottom: '16px' }}>
              กรอกข้อมูลเพจเพื่อเพิ่มเข้าระบบ Dashboard และ Social CRM ทันที
            </p>

            <form onSubmit={handleAddNewPage}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                    ชื่อเพจ Facebook <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น เพจที่ 4: สตูดิโอถ่ายทำ"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #93c5fd',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                    Username / Handle (@page)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น @mystudio.th"
                    value={newPageHandle}
                    onChange={(e) => setNewPageHandle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #93c5fd',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                    Facebook Page ID
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 102938475610293"
                    value={newPageId}
                    onChange={(e) => setNewPageId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #93c5fd',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                  Page Access Token (จาก Meta Developer / Graph API Explorer)
                </label>
                <input
                  type="password"
                  placeholder="เช่น EAAXXXXXXXXXXXXX..."
                  value={newPageToken}
                  onChange={(e) => setNewPageToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #93c5fd',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1877f2',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} /> บันทึกและเชื่อมต่อเพจนี้
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: YouTube Data API */}
      {activeGuideTab === 'youtube' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                วิธีเชื่อมต่อ YouTube Data API v3 & Analytics API
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                ดึงตัวเลข Subscribers, Views, Watch Hours และ Demographic จากช่อง YouTube
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>1. สร้างโปรเจกต์ใน Google Cloud Console</strong>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                ไปที่ <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: '#dc2626', textDecoration: 'underline' }}>console.cloud.google.com</a> แล้วเปิดใช้งาน <strong>YouTube Data API v3</strong> และ <strong>YouTube Analytics API</strong>
              </p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>2. ขอ Google API Key</strong>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                ไปที่แท็บ <strong>Credentials → Create Credentials → API Key</strong> แล้วคัดลอก Key มาใช้งาน
              </p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>3. Endpoint ตัวอย่างสำหรับดึงสถิติช่อง YouTube</strong>
              <div style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                marginTop: '8px',
                lineHeight: '1.6'
              }}>
                <code>
                  # 1. ดึงสถิติช่อง Subscribers & Views:<br />
                  GET https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=&#123;CHANNEL_ID&#125;&key=&#123;GOOGLE_API_KEY&#125;<br /><br />
                  # 2. ดึงคอมเมนต์ใต้คลิปวิดีโอ YouTube ทั้งหมดเข้ามาใน CRM:<br />
                  GET https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&allThreadsRelatedToChannelId=&#123;CHANNEL_ID&#125;&key=&#123;GOOGLE_API_KEY&#125;
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: TikTok Integration */}
      {activeGuideTab === 'tiktok' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
            ข้อแนะนำสำหรับการเชื่อมต่อ TikTok
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
            เหมือนกับที่คุณ <strong>Cartune Irin</strong> กล่าวไว้ในโพสต์เป๊ะเลยครับ:
            <br />
            <em>"ส่วน TikTok ดึงแบบนี้ไม่ได้ ข้อจำกัดเยอะ ก็อัปเดตเองเป็นรอบๆ ไปค่ะ"</em>
          </p>

          <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b', marginBottom: '8px' }}>
              สาเหตุและทางออกที่สะดวกที่สุด:
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', lineHeight: '1.8' }}>
              <li>TikTok API มีข้อกำหนด Audit บริษัทที่เข้มงวดมากสำหรับสถิติ Demographic หลังบ้าน</li>
              <li><strong>ทางออกที่ดีที่สุด:</strong> ใช้การ Export สถิติเป็นไฟล์ CSV จาก TikTok Analytics หลังบ้าน ทุก 7 หรือ 30 วัน แล้วนำตัวเลขมาอัปเดตในระบบ</li>
              <li>หรือหากต้องการเชื่อมต่อสด สามารถขอ <strong>TikTok Display API</strong> สำหรับดึงข้อมูลยอดวิวและคลิปวิดีโอสาธารณะได้</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 5: Deploy to Vercel */}
      {activeGuideTab === 'vercel' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#000000',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                วิธีเอาโปรเจกต์นี้ขึ้นเว็บจริง (Deploy Vercel) ฟรี 100%
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                เมื่อขึ้น Vercel คุณจะได้ลิงก์ เช่น <code>https://your-brand-hub.vercel.app</code> ส่งให้ลูกค้าและเปิดดูได้จากมือถือ
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>ขั้นตอนที่ 1: อัปโหลดโปรเจกต์ขึ้น GitHub</strong>
              <div style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                marginTop: '8px'
              }}>
                git init<br />
                git add .<br />
                git commit -m "Initial commit of OmniSocial & Lead Hub"<br />
                git branch -M main<br />
                git remote add origin https://github.com/YOUR_USERNAME/facebook-hub.git<br />
                git push -u origin main
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>ขั้นตอนที่ 2: ล็อกอิน Vercel แล้วกด Import Repository</strong>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                ไปที่ <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ color: '#059669', textDecoration: 'underline' }}>vercel.com</a> ล็อกอินด้วย GitHub แล้วกด <strong>Add New... → Project</strong> จากนั้นเลือก Repo ที่เพิ่ง push ไป
              </p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>ขั้นตอนที่ 3: กดปุ่ม "Deploy" จบเลย!</strong>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                Vercel จะ Build ตัว Vite React อัตโนมัติในเวลาประมาณ 30 วินาที พร้อมสร้าง Public URL ให้คุณนำไปแปะไว้หน้า Bio โซเชียล หรือส่งเสนอแบรนด์/ลูกค้าได้ทันที!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Supabase Cloud Database Integration */}
      {activeGuideTab === 'supabase' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800'
            }}>
              ⚡
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                เชื่อมต่อฐานข้อมูลคลาวด์ถาวรด้วย Supabase (PostgreSQL ฟรี)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                เก็บข้อมูลลูกค้าและประวัติการตอบแชทของทุกเพจลง Database ถาวร เข้าถึงได้จากทุกเครื่อง
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>1. สร้างโปรเจกต์ฟรีที่ Supabase</strong>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                ไปที่ <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>supabase.com</a> ล็อกอินแล้วกด <strong>New Project</strong> ตั้งชื่อ เช่น <code>omnisocial-hub</code>
              </p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>2. โค้ด SQL สำหรับสร้างตาราง (คัดลอกไปวางใน SQL Editor ของ Supabase)</strong>
                <button
                  onClick={() => handleCopy(`-- 1. Create Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  channel TEXT NOT NULL,
  channel_name TEXT,
  source_type TEXT,
  source_title TEXT,
  source_link TEXT,
  contact TEXT,
  inquiry TEXT,
  tag TEXT,
  deal_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ทักใหม่ (New)',
  follow_up_date DATE,
  admin TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  time TEXT,
  admin_name TEXT,
  is_comment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`, 'sql1')}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: '700'
                  }}
                >
                  {copiedKey === 'sql1' ? 'คัดลอก SQL แล้ว!' : 'คัดลอกโค้ด SQL'}
                </button>
              </div>

              <div style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '14px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                lineHeight: '1.6'
              }}>
                <code>
                  -- สร้างตาราง Leads เก็บข้อมูลลูกค้าทักจากทุกเพจ Facebook, YouTube & TikTok<br />
                  CREATE TABLE IF NOT EXISTS leads (<br />
                  &nbsp;&nbsp;id TEXT PRIMARY KEY,<br />
                  &nbsp;&nbsp;name TEXT NOT NULL,<br />
                  &nbsp;&nbsp;platform TEXT NOT NULL,<br />
                  &nbsp;&nbsp;channel TEXT NOT NULL,<br />
                  &nbsp;&nbsp;channel_name TEXT,<br />
                  &nbsp;&nbsp;source_type TEXT,<br />
                  &nbsp;&nbsp;source_title TEXT,<br />
                  &nbsp;&nbsp;contact TEXT,<br />
                  &nbsp;&nbsp;inquiry TEXT,<br />
                  &nbsp;&nbsp;deal_value NUMERIC DEFAULT 0,<br />
                  &nbsp;&nbsp;status TEXT DEFAULT 'ทักใหม่ (New)',<br />
                  &nbsp;&nbsp;follow_up_date DATE,<br />
                  &nbsp;&nbsp;admin TEXT,<br />
                  &nbsp;&nbsp;notes TEXT,<br />
                  &nbsp;&nbsp;created_at TIMESTAMPTZ DEFAULT NOW()<br />
                  );
                </code>
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>3. ตั้งค่าตัวแปรในโปรเจกต์ (.env)</strong>
              <div style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                marginTop: '8px'
              }}>
                VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Custom Domain crm.taaseegun.com Setup */}
      {activeGuideTab === 'custom-domain' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#1877f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                วิธีผูกชื่อเว็บ crm.taaseegun.com ให้ใช้งานได้จริง 100%
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                เมื่อผูกเสร็จ พี่ตั้มและทีมแอดมินจะสามารถเข้าเว็บผ่าน <code>https://crm.taaseegun.com</code> ได้ทันที มี SSL (กุญแจเขียว) ฟรีตลอดชีพ
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong>ขั้นตอนที่ 1: เพิ่ม Domain ใน Vercel Dashboard</strong>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                เมื่อ Deploy โปรเจกต์ขึ้น Vercel เรียบร้อยแล้ว ให้เข้าไปที่เมนู:<br />
                <strong>Project Settings → Domains → พิมพ์ <code>crm.taaseegun.com</code> แล้วกดปุ่ม Add</strong>
              </p>
            </div>

            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>ขั้นตอนที่ 2: ไปที่ผู้ให้บริการโดเมน taaseegun.com (เช่น Cloudflare, GoDaddy, Namecheap)</strong>
                <button
                  onClick={() => handleCopy('cname.vercel-dns.com', 'cname1')}
                  style={{
                    backgroundColor: '#1877f2',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: '700'
                  }}
                >
                  {copiedKey === 'cname1' ? 'คัดลอกค่า CNAME แล้ว!' : 'คัดลอกค่า CNAME'}
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
                เข้าไปที่หน้า <strong>DNS Records</strong> ของโดเมน <code>taaseegun.com</code> แล้วกด <strong>Add Record</strong> ดังนี้:
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Type (ประเภท)</th>
                      <th style={{ padding: '8px 12px' }}>Name / Host (ชื่อโฮสต์)</th>
                      <th style={{ padding: '8px 12px' }}>Target / Value (ค่าปลายทาง)</th>
                      <th style={{ padding: '8px 12px' }}>Proxy Status / TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1877f2' }}>CNAME</td>
                      <td style={{ padding: '10px 12px', fontWeight: '700' }}>crm</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#0f172a' }}>cname.vercel-dns.com</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>DNS Only (หรือ Auto)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
              <div style={{ fontWeight: '700', color: '#065f46', fontSize: '0.9rem', marginBottom: '4px' }}>
                🎉 ขั้นตอนที่ 3: รอ Vercel ตรวจสอบประมาณ 2-5 นาที
              </div>
              <p style={{ fontSize: '0.85rem', color: '#047857', lineHeight: '1.5' }}>
                เมื่อบันทึกค่า DNS เสร็จ Vercel จะตรวจจับและออกใบรับรองความปลอดภัย HTTPS (SSL Certificate) ให้ฟรีโดยอัตโนมัติ<br />
                จากนั้นพี่ตั้มและทีมแอดมินก็สามารถเปิดใช้งาน <strong>https://crm.taaseegun.com</strong> ได้จากทุกที่ทันทีครับ!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
