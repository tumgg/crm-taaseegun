import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Send, 
  Copy, 
  Plus, 
  Tag, 
  Check, 
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  initialCatalogCategories, 
  loadCatalogItems, 
  saveCatalogItems 
} from '../data/portfolioCatalog';

export default function PortfolioCatalogModal({ 
  isOpen, 
  onClose, 
  onSelectPhotoToSend, 
  onInsertDescription,
  activeLead
}) {
  const [items, setItems] = useState(() => loadCatalogItems());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('texture');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  if (!isOpen) return null;

  // Filter items based on category and search query
  const filteredItems = items.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCat && matchQuery;
  });

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) {
      alert('กรุณาระบุชื่อผลงานและลิงก์รูปภาพครับ');
      return;
    }

    const newItem = {
      id: `custom-cat-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      pageName: 'ผลงานจริงของร้าน',
      priceEstimate: newPrice.trim() || 'ตามประเมินหน้างาน',
      imageUrl: newImageUrl.trim(),
      description: newDesc.trim() || newTitle.trim(),
      tags: ['ผลงานร้าน', 'อัปเดตใหม่']
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveCatalogItems(updated);
    setIsAddingNew(false);
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setNewImageUrl('');
  };

  const handleCopyText = (item) => {
    const fullText = `🎨 ${item.title}\n💰 ราคาโดยประมาณ: ${item.priceEstimate}\n📌 รายละเอียด: ${item.description}`;
    if (onInsertDescription) {
      onInsertDescription(fullText);
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDirectSend = (item) => {
    if (onSelectPhotoToSend) {
      onSelectPhotoToSend(item);
    }
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                คลังรูปภาพผลงาน & ตัวอย่างสีด่วน
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                เลือกรูปตัวอย่างผลงานส่งให้ {activeLead ? `"${activeLead.name}"` : 'ลูกค้า'} ในแชทได้ใน 1 วินาที
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: isAddingNew ? '#e2e8f0' : '#7c3aed',
                color: isAddingNew ? '#1e293b' : '#ffffff',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Plus size={15} /> {isAddingNew ? 'ปิดฟอร์ม' : 'เพิ่มผลงานใหม่'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผลงาน, ลายเทกเจอร์, หินอ่อน, สนิม, คอนโด, ทาสีบ้าน..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.84rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px'
          }}>
            {initialCatalogCategories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: isSelected ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                    color: isSelected ? '#7c3aed' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? '700' : '500',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add New Item Form (Expandable) */}
        {isAddingNew && (
          <form onSubmit={handleAddNewItem} style={{
            padding: '14px 20px',
            backgroundColor: '#faf5ff',
            borderBottom: '1px solid #e9d5ff',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#6b21a8' }}>
              ✨ เพิ่มรูปผลงานใหม่เข้าคลัง (บันทึกไว้ใช้ส่งให้ลูกค้าได้ตลอด)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <input
                type="text"
                placeholder="ชื่อผลงาน (เช่น สีเทกเจอร์ลาย Travertine โทนขาว)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              >
                <option value="texture">🧱 สีเทกเจอร์ / Texture</option>
                <option value="house">🏠 ทาสีบ้าน & ภายนอก</option>
                <option value="condo">🏢 ทาสีคอนโด & ภายใน</option>
                <option value="color_chart">🎨 ชาร์ตเฉดสียอดนิยม</option>
              </select>
              <input
                type="text"
                placeholder="ราคาประเมิน (เช่น 1,100 บ./ตร.ม.)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="url"
                placeholder="ลิงก์ URL รูปภาพ (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                required
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
              <input
                type="text"
                placeholder="คำอธิบายสั้นๆ เกี่ยวกับผลงานและคุณสมบัติสี"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                บันทึกเข้าคลัง
              </button>
            </div>
          </form>
        )}

        {/* Items Grid */}
        <div style={{
          padding: '16px 20px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '14px',
          flex: 1
        }}>
          {filteredItems.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <ImageIcon size={40} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <div>ไม่พบผลงานที่ตรงกับคำค้นหา "{searchQuery}"</div>
            </div>
          ) : (
            filteredItems.map(item => {
              return (
                <div
                  key={item.id}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.04)';
                  }}
                >
                  {/* Photo Preview */}
                  <div style={{ position: 'relative', height: '140px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {item.pageName}
                    </span>

                    {item.priceEstimate && (
                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                      }}>
                        {item.priceEstimate}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.3', marginBottom: '4px' }}>
                      {item.title}
                    </div>

                    <p style={{
                      fontSize: '0.74rem',
                      color: '#64748b',
                      lineHeight: '1.4',
                      margin: '0 0 10px',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.description}
                    </p>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => handleDirectSend(item)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        title="ส่งรูปภาพนี้เข้าแชทลูกค้าทันที"
                      >
                        <Send size={13} /> ส่งรูปนี้ให้ลูกค้า
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyText(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: copiedId === item.id ? '#ecfdf5' : '#f8fafc',
                          color: copiedId === item.id ? '#059669' : '#475569',
                          border: copiedId === item.id ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                          fontSize: '0.74rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        title="นำข้อความรายละเอียดและราคาไปใส่ในช่องแชท"
                      >
                        {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem',
          color: '#64748b'
        }}>
          <span>💡 คลิก <strong>"ส่งรูปนี้ให้ลูกค้า"</strong> เพื่อส่งเข้าแชท Messenger ได้ใน 1 วินาที</span>
          <span>มีทั้งหมด {items.length} ผลงานในคลัง</span>
        </div>
      </div>
    </div>
  );
}
