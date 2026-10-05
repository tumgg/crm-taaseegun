import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Image as ImageIcon, 
  X, 
  Check, 
  Edit3, 
  Trash2, 
  Star, 
  Upload, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  initialSavedReplies, 
  SAVED_REPLY_CATEGORIES, 
  loadSavedReplies, 
  saveSavedReplies 
} from '../data/savedRepliesData';

export default function SavedRepliesModal({
  isOpen,
  onClose,
  onSelectReply,
  onDirectSend
}) {
  const [replies, setReplies] = useState(() => loadSavedReplies());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('frequent'); // Default to 'ใช้บ่อย' like Facebook screenshot
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Active Menu (3 dots)
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Add / Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('สเปกสี');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsFrequent, setFormIsFrequent] = useState(true);

  const fileUploadRef = useRef(null);
  const popoverRef = useRef(null);

  // Close 3-dot dropdown if clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.saved-reply-menu-btn')) {
        setActiveMenuId(null);
      }
      if (!e.target.closest('.category-dropdown-container')) {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter replies
  const filteredReplies = replies.filter(r => {
    // Category filter
    let matchCat = true;
    if (selectedCategory === 'frequent') {
      matchCat = Boolean(r.isFrequent);
    } else if (selectedCategory !== 'all') {
      matchCat = r.category === selectedCategory;
    }

    // Search query
    let matchQuery = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchQuery = r.title.toLowerCase().includes(q) || 
                   r.text.toLowerCase().includes(q) ||
                   (r.category && r.category.toLowerCase().includes(q));
    }

    return matchCat && matchQuery;
  });

  const selectedCategoryLabel = SAVED_REPLY_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'ใช้บ่อย';

  // Open Form to Add
  const handleOpenAddForm = () => {
    setEditingReply(null);
    setFormTitle('');
    setFormText('');
    setFormCategory('สเปกสี');
    setFormImageUrl('');
    setFormIsFrequent(true);
    setIsFormOpen(true);
  };

  // Open Form to Edit
  const handleOpenEditForm = (reply, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingReply(reply);
    setFormTitle(reply.title);
    setFormText(reply.text);
    setFormCategory(reply.category || 'สเปกสี');
    setFormImageUrl(reply.imageUrl || '');
    setFormIsFrequent(Boolean(reply.isFrequent));
    setIsFormOpen(true);
  };

  // Toggle Frequent
  const handleToggleFrequent = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const updated = replies.map(r => r.id === id ? { ...r, isFrequent: !r.isFrequent } : r);
    setReplies(updated);
    saveSavedReplies(updated);
  };

  // Delete
  const handleDelete = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (window.confirm('ต้องการลบการตอบกลับนี้หรือไม่?')) {
      const updated = replies.filter(r => r.id !== id);
      setReplies(updated);
      saveSavedReplies(updated);
    }
  };

  // Handle local image upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('รูปภาพมีขนาดใหญ่เกิน 5MB กรุณาเลือกรูปที่มีขนาดเล็กลงครับ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormImageUrl(uploadEvent.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  // Save Add/Edit
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formText.trim()) {
      alert('กรุณากรอกชื่อหัวข้อและข้อความตอบกลับครับ');
      return;
    }

    if (editingReply) {
      // Edit existing
      const updated = replies.map(r => {
        if (r.id === editingReply.id) {
          return {
            ...r,
            title: formTitle.trim(),
            text: formText.trim(),
            category: formCategory,
            imageUrl: formImageUrl.trim() || null,
            isFrequent: formIsFrequent
          };
        }
        return r;
      });
      setReplies(updated);
      saveSavedReplies(updated);
    } else {
      // Create new
      const newReply = {
        id: `sr-${Date.now()}`,
        title: formTitle.trim(),
        text: formText.trim(),
        category: formCategory,
        imageUrl: formImageUrl.trim() || null,
        isFrequent: formIsFrequent
      };
      const updated = [newReply, ...replies];
      setReplies(updated);
      saveSavedReplies(updated);
    }

    setIsFormOpen(false);
    setEditingReply(null);
  };

  // Click on reply card
  const handleSelectCard = (reply) => {
    if (onSelectReply) {
      onSelectReply(reply);
    }
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        ref={popoverRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '82vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: '55px', // Sit cleanly right above the composer
          position: 'relative',
          animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Pointer Arrow pointing to toolbar */}
        <div style={{
          position: 'absolute',
          bottom: '-7px',
          right: '80px',
          width: '14px',
          height: '14px',
          backgroundColor: '#ffffff',
          transform: 'rotate(45deg)',
          boxShadow: '2px 2px 4px rgba(0,0,0,0.06)',
          zIndex: -1
        }} />

        {/* 1. Header (การตอบกลับที่บันทึกไว้ + เพิ่มใหม่) */}
        <div style={{
          padding: '14px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isFormOpen ? '1px solid #f1f5f9' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ 
              fontSize: '1.05rem', 
              fontWeight: '800', 
              color: '#0f172a', 
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              การตอบกลับที่บันทึกไว้
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isFormOpen && (
              <button
                type="button"
                onClick={handleOpenAddForm}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1877f2',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '4px 6px',
                  borderRadius: '6px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Plus size={15} /> เพิ่มใหม่
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#334155'}
              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. ADD / EDIT FORM VIEW */}
        {isFormOpen ? (
          <form onSubmit={handleSaveForm} style={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#1877f2' }}>
              {editingReply ? '✏️ แก้ไขการตอบกลับ' : '✨ เพิ่มการตอบกลับใหม่'}
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                ชื่อหัวข้อ / คีย์เวิร์ด
              </label>
              <input
                type="text"
                placeholder="เช่น TOA ซุปเปอร์ชิลด์ ดูราคลีน A+, ขอภาพ ประเมินราคา"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.84rem',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Category & Frequent Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                  หมวดหมู่
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.8rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="สเปกสี">สเปกสี / TOA</option>
                  <option value="ขอข้อมูลหน้างาน">ขอข้อมูลหน้างาน</option>
                  <option value="โปรโมชั่น">ราคา / โปรโมชั่น</option>
                  <option value="สีเทกเจอร์">สีเทกเจอร์</option>
                  <option value="นัดหมาย">นัดหมาย</option>
                  <option value="ชำระเงิน">ชำระเงิน</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '18px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formIsFrequent}
                    onChange={(e) => setFormIsFrequent(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: '#1877f2' }}
                  />
                  <span>⭐ ปักหมุดใช้บ่อย</span>
                </label>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                ข้อความตอบกลับลูกค้า
              </label>
              <textarea
                rows="4"
                placeholder="ระบุข้อความที่จะส่งให้ลูกค้าในแชท..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Attached Photo */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                รูปภาพแนบประกอบ (ส่งไปพร้อมข้อความ)
              </label>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileUploadRef.current?.click()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Upload size={14} /> อัปโหลดรูปจากเครื่อง
                </button>
                <input
                  type="file"
                  ref={fileUploadRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>หรือ</span>

                <input
                  type="url"
                  placeholder="URL รูปภาพ (https://...)"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem'
                  }}
                />
              </div>

              {/* Image Preview */}
              {formImageUrl && (
                <div style={{
                  marginTop: '8px',
                  position: 'relative',
                  width: '70px',
                  height: '70px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  <img
                    src={formImageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('')}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingReply(null);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  padding: '6px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#1877f2',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(24, 119, 242, 0.3)'
                }}
              >
                บันทึกการตอบกลับ
              </button>
            </div>
          </form>
        ) : (
          /* 3. NORMAL LIST VIEW */
          <>
            {/* Search & Category Filter Row */}
            <div style={{
              padding: '0 16px 12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              {/* Search Box */}
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="ค้นหา"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Category Dropdown (ตรงตาม screenshot: ใช้บ่อย ▾) */}
              <div className="category-dropdown-container" style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{selectedCategoryLabel}</span>
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {isCategoryDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    width: '160px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                    zIndex: 100,
                    overflow: 'hidden',
                    padding: '4px'
                  }}>
                    {SAVED_REPLY_CATEGORIES.map(cat => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setIsCategoryDropdownOpen(false);
                          }}
                          style={{
                            padding: '7px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? '700' : '500',
                            color: isSelected ? '#1877f2' : '#334155',
                            backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span>{cat.label}</span>
                          {isSelected && <Check size={14} color="#1877f2" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* List of Saved Replies */}
            <div style={{
              overflowY: 'auto',
              flex: 1,
              maxHeight: '440px',
              padding: '0 8px 12px'
            }}>
              {filteredReplies.length === 0 ? (
                <div style={{
                  padding: '40px 16px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.84rem'
                }}>
                  <ImageIcon size={32} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                  <div>ไม่พบคำตอบที่บันทึกไว้ในหมวดนี้</div>
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    style={{
                      marginTop: '10px',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#eff6ff',
                      color: '#1877f2',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    + สร้างคำตอบใหม่
                  </button>
                </div>
              ) : (
                filteredReplies.map(reply => {
                  const isMenuOpen = activeMenuId === reply.id;

                  return (
                    <div
                      key={reply.id}
                      onClick={() => handleSelectCard(reply)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        position: 'relative',
                        borderBottom: '1px solid #f8fafc'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Left: Thumbnail Image OR Placeholder Icon */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0'
                      }}>
                        {reply.imageUrl ? (
                          <img
                            src={reply.imageUrl}
                            alt={reply.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <ImageIcon size={22} color="#94a3b8" />
                        )}
                      </div>

                      {/* Middle: Title & Body text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: '800',
                          fontSize: '0.86rem',
                          color: '#0f172a',
                          marginBottom: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {reply.title}
                          </span>
                          {reply.isFrequent && (
                            <Star size={11} fill="#eab308" color="#eab308" style={{ flexShrink: 0 }} />
                          )}
                        </div>

                        <div style={{
                          fontSize: '0.77rem',
                          color: '#475569',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}>
                          {reply.text}
                        </div>
                      </div>

                      {/* Right: Three Dots Action Menu */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="saved-reply-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : reply.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#334155'}
                          onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                          title="ตัวเลือกเพิ่มเติม"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Three Dots Dropdown Menu */}
                        {isMenuOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '2px',
                            width: '150px',
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                            zIndex: 110,
                            overflow: 'hidden',
                            padding: '4px'
                          }}>
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditForm(reply, e)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '6px 8px',
                                border: 'none',
                                background: 'none',
                                fontSize: '0.78rem',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRadius: '4px'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Edit3 size={13} /> แก้ไข
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleToggleFrequent(reply.id, e)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '6px 8px',
                                border: 'none',
                                background: 'none',
                                fontSize: '0.78rem',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRadius: '4px'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Star size={13} color={reply.isFrequent ? '#eab308' : '#94a3b8'} fill={reply.isFrequent ? '#eab308' : 'none'} />
                              {reply.isFrequent ? 'เลิกปักหมุด' : 'ปักหมุดใช้บ่อย'}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(reply.id, e)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '6px 8px',
                                border: 'none',
                                background: 'none',
                                fontSize: '0.78rem',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                borderRadius: '4px'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Trash2 size={13} /> ลบ
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Hint Footer */}
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc',
              fontSize: '0.72rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>💡 คลิกที่คำตอบเพื่อนำข้อความและรูปภาพใส่ลงในแชท</span>
              <span>มี {replies.length} คำตอบ</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
