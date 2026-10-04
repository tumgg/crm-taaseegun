import React, { useState } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Eye, 
  Share2, 
  Clock, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  Calendar,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  initialFacebookPages, 
  youtubeAnalytics, 
  tiktokAnalytics, 
  instagramAnalytics 
} from '../data/mockData';

export default function MediaKitAnalytics({ facebookPages, onSelectPageForCrm }) {
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [selectedFbPageId, setSelectedFbPageId] = useState('all');
  const [ageSegment, setAgeSegment] = useState('all'); // 'all', 'men', 'women'
  const [dateRange, setDateRange] = useState('30');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('วันนี้, 08:30 น.');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed('อัปเดตล่าสุด: เมื่อสักครู่');
    }, 600);
  };

  // Aggregated Facebook data if 'all' is selected
  const aggregateFbData = () => {
    const totalFollowers = facebookPages.reduce((acc, p) => acc + p.followers, 0);
    const totalReach = facebookPages.reduce((acc, p) => acc + p.reach, 0);
    return {
      name: `รวมทุกลุ่มเพจ Facebook (${facebookPages.length} เพจ)`,
      handle: '@multipage.network',
      category: 'Unified Multi-Page Network',
      followers: totalFollowers,
      reach: totalReach,
      engagementRate: '5.2%',
      growthRate: '+16.8%',
      demographics: {
        gender: { women: 41, men: 55, other: 4 },
        ageRange: [
          { age: '18-24', pct: 22 },
          { age: '25-34', pct: 48 },
          { age: '35-44', pct: 20 },
          { age: '45-54', pct: 7 },
          { age: '55+', pct: 3 }
        ],
        topCities: [
          { city: 'กรุงเทพมหานคร (Bangkok)', pct: 62 },
          { city: 'เชียงใหม่ (Chiang Mai)', pct: 11 },
          { city: 'ชลบุรี (Chonburi)', pct: 10 },
          { city: 'นนทบุรี (Nonthaburi)', pct: 9 },
          { city: 'ขอนแก่น (Khon Kaen)', pct: 8 }
        ],
        bestTimes: [
          'วันอังคาร 19:00 - 22:00 น.',
          'วันพฤหัสบดี 20:00 - 23:00 น.',
          'วันอาทิตย์ 18:00 - 21:00 น.'
        ]
      },
      metrics: {
        profileViews: '72.3K',
        linkClicks: '52.0K',
        totalShares: '26.7K',
        inboxLeadsCount: 135
      }
    };
  };

  // Get active data based on platform and page
  let currentData;
  if (selectedPlatform === 'facebook') {
    if (selectedFbPageId === 'all') {
      currentData = aggregateFbData();
    } else {
      currentData = facebookPages.find(p => p.id === selectedFbPageId) || facebookPages[0];
    }
  } else if (selectedPlatform === 'youtube') {
    currentData = youtubeAnalytics;
  } else if (selectedPlatform === 'tiktok') {
    currentData = tiktokAnalytics;
  } else {
    currentData = instagramAnalytics;
  }

  // Adjust age range according to selected segment
  const getDisplayAgeRange = () => {
    const base = currentData.demographics?.ageRange || [];
    if (ageSegment === 'women') {
      return base.map(item => ({ ...item, pct: Math.round(item.pct * 1.1) }));
    }
    if (ageSegment === 'men') {
      return base.map(item => ({ ...item, pct: Math.round(item.pct * 0.95) }));
    }
    return base;
  };

  return (
    <div className="animate-fade-in">
      {/* Title & Realtime indicator matching reference image */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '800',
          fontFamily: 'serif',
          letterSpacing: '-0.01em',
          color: '#1e293b',
          marginBottom: '6px'
        }}>
          Platform Analytics
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#16a34a', fontWeight: '500' }}>
          <span className="live-dot"></span>
          <span>ข้อมูลแบบ Realtime เชื่อมต่อโดยตรงกับ API ของแต่ละแพลตฟอร์ม</span>
        </div>
      </div>

      {/* Main Platform Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '4px',
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        {/* Instagram Tab */}
        <button
          onClick={() => setSelectedPlatform('instagram')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.92rem',
            fontWeight: selectedPlatform === 'instagram' ? '700' : '500',
            color: selectedPlatform === 'instagram' ? '#c026d3' : '#64748b',
            borderBottom: selectedPlatform === 'instagram' ? '3px solid #c026d3' : '3px solid transparent',
            marginBottom: '-6px',
            transition: 'var(--transition)'
          }}
        >
          <span>📷</span> Instagram
        </button>

        {/* YouTube Tab */}
        <button
          onClick={() => setSelectedPlatform('youtube')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.92rem',
            fontWeight: selectedPlatform === 'youtube' ? '700' : '500',
            color: selectedPlatform === 'youtube' ? '#dc2626' : '#64748b',
            borderBottom: selectedPlatform === 'youtube' ? '3px solid #dc2626' : '3px solid transparent',
            marginBottom: '-6px',
            transition: 'var(--transition)'
          }}
        >
          <span style={{ color: '#dc2626' }}>▶</span> YouTube
        </button>

        {/* Facebook Tab */}
        <button
          onClick={() => setSelectedPlatform('facebook')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.92rem',
            fontWeight: selectedPlatform === 'facebook' ? '700' : '500',
            color: selectedPlatform === 'facebook' ? '#1877f2' : '#64748b',
            borderBottom: selectedPlatform === 'facebook' ? '3px solid #1877f2' : '3px solid transparent',
            marginBottom: '-6px',
            transition: 'var(--transition)'
          }}
        >
          <span style={{ color: '#1877f2' }}>📘</span> Facebook ({facebookPages.length} เพจ)
        </button>

        {/* TikTok Tab */}
        <button
          onClick={() => setSelectedPlatform('tiktok')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.92rem',
            fontWeight: selectedPlatform === 'tiktok' ? '700' : '500',
            color: selectedPlatform === 'tiktok' ? '#0f172a' : '#64748b',
            borderBottom: selectedPlatform === 'tiktok' ? '3px solid #0f172a' : '3px solid transparent',
            marginBottom: '-6px',
            transition: 'var(--transition)'
          }}
        >
          <span>🎵</span> TikTok
        </button>
      </div>

      {/* Facebook Multi-Page Selector Banner (SPECIAL FOR FACEBOOK) */}
      {selectedPlatform === 'facebook' && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              f
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e3a8a' }}>
                เลือกดูสถิติ Facebook รายเพจ หรือ รวมทุกเพจ:
              </div>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                เชื่อมต่อ Meta Graph API ดึงข้อมูล Page Insights อัตโนมัติ
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedFbPageId}
              onChange={(e) => setSelectedFbPageId(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #93c5fd',
                backgroundColor: '#ffffff',
                fontWeight: '600',
                color: '#1e40af',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">⚡ รวมสถิติทุกลุ่มเพจ Facebook ({facebookPages.length} เพจ)</option>
              {facebookPages.map(page => (
                <option key={page.id} value={page.id}>
                  📄 {page.name} ({page.followers.toLocaleString()} ผู้ติดตาม)
                </option>
              ))}
            </select>

            {selectedFbPageId !== 'all' && (
              <button
                onClick={() => onSelectPageForCrm(selectedFbPageId)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #93c5fd',
                  borderRadius: '8px',
                  color: '#1d4ed8',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="กระโดดไปดูรายชื่อลูกค้าที่ทักเข้ามาในเพจนี้"
              >
                ดูแชทลูกค้าเพจนี้ →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Analytics Container Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Top Header of Insights Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
              Insights
            </span>
            <span style={{ color: '#64748b', fontSize: '0.92rem', fontWeight: '500' }}>
              {currentData.handle || currentData.channelName}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#f1f5f9',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#475569'
            }}>
              <CheckCircle2 size={12} color="#16a34a" /> เชื่อมต่อแล้ว
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {dateRange === '7' ? '7 วันที่ผ่านมา' : dateRange === '28' ? '28 วันที่ผ่านมา' : '30 วันที่ผ่านมา'}
            </span>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#334155',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="7">7 วันล่าสุด (Last 7 days)</option>
              <option value="28">28 วันล่าสุด (Last 28 days)</option>
              <option value="30">30 วันล่าสุด (Last 30 days)</option>
              <option value="90">90 วันล่าสุด (Last 90 days)</option>
            </select>

            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                color: '#334155',
                backgroundColor: '#f8fafc'
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {selectedPlatform === 'facebook' && (
            <>
              <div className="metric-card">
                <div className="metric-title">Followers (ผู้ติดตาม)</div>
                <div className="metric-value">{currentData.followers?.toLocaleString()}</div>
                <div className="metric-sub metric-growth-positive">
                  <TrendingUp size={14} /> {currentData.growthRate || '+14.2%'} จากเดือนที่แล้ว
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Total Reach (การเข้าถึง)</div>
                <div className="metric-value">{currentData.reach?.toLocaleString()}</div>
                <div className="metric-sub metric-growth-positive">
                  <TrendingUp size={14} /> +22.4% unique accounts
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Engagement Rate</div>
                <div className="metric-value">{currentData.engagementRate || '4.8%'}</div>
                <div className="metric-sub" style={{ color: '#059669' }}>
                  สูงกว่าค่าเฉลี่ยอุตสาหกรรม
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Profile / Page Views</div>
                <div className="metric-value">{currentData.metrics?.profileViews || '32.4K'}</div>
                <div className="metric-sub">ยอดการเข้าชมหน้าเพจ</div>
              </div>
              <div className="metric-card" style={{ borderColor: '#93c5fd', backgroundColor: '#f8faff' }}>
                <div className="metric-title" style={{ color: '#1d4ed8' }}>Inbox Leads (ลูกค้าทัก)</div>
                <div className="metric-value" style={{ color: '#1e40af' }}>
                  {currentData.metrics?.inboxLeadsCount || 48} ราย
                </div>
                <div className="metric-sub" style={{ color: '#2563eb' }}>
                  ทักสอบถาม/สนใจสินค้า
                </div>
              </div>
            </>
          )}

          {selectedPlatform === 'youtube' && (
            <>
              <div className="metric-card">
                <div className="metric-title">Subscribers</div>
                <div className="metric-value">{currentData.subscribers}</div>
                <div className="metric-sub metric-growth-positive">
                  <TrendingUp size={14} /> +2.8K ในช่วงเวลานี้
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Total Views</div>
                <div className="metric-value">{currentData.views}</div>
                <div className="metric-sub metric-growth-positive">
                  <TrendingUp size={14} /> 720K unique viewers
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Watch Time (Hours)</div>
                <div className="metric-value">{currentData.watchTimeHours}</div>
                <div className="metric-sub">เวลาในการรับชมรวม</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Avg View Duration</div>
                <div className="metric-value">{currentData.avgViewDuration}</div>
                <div className="metric-sub">{currentData.avgPctViewed} avg retention</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Engagement Rate</div>
                <div className="metric-value">{currentData.engagementRate}</div>
                <div className="metric-sub">Likes + Comments / Views</div>
              </div>
            </>
          )}

          {selectedPlatform === 'tiktok' && (
            <>
              <div className="metric-card">
                <div className="metric-title">Followers</div>
                <div className="metric-value">{currentData.followers}</div>
                <div className="metric-sub metric-growth-positive">
                  <TrendingUp size={14} /> +34.5K ผู้ติดตามใหม่
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Video Views</div>
                <div className="metric-value">{currentData.videoViews}</div>
                <div className="metric-sub metric-growth-positive">
                  <TrendingUp size={14} /> ไวรัลเพิ่ม 4 คลิป
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Total Likes</div>
                <div className="metric-value">{currentData.likes}</div>
                <div className="metric-sub">ยอดกดหัวใจสะสม</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Total Shares</div>
                <div className="metric-value">{currentData.shares}</div>
                <div className="metric-sub">การแชร์และเซฟคลิป</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Engagement Rate</div>
                <div className="metric-value">{currentData.engagementRate}</div>
                <div className="metric-sub" style={{ color: '#059669' }}>
                  สูงมากสำหรับการรับสปอนเซอร์
                </div>
              </div>
            </>
          )}

          {selectedPlatform === 'instagram' && (
            <>
              <div className="metric-card">
                <div className="metric-title">Followers</div>
                <div className="metric-value">{currentData.followers}</div>
                <div className="metric-sub metric-growth-positive">
                  <TrendingUp size={14} /> +12.4% new fans
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Accounts Reached</div>
                <div className="metric-value">{currentData.reach}</div>
                <div className="metric-sub metric-growth-positive">
                  <TrendingUp size={14} /> +18.2% vs last period
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Profile Views</div>
                <div className="metric-value">{currentData.profileViews}</div>
                <div className="metric-sub">การเข้าชมหน้าโปรไฟล์</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Interactions</div>
                <div className="metric-value">{currentData.interactions}</div>
                <div className="metric-sub">Likes + Comments + Saves</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Engagement Rate</div>
                <div className="metric-value">{currentData.engagementRate}</div>
                <div className="metric-sub">อัตราการมีส่วนร่วม</div>
              </div>
            </>
          )}
        </div>

        {/* Demographics & Insights Cards (Age, Gender, Top Cities) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Card 1: Age Range */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1e293b' }}>
                Age range (ช่วงอายุ)
              </h3>
              {/* Segmented Filter: All / Men / Women */}
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '3px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}>
                <button
                  onClick={() => setAgeSegment('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: ageSegment === 'all' ? '#0f172a' : 'transparent',
                    color: ageSegment === 'all' ? '#ffffff' : '#64748b'
                  }}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setAgeSegment('men')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: ageSegment === 'men' ? '#0f172a' : 'transparent',
                    color: ageSegment === 'men' ? '#ffffff' : '#64748b'
                  }}
                >
                  ผู้ชาย
                </button>
                <button
                  onClick={() => setAgeSegment('women')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: ageSegment === 'women' ? '#0f172a' : 'transparent',
                    color: ageSegment === 'women' ? '#ffffff' : '#64748b'
                  }}
                >
                  ผู้หญิง
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getDisplayAgeRange().map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '45px', fontSize: '0.82rem', color: '#64748b', fontWeight: '500' }}>
                    {item.age}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '14px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${item.pct}%`,
                      height: '100%',
                      background: item.pct > 40 ? '#ec4899' : '#f472b6',
                      borderRadius: '999px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <span style={{ width: '38px', textAlign: 'right', fontSize: '0.84rem', fontWeight: '700', color: '#1e293b' }}>
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Gender Distribution */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
              Gender (สัดส่วนเพศ)
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '16px',
              minHeight: '160px'
            }}>
              {/* SVG Donut Chart */}
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                  {/* Men Segment */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4.5"
                    strokeDasharray={`${currentData.demographics?.gender?.men || 50} 100`}
                    strokeDashoffset="0"
                  />
                  {/* Women Segment */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="4.5"
                    strokeDasharray={`${currentData.demographics?.gender?.women || 45} 100`}
                    strokeDashoffset={`-${currentData.demographics?.gender?.men || 50}`}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                    {currentData.demographics?.gender?.men || 54}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ผู้ชาย</span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ec4899' }}></span>
                  <span style={{ color: '#475569' }}>ผู้หญิง (Women)</span>
                  <span style={{ fontWeight: '700', marginLeft: 'auto' }}>
                    {currentData.demographics?.gender?.women || 42}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                  <span style={{ color: '#475569' }}>ผู้ชาย (Men)</span>
                  <span style={{ fontWeight: '700', marginLeft: 'auto' }}>
                    {currentData.demographics?.gender?.men || 54}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
                  <span style={{ color: '#475569' }}>อื่นๆ (Other)</span>
                  <span style={{ fontWeight: '700', marginLeft: 'auto' }}>
                    {currentData.demographics?.gender?.other || 4}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Top Cities / Geography */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
              Top Cities / Geography (พื้นที่ผู้ชมหลัก)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(currentData.demographics?.topCities || []).map((city, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '135px',
                    fontSize: '0.82rem',
                    color: '#334155',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {city.city}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '10px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${city.pct}%`,
                      height: '100%',
                      background: idx === 0 ? '#1877f2' : '#93c5fd',
                      borderRadius: '999px'
                    }} />
                  </div>
                  <span style={{ width: '35px', textAlign: 'right', fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>
                    {city.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Trend Line & Best Active Times */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Chart: Your views are holding steady */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1e293b' }}>
                Your views / reach are holding steady
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                แนวโน้มการเข้าถึงเทียบกับช่วงเวลาก่อนหน้า (Current vs Previous period)
              </p>
            </div>

            {/* SVG Visual Area Chart */}
            <div style={{ height: '140px', width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 500 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Previous period line (dotted) */}
                <path
                  d="M 0 95 Q 80 85 160 80 T 320 60 T 500 45"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {/* Current period area */}
                <path
                  d="M 0 100 Q 80 80 160 65 T 320 40 T 500 20 L 500 120 L 0 120 Z"
                  fill="url(#areaGradient)"
                />
                {/* Current period line */}
                <path
                  d="M 0 100 Q 80 80 160 65 T 320 40 T 500 20"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                />
                <circle cx="500" cy="20" r="4" fill="#ec4899" />
              </svg>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '10px',
              fontSize: '0.78rem',
              color: '#64748b'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ec4899' }}></span>
                ช่วงเวลานี้ (Last period)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '2px', backgroundColor: '#cbd5e1' }}></span>
                ช่วงเวลาก่อนหน้า (Prev. period)
              </span>
            </div>
          </div>

          {/* Best Active Times */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
              Here's when your followers have been most active recently
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '600', marginBottom: '14px' }}>
              Best times to reach them (เวลาที่โพสต์แล้วคนเห็นเยอะที่สุด):
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(currentData.demographics?.bestTimes || [
                'วันจันทร์ 19:00 - 22:00 น.',
                'วันพุธ 20:00 - 23:00 น.',
                'วันอาทิตย์ 18:00 - 21:00 น.'
              ]).map((time, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  <Clock size={16} color="#ec4899" />
                  <span>{time}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '16px',
              fontSize: '0.75rem',
              color: '#94a3b8',
              textAlign: 'right'
            }}>
              {lastRefreshed}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
