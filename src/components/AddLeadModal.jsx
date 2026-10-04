import React, { useState } from 'react';
import { X, Plus, Sparkles, MessageSquare, Video, FileText } from 'lucide-react';
import { leadStatusOptions } from '../data/mockData';

export default function AddLeadModal({ isOpen, onClose, onAddLead, facebookPages }) {
  const [name, setName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(facebookPages[0]?.id || 'fb-page-1');
  const [sourceType, setSourceType] = useState('video_comment'); // 'inbox', 'post_comment', 'video_comment'
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [contact, setContact] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [tag, setTag] = useState('Product Inquiry');
  const [dealValue, setDealValue] = useState('');
  const [status, setStatus] = useState('ทักใหม่ (New)');
  const [admin, setAdmin] = useState('แอดมินนนท์');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !inquiry.trim()) {
      alert('กรุณากรอกชื่อลูกค้าและข้อความที่ลูกค้าติดต่อมาครับ');
      return;
    }

    // Determine platform and channelName
    let platform = 'facebook';
    let channelName = '';
    if (selectedChannel === 'youtube') {
      platform = 'youtube';
      channelName = 'YouTube Channel';
    } else if (selectedChannel === 'tiktok') {
      platform = 'tiktok';
      channelName = 'TikTok Account';
    } else {
      const fbPage = facebookPages.find(p => p.id === selectedChannel);
      channelName = fbPage ? `FB: ${fbPage.name}` : 'Facebook';
    }

    let defaultTitle = sourceTitle.trim();
    if (!defaultTitle) {
      if (sourceType === 'inbox') defaultTitle = 'Messenger / Direct Chat';
      else if (sourceType === 'post_comment') defaultTitle = 'โพสต์หน้าเพจ';
      else defaultTitle = 'คลิปวิดีโอ / Reels';
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      name: name.trim(),
      channel: selectedChannel,
      channelName: channelName,
      platform: platform,
      sourceType: sourceType,
      sourceTitle: defaultTitle,
      sourceLink: sourceLink.trim() || '#',
      contact: contact.trim() || 'ไม่ได้ระบุ',
      inquiry: inquiry.trim(),
      tag: tag,
      dealValue: dealValue ? Number(dealValue) : 0,
      status: status,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      admin: admin,
      notes: notes.trim()
    };

    onAddLead(newLead);
    onClose();

    // Reset form
    setName('');
    setContact('');
    setInquiry('');
    setSourceTitle('');
    setSourceLink('');
    setDealValue('');
    setNotes('');
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content" style={{ padding: '28px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#1877f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                เพิ่มข้อความลูกค้า (Inbox หรือ คอมเมนต์)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                บันทึกข้อความจาก Inbox, คอมเมนต์หน้าเพจ หรือใต้คลิปวิดีโอ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#64748b',
              backgroundColor: '#f1f5f9'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Customer Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              ชื่อโปรไฟล์ลูกค้า / บริษัท <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น คุณกิตติศักดิ์ หรือ FB: สมพงษ์ ใจดี"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Interaction Type Selection (NEW) */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              ประเภทที่มาของข้อความ <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSourceType('video_comment')}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: sourceType === 'video_comment' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                  backgroundColor: sourceType === 'video_comment' ? '#fffbeb' : '#ffffff',
                  color: sourceType === 'video_comment' ? '#b45309' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Video size={14} /> ใต้คลิป/Reels
              </button>

              <button
                type="button"
                onClick={() => setSourceType('post_comment')}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: sourceType === 'post_comment' ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                  backgroundColor: sourceType === 'post_comment' ? '#f5f3ff' : '#ffffff',
                  color: sourceType === 'post_comment' ? '#6d28d9' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={14} /> โพสต์หน้าเพจ
              </button>

              <button
                type="button"
                onClick={() => setSourceType('inbox')}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: sourceType === 'inbox' ? '2px solid #1877f2' : '1px solid #cbd5e1',
                  backgroundColor: sourceType === 'inbox' ? '#eff6ff' : '#ffffff',
                  color: sourceType === 'inbox' ? '#1d4ed8' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={14} /> Inbox แชท
              </button>
            </div>
          </div>

          {/* Clip / Post Title */}
          {(sourceType === 'video_comment' || sourceType === 'post_comment') && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                ชื่อคลิป หรือ หัวข้อโพสต์ที่ลูกค้าคอมเมนต์เข้ามา
              </label>
              <input
                type="text"
                placeholder="เช่น คลิป: รีวิวไมค์ไร้สาย 2026 หรือ โพสต์: สรุปโปรโมชั่น"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          )}

          {/* Channel (Supports all Facebook pages!) */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              เพจ / ช่องทางที่ข้อความเข้ามา <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                backgroundColor: '#f8fafc',
                fontWeight: '600',
                color: '#1e293b'
              }}
            >
              <optgroup label="📘 เพจ Facebook (เลือกเพจที่ลูกค้าทักเข้ามา)">
                {facebookPages.map(page => (
                  <option key={page.id} value={page.id}>
                    Facebook: {page.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌐 แพลตฟอร์มอื่น ๆ">
                <option value="youtube">▶ YouTube Channel Inquiries & Comments</option>
                <option value="tiktok">🎵 TikTok Comments & Messages</option>
              </optgroup>
            </select>
          </div>

          {/* Inquiry / Message */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              ข้อความที่ลูกค้าพิมพ์มา <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder="เช่น ถามราคาตัวในคลิป, มีของพร้อมส่งไหม, สนใจสปอนเซอร์..."
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Contact Details & Deal Value */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                ช่องทางติดต่อ (เบอร์ / Line / Profile)
              </label>
              <input
                type="text"
                placeholder="เช่น Line หรือเบอร์โทร"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                มูลค่าคาดการณ์ (บาท)
              </label>
              <input
                type="number"
                placeholder="เช่น 1500"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Tag & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                หมวดหมู่ / แท็ก
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Product Inquiry">Product Inquiry / ถามสินค้า</option>
                <option value="Sponsorship / Media">Sponsorship / รีวิว</option>
                <option value="Wholesale / ราคาส่ง">Wholesale / ราคาส่ง</option>
                <option value="Retail Order / ซื้อปลีก">Retail Order / ซื้อปลีก</option>
                <option value="Course / Training">Course / คอร์สเรียน</option>
                <option value="Speaker / Event">Speaker / บรรยาย</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                สถานะ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              >
                {leadStatusOptions.filter(o => o.value !== 'all').map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontWeight: '600',
                fontSize: '0.88rem'
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
                fontSize: '0.88rem',
                boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)'
              }}
            >
              + บันทึกข้อความลูกค้านี้
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
