import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Search,
  ArrowLeft,
  MessageSquare,
  FileText,
  Video,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Sparkles,
  Paperclip,
  Smile,
  User,
  Phone,
  Mail,
  Tag,
  DollarSign,
  AlertCircle,
  CornerDownRight,
  ShieldCheck,
  ChevronRight,
  Filter,
  Volume2,
  VolumeX,
  Calendar,
  Bell,
  Zap,
  Bot,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Download,
  X,
  Maximize2,
  Info,
  Plus,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  leadStatusOptions,
  quickReplyTemplates,
  interactionTypeOptions,
  REAL_GOOD_VIBES_PAGE_ID,
  REAL_GOOD_VIBES_TOKEN,
  REAL_TAASEEGUN_PAGE_ID,
  REAL_TAASEEGUN_TOKEN,
  REAL_ROOMS_PAINTING_PAGE_ID,
  REAL_ROOMS_PAINTING_TOKEN,
  REAL_TEXTURE_BEAR_PAGE_ID,
  REAL_TEXTURE_BEAR_TOKEN
} from '../data/mockData';
import { playNotificationSound } from '../utils/sound';
import {
  analyzeMessageIntent,
  generateAIDraftReply,
  generateChatSummary,
  analyzeClosingScore,
  detectFollowUpStatus
} from '../utils/aiAssistant';
import {
  fetchLiveFacebookConversations,
  sendFacebookMessengerReply,
  sendFacebookAttachment,
  replyToFacebookComment,
  replyToFacebookCommentWithAttachment,
  sendFacebookPrivateReply,
  normalizeAttachment,
  sortLeadsByLatest,
  formatConversationTime,
  getLeadTimestamp
} from '../utils/facebookLiveSync';
import { supabase } from '../utils/supabaseClient';
import PortfolioCatalogModal from './PortfolioCatalogModal';
import SavedRepliesModal from './SavedRepliesModal';

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
];

export function getLeadAvatarUrl(lead) {
  if (!lead) return null;
  // 1. Manually set or uploaded avatar
  if (lead.avatar && typeof lead.avatar === 'string' && lead.avatar.trim()) {
    return lead.avatar.trim();
  }
  // 2. Real profile picture from Facebook if provided by API
  if (lead.profilePic && typeof lead.profilePic === 'string' && lead.profilePic.trim()) {
    return lead.profilePic.trim();
  }
  if (lead.profile_pic && typeof lead.profile_pic === 'string' && lead.profile_pic.trim()) {
    return lead.profile_pic.trim();
  }
  return null;
}

export function getInitials(name) {
  if (!name) return 'ลูก';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getAvatarBg(name) {
  const colors = [
    { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
    { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' },
    { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' }
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

export function CustomerAvatar({
  lead,
  size = 40,
  border,
  style = {},
  showStatusBadge = false,
  isReplied = true
}) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = getLeadAvatarUrl(lead);
  const av = getAvatarBg(lead?.name);
  const initials = getInitials(lead?.name);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const effectiveBorder = border !== undefined
    ? border
    : (!isReplied ? '2px solid #f87171' : `1px solid ${av.border}`);

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0, ...style }}>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={lead?.name || 'ลูกค้า'}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            border: effectiveBorder,
            backgroundColor: av.bg,
            display: 'block'
          }}
        />
      ) : (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: av.bg,
          color: av.text,
          border: effectiveBorder,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: size > 48 ? '1.2rem' : (size >= 38 ? '0.82rem' : '0.72rem'),
          userSelect: 'none'
        }}>
          {initials}
        </div>
      )}

      {/* Instant Signal: Red dot if Unreplied, Green check if Replied */}
      {showStatusBadge && (
        !isReplied ? (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '13px',
              height: '13px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid #ffffff',
              boxShadow: '0 0 0 1px #dc2626',
              zIndex: 2
            }}
            title="รอแอดมินตอบกลับ (ยังไม่ตอบ)"
          />
        ) : (
          <span
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: '2px solid #ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              fontWeight: '900',
              zIndex: 2
            }}
            title="แอดมินตอบลูกค้าแล้ว"
          >
            ✓
          </span>
        )
      )}
    </div>
  );
}

export function getPageTheme(channelId) {
  if (channelId === REAL_TAASEEGUN_PAGE_ID) {
    return {
      name: 'บริษัท ทาสีกัน จำกัด',
      shortName: 'ทาสีกัน',
      icon: '🏠',
      primary: '#d97706',
      darkText: '#92400e',
      bg: '#fffdf5',
      bgHover: '#fef9c3',
      bgSelected: '#fef08a',
      borderLeft: '#d97706',
      borderSelected: '#b45309',
      cardBorder: '#fef08a',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
      badgeBorder: '#fde68a'
    };
  }
  if (channelId === REAL_ROOMS_PAINTING_PAGE_ID) {
    return {
      name: 'RoomsPainting',
      shortName: 'RoomsPainting',
      icon: '🏢',
      primary: '#7c3aed',
      darkText: '#5b21b6',
      bg: '#faf5ff',
      bgHover: '#f3e8ff',
      bgSelected: '#ede9fe',
      borderLeft: '#7c3aed',
      borderSelected: '#6d28d9',
      cardBorder: '#e9d5ff',
      badgeBg: '#ede9fe',
      badgeText: '#6d28d9',
      badgeBorder: '#ddd6fe'
    };
  }
  if (channelId === REAL_TEXTURE_BEAR_PAGE_ID) {
    return {
      name: 'ช่างหมี เทกเจอร์',
      shortName: 'ช่างหมี',
      icon: '🐻',
      primary: '#ea580c',
      darkText: '#9a3412',
      bg: '#fff8f3',
      bgHover: '#ffedd5',
      bgSelected: '#fed7aa',
      borderLeft: '#ea580c',
      borderSelected: '#c2410c',
      cardBorder: '#fed7aa',
      badgeBg: '#ffedd5',
      badgeText: '#c2410c',
      badgeBorder: '#fed7aa'
    };
  }
  // Default: Good Vibes
  return {
    name: 'Good Vibes',
    shortName: 'Good Vibes',
    icon: '🎨',
    primary: '#1d4ed8',
    darkText: '#1e40af',
    bg: '#f0f7ff',
    bgHover: '#e0f2fe',
    bgSelected: '#dbeafe',
    borderLeft: '#2563eb',
    borderSelected: '#1d4ed8',
    cardBorder: '#bfdbfe',
    badgeBg: '#eff6ff',
    badgeText: '#1d4ed8',
    badgeBorder: '#bfdbfe'
  };
}

export default function UnifiedChatCenter({
  leads,
  setLeads,
  facebookPages,
  selectedLeadId,
  setSelectedLeadId,
  currentUser
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'inbox', 'video_comment', 'post_comment', 'due_followup'
  const [filterChannel, setFilterChannel] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [replyMode, setReplyMode] = useState('inbox'); // 'inbox' (Private) or 'comment' (Public reply)
  const [activeAdminName, setActiveAdminName] = useState(currentUser?.name || 'แอดมินนนท์');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAutoPilotEnabled, setIsAutoPilotEnabled] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [isSyncingFb, setIsSyncingFb] = useState(false);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 900;
    return false;
  });
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'chat' | 'profile'

  // Attachments State (Viewing & Sending Photos/Files - Supports Multiple Photos)
  const [selectedAttachments, setSelectedAttachments] = useState([]); // Array of { id, file, name, size, type, previewUrl }
  const [isSendingAttachment, setIsSendingAttachment] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(null); // { current, total }
  const [selectedImageModal, setSelectedImageModal] = useState(null); // { url, name, date, sender }
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Customer Avatar Customization State & Ref
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrlInput, setCustomAvatarUrlInput] = useState('');
  const avatarFileInputRef = useRef(null);
  const chatInputRef = useRef(null);

  // AI TL;DR Summary & Follow-Up UI States
  const [isAiSummaryExpanded, setIsAiSummaryExpanded] = useState(false);
  const [dismissedFollowUps, setDismissedFollowUps] = useState({});

  // Dedicated Multi-Photo Selector (accept="image/*" multiple)
  const handleImageSelect = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    const validFiles = [];
    const oversizedNames = [];

    for (const file of rawFiles) {
      if (file.size > 25 * 1024 * 1024) {
        oversizedNames.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    if (oversizedNames.length > 0) {
      alert(`มีไฟล์ขนาดเกิน 25MB จำนวน ${oversizedNames.length} ไฟล์ ซึ่งไม่สามารถส่งผ่าน Facebook ได้:\n${oversizedNames.slice(0, 3).join(', ')}...`);
    }

    if (validFiles.length > 0) {
      const newAttachments = validFiles.map((file, idx) => ({
        id: `att-img-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        type: 'image',
        previewUrl: URL.createObjectURL(file)
      }));

      setSelectedAttachments(prev => [...prev, ...newAttachments]);
      setToastNotification(`📷 เพิ่มรูปภาพแล้ว ${validFiles.length} รูป (รวมทั้งหมด ${selectedAttachments.length + validFiles.length} รูปพร้อมส่ง)`);
      setTimeout(() => setToastNotification(null), 3500);
    }

    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Dedicated Multi-Document/File Selector (PDF, DOC, ZIP)
  const handleFileSelect = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    const validFiles = [];
    for (const file of rawFiles) {
      if (file.size > 25 * 1024 * 1024) {
        alert(`ไฟล์ "${file.name}" มีขนาดเกิน 25MB ครับ`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      const newAttachments = validFiles.map((file, idx) => {
        const isImg = file.type.startsWith('image/');
        const isVid = file.type.startsWith('video/');
        const objUrl = URL.createObjectURL(file);
        return {
          id: `att-file-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          file,
          name: file.name,
          size: file.size,
          type: isImg ? 'image' : (isVid ? 'video' : 'file'),
          previewUrl: isImg ? objUrl : null,
          url: objUrl
        };
      });

      setSelectedAttachments(prev => [...prev, ...newAttachments]);
      setToastNotification(`📎 เพิ่มไฟล์แนบแล้ว ${validFiles.length} ไฟล์`);
      setTimeout(() => setToastNotification(null), 3500);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Support Pasting Images directly from Clipboard (Cmd+V / Ctrl+V) - Supports Multiple
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;

    const pastedAttachments = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const timeCode = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '');
          pastedAttachments.push({
            id: `att-paste-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            file,
            name: `รูปภาพ_${timeCode}_${i + 1}.png`,
            size: file.size,
            type: 'image',
            previewUrl: URL.createObjectURL(file)
          });
        }
      }
    }

    if (pastedAttachments.length > 0) {
      e.preventDefault();
      setSelectedAttachments(prev => [...prev, ...pastedAttachments]);
      setToastNotification(`📸 วางรูปภาพจาก Clipboard แล้ว ${pastedAttachments.length} รูป พร้อมส่ง!`);
      setTimeout(() => setToastNotification(null), 3500);
    }
  };

  // Support Drag and Drop files onto chat - Supports Multiple
  const handleDrop = (e) => {
    e.preventDefault();
    const rawFiles = Array.from(e.dataTransfer?.files || []);
    if (rawFiles.length === 0) return;

    const validAttachments = [];
    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      if (file.size <= 25 * 1024 * 1024) {
        const isImg = file.type.startsWith('image/');
        const isVid = file.type.startsWith('video/');
        validAttachments.push({
          id: `att-drop-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          file,
          name: file.name,
          size: file.size,
          type: isImg ? 'image' : (isVid ? 'video' : 'file'),
          previewUrl: isImg ? URL.createObjectURL(file) : null
        });
      }
    }

    if (validAttachments.length > 0) {
      setSelectedAttachments(prev => [...prev, ...validAttachments]);
      setToastNotification(`📥 ลากวางไฟล์สำเร็จ ${validAttachments.length} ไฟล์!`);
      setTimeout(() => setToastNotification(null), 3500);
    }
  };

  // Remove single attachment by ID
  const handleRemoveSingleAttachment = (idToRemove) => {
    setSelectedAttachments(prev => {
      const target = prev.find(a => a.id === idToRemove);
      if (target?.previewUrl && target.file) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(a => a.id !== idToRemove);
    });
  };

  // Remove all attachments
  const handleClearAllAttachments = () => {
    selectedAttachments.forEach(att => {
      if (att.previewUrl && att.file) {
        URL.revokeObjectURL(att.previewUrl);
      }
    });
    setSelectedAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Portfolio & Texture Catalog Modal State
  const [isPortfolioCatalogOpen, setIsPortfolioCatalogOpen] = useState(false);

  // Saved Replies Modal State (การตอบกลับที่บันทึกไว้ พร้อมรูปภาพ)
  const [isSavedRepliesOpen, setIsSavedRepliesOpen] = useState(false);

  // Toggle Right CRM Info Pane (ให้พื้นที่แชทกว้างขึ้น สบายตา)
  const [isRightPaneOpen, setIsRightPaneOpen] = useState(true);

  // Handle Selection of Saved Reply (ข้อความตอบกลับที่บันทึกไว้ พร้อมรูปภาพ)
  const handleSelectSavedReply = async (reply) => {
    try {
      setReplyText(reply.text);

      if (reply.imageUrl) {
        setToastNotification(`กำลังแนบรูปภาพ "${reply.title}"...`);
        try {
          const res = await fetch(reply.imageUrl);
          const blob = await res.blob();
          const cleanName = `${reply.title.replace(/[\/\\?%*:|"<>]/g, '_')}.jpg`;
          const file = new File([blob], cleanName, { type: blob.type || 'image/jpeg' });
          const newAtt = {
            id: `att-reply-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            file,
            name: cleanName,
            size: file.size,
            type: 'image',
            previewUrl: URL.createObjectURL(file)
          };
          setSelectedAttachments(prev => [...prev, newAtt]);
        } catch (fetchErr) {
          console.warn('Direct fetch failed, falling back to direct URL attachment:', fetchErr);
          const newAtt = {
            id: `att-reply-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            file: null,
            name: `${reply.title}.jpg`,
            size: 150000,
            type: 'image',
            previewUrl: reply.imageUrl
          };
          setSelectedAttachments(prev => [...prev, newAtt]);
        }
        setToastNotification(`💬 นำการตอบกลับ "${reply.title}" พร้อมรูปภาพใส่ในช่องแชทแล้ว กดส่งได้เลย!`);
      } else {
        setToastNotification(`💬 นำการตอบกลับ "${reply.title}" ใส่ในช่องแชทแล้ว`);
      }
      setTimeout(() => setToastNotification(null), 3500);
    } catch (err) {
      console.error('Error applying saved reply:', err);
    }
  };

  // Fast One-Click Send from Portfolio Catalog (Single)
  const handleSelectCatalogPhoto = async (item) => {
    await handleSelectMultipleCatalogPhotos([item]);
  };

  // Multi-Photo Send from Portfolio Catalog
  const handleSelectMultipleCatalogPhotos = async (catalogItems) => {
    if (!catalogItems || catalogItems.length === 0) return;
    try {
      setToastNotification(`กำลังเตรียมรูปตัวอย่างผลงาน ${catalogItems.length} รูป...`);
      const newAtts = [];

      for (const item of catalogItems) {
        try {
          const res = await fetch(item.imageUrl);
          const blob = await res.blob();
          const cleanName = `${item.title.replace(/[\/\\?%*:|"<>]/g, '_')}.jpg`;
          const file = new File([blob], cleanName, { type: blob.type || 'image/jpeg' });
          newAtts.push({
            id: `att-cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            file,
            name: cleanName,
            size: file.size,
            type: 'image',
            previewUrl: URL.createObjectURL(file)
          });
        } catch (fetchErr) {
          console.warn('Direct fetch failed, falling back to direct URL attachment:', fetchErr);
          newAtts.push({
            id: `att-cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            file: null,
            name: `${item.title}.jpg`,
            size: 150000,
            type: 'image',
            previewUrl: item.imageUrl
          });
        }
      }

      setSelectedAttachments(prev => [...prev, ...newAtts]);

      if (catalogItems.length === 1) {
        const item = catalogItems[0];
        setReplyText(`🎨 ตัวอย่างผลงาน: ${item.title}\n💰 ราคาประเมิน: ${item.priceEstimate}\n📌 รายละเอียด: ${item.description}`);
      } else {
        const titlesText = catalogItems.map((c, i) => `${i + 1}. ${c.title} (${c.priceEstimate})`).join('\n');
        setReplyText(`🎨 ส่งตัวอย่างผลงานและเฉดสีที่ลูกค้าน่าจะสนใจครับ:\n${titlesText}\n\nสะดวกให้ทางเราเข้าวัดหน้างานจริงประเมินพื้นที่ช่วงไหนแจ้งได้เลยนะครับ 😊`);
      }

      setToastNotification(`🎨 แนบรูปตัวอย่าง ${catalogItems.length} รูปเรียบร้อย กดส่งข้อความได้เลยครับ!`);
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err) {
      console.error('Error attaching catalog photos:', err);
    }
  };

  const handleInsertCatalogDescription = (text) => {
    setReplyText(prev => prev ? `${prev}\n\n${text}` : text);
    setToastNotification('📝 นำข้อความรายละเอียดใส่ลงในช่องแชทเรียบร้อย');
    setTimeout(() => setToastNotification(null), 2500);
  };

  const handleRemoveAttachment = () => {
    handleClearAllAttachments();
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync real live conversations from Meta Graph API for all connected pages
  const handleSyncRealFacebook = async (silent = false) => {
    const isValidToken = (t) => typeof t === 'string' && t.startsWith('EAA') && !t.includes('...') && t.length > 50;

    // Collect all pages with verified tokens
    let pagesToSync = (facebookPages || []).filter(p => isValidToken(p.activePageToken));

    // Ensure Good Vibes is included
    if (!pagesToSync.some(p => p.id === REAL_GOOD_VIBES_PAGE_ID)) {
      pagesToSync.push({
        id: REAL_GOOD_VIBES_PAGE_ID,
        name: 'รับพ่นสี Texture ฉาบเทคเจอร์ ราคาถูก By Good Vibes',
        activePageToken: REAL_GOOD_VIBES_TOKEN
      });
    }

    // Ensure Taaseegun is included
    if (!pagesToSync.some(p => p.id === REAL_TAASEEGUN_PAGE_ID)) {
      pagesToSync.push({
        id: REAL_TAASEEGUN_PAGE_ID,
        name: 'บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี',
        activePageToken: REAL_TAASEEGUN_TOKEN
      });
    }

    // Ensure RoomsPainting is included
    if (!pagesToSync.some(p => p.id === REAL_ROOMS_PAINTING_PAGE_ID)) {
      pagesToSync.push({
        id: REAL_ROOMS_PAINTING_PAGE_ID,
        name: 'ทาสีคอนโด ทาสีภายใน - RoomsPainting',
        activePageToken: REAL_ROOMS_PAINTING_TOKEN
      });
    }

    // Ensure Texture Bear (ช่างหมี) is included
    if (!pagesToSync.some(p => p.id === REAL_TEXTURE_BEAR_PAGE_ID)) {
      pagesToSync.push({
        id: REAL_TEXTURE_BEAR_PAGE_ID,
        name: 'รับทำสีเทกเจอร์ texture สีตกแต่งพิเศษ by ช่างหมี',
        activePageToken: REAL_TEXTURE_BEAR_TOKEN
      });
    }

    if (!silent) setIsSyncingFb(true);
    try {
      const syncPromises = pagesToSync.map(async (page) => {
        try {
          const pageLeads = await fetchLiveFacebookConversations(page.id, page.activePageToken, page.name);
          return { pageName: page.name, leads: pageLeads, error: null };
        } catch (err) {
          console.warn(`Sync error for ${page.name}:`, err);
          return { pageName: page.name, leads: [], error: err.message };
        }
      });

      const results = await Promise.all(syncPromises);
      let allNewLeads = [];
      let pageSummaries = [];

      for (const res of results) {
        if (res.leads.length > 0) {
          allNewLeads.push(...res.leads);
          const shortName = res.pageName.includes('Good Vibes')
            ? 'Good Vibes'
            : res.pageName.includes('ทาสีกัน')
              ? 'ทาสีกัน'
              : res.pageName.includes('RoomsPainting')
                ? 'RoomsPainting'
                : res.pageName.includes('ช่างหมี')
                  ? 'ช่างหมี'
                  : res.pageName;
          pageSummaries.push(`${shortName}: ${res.leads.length} แชท`);
        }
      }

      if (allNewLeads.length === 0) {
        if (!silent) alert('เชื่อมต่อสำเร็จ แต่ยังไม่มีบทสนทนาใหม่ใน Inbox ของเพจที่เชื่อมต่อครับ');
      } else {
        let hasNewUpdates = false;
        let newLeadsCount = 0;

        setLeads(prev => {
          const incomingMap = new Map(allNewLeads.map(l => [l.id, l]));

          // Update existing conversations with latest messages from Facebook
          const updatedExisting = prev.map(oldLead => {
            const incoming = incomingMap.get(oldLead.id);
            if (!incoming) return oldLead;
            incomingMap.delete(oldLead.id);

            const oldMsgCount = oldLead.messages?.length || 0;
            const newMsgCount = incoming.messages?.length || 0;
            if (newMsgCount > oldMsgCount) {
              hasNewUpdates = true;
            }

            return {
              ...oldLead,
              inquiry: incoming.inquiry || oldLead.inquiry,
              date: incoming.date || oldLead.date,
              timestamp: incoming.timestamp || oldLead.timestamp || (incoming.updatedTime ? new Date(incoming.updatedTime).getTime() : Date.now()),
              updatedTime: incoming.updatedTime || oldLead.updatedTime,
              lastActivity: incoming.lastActivity || incoming.timestamp || oldLead.lastActivity || oldLead.timestamp,
              unreadCount: incoming.unreadCount ?? oldLead.unreadCount,
              status: (incoming.unreadCount && incoming.unreadCount > 0) ? 'ทักใหม่ (New)' : oldLead.status,
              customerPsid: incoming.customerPsid || oldLead.customerPsid,
              activePageToken: incoming.activePageToken || oldLead.activePageToken,
              messages: (incoming.messages && incoming.messages.length > 0)
                ? incoming.messages
                : oldLead.messages
            };
          });

          // Brand new leads that were not in state yet
          const completelyNew = Array.from(incomingMap.values());
          newLeadsCount = completelyNew.length;
          if (newLeadsCount > 0) hasNewUpdates = true;

          const merged = [...completelyNew, ...updatedExisting];
          return sortLeadsByLatest(merged);
        });

        if (isSoundEnabled && (hasNewUpdates || !silent)) {
          playNotificationSound();
        }

        if (!silent || hasNewUpdates) {
          if (newLeadsCount > 0 && allNewLeads.length > 0) {
            setSelectedLeadId(allNewLeads[0].id);
          }
          setToastNotification(hasNewUpdates
            ? `🔔 มีข้อความใหม่เข้ามา! (${pageSummaries.join(', ')})`
            : `🎉 ซิงค์แชทสดสำเร็จ! รวม ${allNewLeads.length} แชทจริงจาก Facebook (${pageSummaries.join(', ')})`);
          setTimeout(() => setToastNotification(null), 5000);
        }
      }
    } catch (err) {
      if (!silent) alert(`ไม่สามารถดึงข้อมูลจาก Facebook API ได้: ${err.message}`);
    } finally {
      if (!silent) setIsSyncingFb(false);
    }
  };

  // Background Auto-sync effect (every 10 seconds in background)
  useEffect(() => {
    if (!isAutoSyncEnabled) return;
    const interval = setInterval(() => {
      handleSyncRealFacebook(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoSyncEnabled, facebookPages, isSoundEnabled]);

  // Initial background sync on mount (after 1.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSyncRealFacebook(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [isRealtimeWebhookActive, setIsRealtimeWebhookActive] = useState(false);

  // Subscribe to Instant 1-Second Real-Time Webhook Messages via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('live-facebook-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_facebook_messages' },
        (payload) => {
          const newRow = payload.new;
          if (!newRow) return;

          console.log('⚡ [1-Second Realtime Event Received]:', newRow);
          setIsRealtimeWebhookActive(true);

          const timeStr = new Date(newRow.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = new Date(newRow.created_at || Date.now()).toISOString().slice(0, 10);

          // Parse attachments if delivered via Webhook
          const rawAtts = Array.isArray(newRow.attachments) ? newRow.attachments : [];
          const parsedAtts = rawAtts.map(att => normalizeAttachment(att)).filter(Boolean);

          let displayText = newRow.message_text;
          if (!displayText || displayText.startsWith('(') || displayText.includes('ส่งไฟล์แนบ')) {
            if (parsedAtts.length > 0) {
              if (parsedAtts.some(a => a.isSticker)) displayText = '🏷️ สติกเกอร์';
              else if (parsedAtts.some(a => a.type === 'image')) displayText = '🖼️ รูปภาพ';
              else if (parsedAtts.some(a => a.type === 'video')) displayText = '🎥 วิดีโอ';
              else displayText = '📎 ไฟล์แนบ';
            }
          }

          const newIncomingMessage = {
            id: newRow.message_mid || `msg-${Date.now()}`,
            sender: 'lead',
            text: displayText,
            attachments: parsedAtts,
            time: timeStr
          };

          const isCommentEvent = !!newRow.raw_event?.isComment;
          const matchedPageName = newRow.raw_event?.pageName ||
            (newRow.page_id === REAL_GOOD_VIBES_PAGE_ID ? 'Good Vibes' :
              newRow.page_id === REAL_TAASEEGUN_PAGE_ID ? 'ทาสีกัน' :
                newRow.page_id === REAL_ROOMS_PAINTING_PAGE_ID ? 'RoomsPainting' :
                  newRow.page_id === REAL_TEXTURE_BEAR_PAGE_ID ? 'ช่างหมี เทกเจอร์' : 'เพจ Facebook');

          let isFound = false;

          setLeads((prev) => {
            const updated = prev.map((lead) => {
              const isMatch = (lead.customerPsid && lead.customerPsid === newRow.sender_psid) ||
                (lead.commentId && newRow.raw_event?.commentId && lead.commentId === newRow.raw_event.commentId) ||
                (lead.id && lead.id.includes(newRow.sender_psid)) ||
                (lead.name && newRow.sender_name && lead.name === newRow.sender_name);

              if (isMatch) {
                isFound = true;
                const existingMsgs = lead.messages || [];
                if (existingMsgs.some(m => m.id === newIncomingMessage.id || (m.text === newIncomingMessage.text && m.time === newIncomingMessage.time))) {
                  return lead;
                }
                const now = Date.now();
                return {
                  ...lead,
                  inquiry: displayText,
                  date: `${dateStr} ${timeStr}`,
                  timestamp: now,
                  lastActivity: now,
                  updatedTime: new Date(now).toISOString(),
                  status: 'ทักใหม่ (New)',
                  customerPsid: newRow.sender_psid,
                  commentId: newRow.raw_event?.commentId || lead.commentId,
                  postId: newRow.raw_event?.postId || lead.postId,
                  sourceType: isCommentEvent ? 'post_comment' : lead.sourceType,
                  sourceTitle: isCommentEvent ? (newRow.raw_event?.postTitle || 'คอมเมนต์ใต้โพสต์') : lead.sourceTitle,
                  messages: [...existingMsgs, newIncomingMessage]
                };
              }
              return lead;
            });

            if (!isFound) {
              const now = Date.now();
              const brandNewLead = {
                id: isCommentEvent ? `fb-comment-${newRow.raw_event?.commentId || now}` : `fb-live-${newRow.sender_psid}`,
                name: newRow.sender_name || (isCommentEvent ? 'ลูกค้าใต้โพสต์' : `ลูกค้าใหม่ Facebook #${newRow.sender_psid.slice(-4)}`),
                platform: 'facebook',
                channel: newRow.page_id,
                channelName: matchedPageName,
                sourceType: isCommentEvent ? 'post_comment' : 'inbox',
                sourceTitle: isCommentEvent ? (newRow.raw_event?.postTitle || 'คอมเมนต์ใต้โพสต์') : 'Messenger Inbox (Live 1s)',
                sourceLink: isCommentEvent
                  ? `https://www.facebook.com/${newRow.raw_event?.postId || newRow.page_id}`
                  : `https://www.facebook.com/${newRow.page_id}/inbox/`,
                contact: isCommentEvent ? 'คอมเมนต์ใต้โพสต์ Facebook' : 'Facebook Messenger',
                inquiry: newRow.message_text,
                dealValue: 0,
                status: 'ทักใหม่ (New)',
                date: `${dateStr} ${timeStr}`,
                timestamp: now,
                lastActivity: now,
                updatedTime: new Date(now).toISOString(),
                followUpDate: null,
                admin: 'แอดมินเพจ',
                notes: isCommentEvent
                  ? `คอมเมนต์สดใต้โพสต์ (${newRow.raw_event?.commentId || ''}) เพจ ${matchedPageName}`
                  : `ทักสดผ่าน Webhook จากเพจ ${matchedPageName}`,
                isLiveFacebookLead: true,
                unreadCount: 1,
                tag: isCommentEvent ? '📝 คอมเมนต์ใต้โพสต์' : '⚡ ลูกค้าใหม่สดๆ 1 วิ',
                customerPsid: newRow.sender_psid,
                commentId: newRow.raw_event?.commentId || null,
                postId: newRow.raw_event?.postId || null,
                messages: [newIncomingMessage]
              };
              return sortLeadsByLatest([brandNewLead, ...updated]);
            }

            return sortLeadsByLatest(updated);
          });

          if (isSoundEnabled) {
            playNotificationSound();
          }

          setToastNotification(isCommentEvent
            ? `💬 [คอมเมนต์สดใต้โพสต์] จาก "${newRow.sender_name}" (${matchedPageName}): "${newRow.message_text}"`
            : `⚡ [สด 1 วินาที] ข้อความใหม่จาก "${newRow.sender_name || 'ลูกค้า'}" (${matchedPageName}): "${newRow.message_text}"`);
          setTimeout(() => setToastNotification(null), 6000);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeWebhookActive(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSoundEnabled]);

  const chatMessagesContainerRef = useRef(null);

  // Default active lead selection
  const activeLead = leads.find(l => l.id === selectedLeadId) || leads[0];
  const activeTheme = getPageTheme(activeLead?.channel);

  // Auto scroll to bottom of chat messages container ONLY (without scrolling the browser window)
  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [activeLead?.messages, activeLead?.id]);

  // Auto-expand chat input textarea to show 4-5 lines comfortably and adjust smoothly
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      const targetMin = isMobile ? 80 : 105;
      const scrollH = chatInputRef.current.scrollHeight;
      const newHeight = Math.max(targetMin, Math.min(scrollH, 220));
      chatInputRef.current.style.height = `${newHeight}px`;
    }
  }, [replyText, isMobile]);

  // Check if a lead has follow-up due
  const isFollowUpDue = (followUpDate) => {
    if (!followUpDate) return false;
    const target = new Date(followUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target <= today;
  };

  // Helper to determine if a conversation has been replied to (our team/admin answered last)
  const isLeadReplied = (lead) => {
    if (!lead) return false;
    const msgs = lead.messages;
    if (msgs && msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      return lastMsg.sender === 'admin';
    }
    // If no message thread yet, inquiry was initiated by customer => unreplied
    return false;
  };

  // Filter conversations and sort so the TRULY latest activity is on top across all pages
  const filteredConversations = sortLeadsByLatest(
    leads.filter(lead => {
      const matchesSearch =
        (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.inquiry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.sourceTitle && lead.sourceTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesType = true;
      if (filterType === 'due_followup') {
        matchesType = isFollowUpDue(lead.followUpDate) || detectFollowUpStatus(lead).needsFollowUp;
      } else if (filterType === 'unreplied') {
        matchesType = !isLeadReplied(lead);
      } else if (filterType === 'replied') {
        matchesType = isLeadReplied(lead);
      } else if (filterType !== 'all') {
        matchesType = lead.sourceType === filterType;
      }

      const matchesChannel = filterChannel === 'all' || (filterChannel === 'all-fb' ? lead.platform === 'facebook' : lead.channel === filterChannel);

      return matchesSearch && matchesType && matchesChannel;
    })
  );

  // Intent analysis of current active lead
  const currentIntent = activeLead ? analyzeMessageIntent(
    activeLead.messages && activeLead.messages.length > 0
      ? activeLead.messages[activeLead.messages.length - 1].text
      : activeLead.inquiry
  ) : null;

  // AI Intelligence: TL;DR Summary, Deal Closing Score (0-100%), and Smart Follow-Up
  const activeChatSummary = useMemo(() => activeLead ? generateChatSummary(activeLead) : '', [activeLead]);
  const activeClosingScore = useMemo(() => activeLead ? analyzeClosingScore(activeLead) : null, [activeLead]);
  const activeFollowUp = useMemo(() => activeLead ? detectFollowUpStatus(activeLead) : null, [activeLead]);

  const handleApplyFollowUpTemplate = (templateText) => {
    setReplyText(templateText);
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };

  const handleDismissFollowUp = (leadId) => {
    setDismissedFollowUps(prev => ({ ...prev, [leadId]: true }));
  };

  // Handle Send Message & Attachments (Supports Multiple Photos/Files)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!replyText.trim() && selectedAttachments.length === 0) || !activeLead) return;

    const messageTextToSend = replyText.trim();
    const attachmentsToSend = [...selectedAttachments];

    // Build optimistic attachments array for immediate UI render
    const optimisticAttachments = attachmentsToSend.map((att, idx) => ({
      id: `att-admin-${Date.now()}-${idx}`,
      type: att.type,
      name: att.name,
      size: att.size,
      url: att.previewUrl || (att.file ? URL.createObjectURL(att.file) : null),
      previewUrl: att.previewUrl || (att.file ? URL.createObjectURL(att.file) : null)
    }));

    let displayMsgText = messageTextToSend;
    if (!displayMsgText && optimisticAttachments.length > 0) {
      displayMsgText = optimisticAttachments.length === 1
        ? (optimisticAttachments[0].type === 'image' ? '🖼️ รูปภาพ' : '📎 ไฟล์แนบ')
        : `🖼️ รูปภาพแนบ (${optimisticAttachments.length} รูป)`;
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: displayMsgText,
      attachments: optimisticAttachments,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      adminName: activeAdminName,
      isCommentReply: replyMode === 'comment'
    };

    const now = Date.now();
    const pad = (n) => String(n).padStart(2, '0');
    const d = new Date(now);
    const localDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const updatedLeads = leads.map(lead => {
      if (lead.id === activeLead.id) {
        const existingMessages = lead.messages || [];
        const nextStatus = lead.status.includes('New') || lead.status.includes('ทักใหม่')
          ? 'ติดต่อกลับแล้ว (Contacted)'
          : lead.status;

        return {
          ...lead,
          status: nextStatus,
          inquiry: displayMsgText || lead.inquiry,
          date: localDateStr,
          timestamp: now,
          lastActivity: now,
          updatedTime: new Date(now).toISOString(),
          messages: [...existingMessages, newMessage]
        };
      }
      return lead;
    });

    setLeads(sortLeadsByLatest(updatedLeads));
    setReplyText('');
    handleClearAllAttachments();

    // If real live Facebook lead, deliver each attachment via Facebook Graph API
    const pageToken = activeLead.activePageToken ||
      (activeLead.channel === REAL_GOOD_VIBES_PAGE_ID ? REAL_GOOD_VIBES_TOKEN :
        activeLead.channel === REAL_TAASEEGUN_PAGE_ID ? REAL_TAASEEGUN_TOKEN :
          activeLead.channel === REAL_ROOMS_PAINTING_PAGE_ID ? REAL_ROOMS_PAINTING_TOKEN :
            activeLead.channel === REAL_TEXTURE_BEAR_PAGE_ID ? REAL_TEXTURE_BEAR_TOKEN : null);

    if (pageToken) {
      setIsSendingAttachment(true);
      try {
        if (activeLead.sourceType === 'post_comment' && activeLead.commentId) {
          if (attachmentsToSend.length > 0 && attachmentsToSend[0]?.file) {
            // Reply under comment with 1st photo
            await replyToFacebookCommentWithAttachment(pageToken, activeLead.commentId, attachmentsToSend[0].file, messageTextToSend);
            setToastNotification(`✅ ตอบกลับพร้อมแนบรูปภาพใต้คอมเมนต์ของ "${activeLead.name}" สำเร็จ!`);
          } else {
            if (replyMode === 'comment') {
              // 1. Reply publicly under the Facebook Post Comment
              await replyToFacebookComment(pageToken, activeLead.commentId, messageTextToSend);
              setToastNotification(`✅ ตอบกลับใต้คอมเมนต์ของ "${activeLead.name}" หน้าเพจสำเร็จแล้ว!`);
            } else {
              // 2. Reply privately into customer's Messenger Inbox from the comment
              await sendFacebookPrivateReply(pageToken, activeLead.commentId, messageTextToSend);
              setToastNotification(`✅ ส่งข้อความส่วนตัวเข้า Inbox ของ "${activeLead.name}" สำเร็จ!`);
            }
          }
        } else if (activeLead.customerPsid && replyMode === 'inbox') {
          // 3. Regular Messenger Inbox reply - Send all photos sequentially
          const filesToSend = attachmentsToSend.filter(a => a.file);
          if (filesToSend.length > 0) {
            const isAllImages = filesToSend.every(f => f.file?.type?.startsWith('image/'));
            for (let i = 0; i < filesToSend.length; i++) {
              setSendingProgress({ current: i + 1, total: filesToSend.length });
              const itemTypeLabel = filesToSend[i].file?.type?.startsWith('image/')
                ? 'รูปภาพ'
                : (filesToSend[i].file?.type === 'application/pdf' ? 'ไฟล์ PDF' : 'ไฟล์เอกสาร');
              setToastNotification(`🚀 กำลังส่ง${itemTypeLabel} (${i + 1}/${filesToSend.length}) เข้า Facebook Messenger...`);
              await sendFacebookAttachment(pageToken, activeLead.customerPsid, filesToSend[i].file);
            }
            // If admin also entered text, send text message as well
            if (messageTextToSend) {
              await sendFacebookMessengerReply(pageToken, activeLead.customerPsid, messageTextToSend);
            }
            const successLabel = isAllImages
              ? `รูปภาพ ${filesToSend.length} รูป`
              : `ไฟล์แนบ ${filesToSend.length} รายการ`;
            setToastNotification(`✅ ส่ง${successLabel}ตรงเข้า Facebook Messenger ของ "${activeLead.name}" สำเร็จเรียบร้อย!`);
          } else {
            await sendFacebookMessengerReply(pageToken, activeLead.customerPsid, messageTextToSend);
            setToastNotification(`✅ ส่งข้อความตรงเข้า Facebook Messenger ของ "${activeLead.name}" สำเร็จ!`);
          }
        }
        setTimeout(() => setToastNotification(null), 5000);
      } catch (sendErr) {
        console.warn('Facebook reply warning:', sendErr);
        setToastNotification(`บันทึกในระบบแล้ว (หมายเหตุ Facebook: ${sendErr.message || 'ส่งผ่าน API ไม่สำเร็จ'})`);
        setTimeout(() => setToastNotification(null), 6000);
      } finally {
        setIsSendingAttachment(false);
        setSendingProgress(null);
      }
    }

    // Schedule background sync 3 seconds after sending to immediately pull any incoming response
    setTimeout(() => {
      handleSyncRealFacebook(true);
    }, 3000);
  };

  // AI Smart Draft Reply Generator
  const handleGenerateAiDraft = () => {
    if (!activeLead) return;
    setIsAiGenerating(true);
    setTimeout(() => {
      const draft = generateAIDraftReply(activeLead);
      setReplyText(draft);
      setIsAiGenerating(false);
    }, 400);
  };

  // Quick Reply Template inserter
  const handleApplyQuickReply = (text) => {
    setReplyText(prev => prev ? `${prev} ${text}` : text);
  };

  // Set Follow-up Date Helper
  const handleSetFollowUpDays = (days) => {
    if (!activeLead) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const dateStr = targetDate.toISOString().slice(0, 10);
    handleUpdateLeadField('followUpDate', dateStr);
    setToastNotification(`ตั้งเตือนติดตามผลกับ "${activeLead.name}" วันที่ ${dateStr} เรียบร้อยแล้ว`);
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Update Lead Field
  const handleUpdateLeadField = (field, value) => {
    if (!activeLead) return;
    setLeads(prev => prev.map(l => l.id === activeLead.id ? { ...l, [field]: value } : l));
  };

  // Client-side customer avatar photo upload with lightweight compression
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeLead) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        handleUpdateLeadField('avatar', dataUrl);
        setToastNotification(`📷 อัปเดตรูปโปรไฟล์ของ "${activeLead.name}" เรียบร้อยแล้ว`);
        setTimeout(() => setToastNotification(null), 3000);
        setIsAvatarModalOpen(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Simulate incoming live customer message / comment (DEMO LIVE TEST)
  const handleSimulateIncomingMessage = () => {
    const mockInbounds = [
      {
        name: 'คุณพัชรินทร์ (เจ้าของแบรนด์ Beauty)',
        platform: 'facebook',
        channel: 'fb-page-1',
        channelName: 'FB: เพจหลัก Tech & Lifestyle',
        sourceType: 'inbox',
        sourceTitle: 'Messenger แชทสด',
        contact: '087-999-1234 / Line: patcha_brand',
        inquiry: 'สวัสดีค่ะ สนใจลงโฆษณาคลิป YouTube เดือนหน้า มีแพ็กเกจรวมโพสต์เพจด้วยไหมคะ ขอเรทการ์ดด่วนค่ะ',
        tag: 'Sponsorship / Media',
        dealValue: 50000
      },
      {
        name: 'คุณธนกร',
        platform: 'facebook',
        channel: 'fb-page-2',
        channelName: 'FB: เพจรีวิว Gadget Review',
        sourceType: 'video_comment',
        sourceTitle: 'คลิป Reels: แกะกล่องเคสกันกระแทกไทเทเนียม',
        contact: 'FB Profile: Thanakorn K.',
        inquiry: 'คอมเมนต์ใต้ Reels: ตัวในคลิปราคาเท่าไหร่ครับ มีของพร้อมส่งไหม ขอพิกัดสั่งซื้อหน่อยครับ',
        tag: 'Product Inquiry',
        dealValue: 1490
      }
    ];

    const pick = mockInbounds[Math.floor(Math.random() * mockInbounds.length)];
    const newId = `lead-sim-${Date.now()}`;
    const newLead = {
      ...pick,
      id: newId,
      status: 'ทักใหม่ (New)',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      admin: 'ยังไม่ได้มอบหมาย',
      notes: 'ลูกค้าทักเข้ามาสดๆ ผ่านระบบ Realtime',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          text: pick.inquiry,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isComment: pick.sourceType === 'video_comment'
        }
      ]
    };

    // Play chime sound if enabled
    if (isSoundEnabled) {
      playNotificationSound();
    }

    setToastNotification(`🔔 มีข้อความใหม่จาก ${newLead.name} (${newLead.channelName})`);
    setTimeout(() => setToastNotification(null), 4000);

    // If auto-pilot enabled, reply automatically after 1 second!
    if (isAutoPilotEnabled) {
      setTimeout(() => {
        const autoReply = generateAIDraftReply(newLead);
        newLead.messages.push({
          id: `msg-auto-${Date.now()}`,
          sender: 'admin',
          text: autoReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          adminName: '🤖 AI Auto-Pilot',
          isCommentReply: newLead.sourceType === 'video_comment'
        });
        newLead.status = 'ติดต่อกลับแล้ว (Contacted)';
        newLead.notes += ' | AI Auto-Pilot ตอบกลับเรียบร้อยแล้ว';
        setLeads(prev => [newLead, ...prev]);
        setSelectedLeadId(newId);
        if (isSoundEnabled) playNotificationSound();
      }, 1000);
    } else {
      setLeads(prev => [newLead, ...prev]);
      setSelectedLeadId(newId);
    }
  };

  // Helper for source type badge
  const renderSourceTypeBadge = (sourceType) => {
    if (sourceType === 'inbox') {
      return (
        <span style={{ fontSize: '0.72rem', color: '#1877f2', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <MessageSquare size={12} /> Inbox แชท
        </span>
      );
    }
    if (sourceType === 'video_comment') {
      return (
        <span style={{ fontSize: '0.72rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Video size={12} /> คอมเมนต์ใต้คลิป
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.72rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <FileText size={12} /> คอมเมนต์หน้าเพจ
      </span>
    );
  };

  // Smart Follow-Up count (due date reached or customer silent > 18h)
  const dueFollowUpsCount = useMemo(() => {
    return leads.filter(l => {
      const matchesChannel = filterChannel === 'all' || (filterChannel === 'all-fb' ? l.platform === 'facebook' : l.channel === filterChannel);
      return matchesChannel && (isFollowUpDue(l.followUpDate) || detectFollowUpStatus(l).needsFollowUp);
    }).length;
  }, [leads, filterChannel]);

  // Counts of unreplied vs replied conversations (respecting current channel filter)
  const unrepliedCount = useMemo(() => {
    return leads.filter(l => {
      const matchesChannel = filterChannel === 'all' || (filterChannel === 'all-fb' ? l.platform === 'facebook' : l.channel === filterChannel);
      return matchesChannel && !isLeadReplied(l);
    }).length;
  }, [leads, filterChannel]);

  const repliedCount = useMemo(() => {
    return leads.filter(l => {
      const matchesChannel = filterChannel === 'all' || (filterChannel === 'all-fb' ? l.platform === 'facebook' : l.channel === filterChannel);
      return matchesChannel && isLeadReplied(l);
    }).length;
  }, [leads, filterChannel]);

  return (
    <div className="animate-fade-in chat-center-root" style={{ position: 'relative' }}>
      {/* Toast Notification Alert */}
      {toastNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 1000,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-xl)',
          fontWeight: '600',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid #334155'
        }}>
          <Bell size={18} color="#f59e0b" />
          <span>{typeof toastNotification === 'object' && toastNotification !== null ? `${toastNotification.title || ''} ${toastNotification.message || ''}` : toastNotification}</span>
        </div>
      )}

      {/* Sleek, Slim Top Status Bar for Live Chat Center */}
      <div
        className={isMobile && mobileTab !== 'list' ? 'mobile-hide' : ''}
        style={{
          display: (isMobile && mobileTab !== 'list') ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '5px 12px',
          marginBottom: '8px',
          flexWrap: 'wrap',
          gap: '8px',
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            fontWeight: '700',
            fontSize: '0.78rem',
            color: '#15803d',
            backgroundColor: '#f0fdf4',
            padding: '3px 8px',
            borderRadius: '999px',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span className="live-dot"></span> ออนไลน์สด
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setIsSoundEnabled(!isSoundEnabled);
              if (!isSoundEnabled) playNotificationSound();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '999px',
              backgroundColor: isSoundEnabled ? '#eff6ff' : '#f8fafc',
              color: isSoundEnabled ? '#1d4ed8' : '#64748b',
              fontSize: '0.74rem',
              fontWeight: '600',
              border: isSoundEnabled ? '1px solid #bfdbfe' : '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
            title="เปิด/ปิดเสียงแจ้งเตือนเมื่อมีลูกค้าทักเข้ามา"
          >
            {isSoundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{isSoundEnabled ? 'เปิดเสียง' : 'ปิดเสียง'}</span>
          </button>

          {/* AI Auto-Pilot Mode Toggle */}
          <button
            onClick={() => setIsAutoPilotEnabled(!isAutoPilotEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '999px',
              backgroundColor: isAutoPilotEnabled ? '#ecfdf5' : '#f8fafc',
              color: isAutoPilotEnabled ? '#059669' : '#64748b',
              fontSize: '0.74rem',
              fontWeight: '600',
              border: isAutoPilotEnabled ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
            title="เมื่อเปิดใช้งาน AI จะตอบข้อความแรกให้ลูกค้าทันทีใน 1 วินาที"
          >
            <Bot size={13} />
            <span>AI ตอบสด: {isAutoPilotEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Live Sync Real Facebook & Auto Sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handleSyncRealFacebook(false)}
            disabled={isSyncingFb}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 11px',
              borderRadius: '999px',
              backgroundColor: '#1877f2',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '700',
              border: 'none',
              boxShadow: '0 1px 3px rgba(24, 119, 242, 0.25)',
              cursor: isSyncingFb ? 'not-allowed' : 'pointer',
              opacity: isSyncingFb ? 0.75 : 1
            }}
            title="ดึงข้อความจริงล่าสุดจาก Inbox ทุกเพจ Facebook ที่เชื่อมต่อไว้"
          >
            <RefreshCw size={13} className={isSyncingFb ? "animate-spin" : ""} />
            <span>{isSyncingFb ? 'กำลังดึง...' : 'ดึงแชทสด 4 เพจ'}</span>
          </button>

          {/* Auto-Sync Toggle Button */}
          <button
            onClick={() => {
              const nextState = !isAutoSyncEnabled;
              setIsAutoSyncEnabled(nextState);
              if (nextState) {
                setToastNotification('🟢 เปิดระบบ Auto-Sync: คอยดึงแชทใหม่อัตโนมัติทุก 10 วินาที');
                setTimeout(() => setToastNotification(null), 4000);
              } else {
                setToastNotification('⚪ ปิดระบบ Auto-Sync เรียบร้อย');
                setTimeout(() => setToastNotification(null), 3000);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 9px',
              borderRadius: '999px',
              backgroundColor: isAutoSyncEnabled ? '#ecfdf5' : '#f8fafc',
              color: isAutoSyncEnabled ? '#059669' : '#64748b',
              fontSize: '0.73rem',
              fontWeight: '600',
              border: isAutoSyncEnabled ? '1px solid #86efac' : '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
            title="เปิด/ปิดการเช็กแชทใหม่ให้อัตโนมัติทุก 10 วินาทีในพื้นหลัง"
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isAutoSyncEnabled ? '#10b981' : '#94a3b8',
              display: 'inline-block'
            }} />
            <span>Auto-Sync 10s</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Chat Grid */}
      <div
        className="chat-grid-container"
        style={{
          display: isMobile ? 'flex' : 'grid',
          gridTemplateColumns: isMobile ? 'none' : (isRightPaneOpen ? '320px 1fr 280px' : '320px 1fr'),
          flexDirection: isMobile ? 'column' : 'initial',
          flex: 1,
          minHeight: 0,
          height: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* ============================================================== */}
        {/* 1. LEFT PANE: CONVERSATION LIST                                 */}
        {/* ============================================================== */}
        <div
          className={`chat-pane-left ${isMobile && mobileTab !== 'list' ? 'mobile-hide' : 'mobile-show'}`}
          style={{
            borderRight: isMobile ? 'none' : '1px solid #e2e8f0',
            display: (isMobile && mobileTab !== 'list') ? 'none' : 'flex',
            flexDirection: 'column',
            backgroundColor: '#f8fafc',
            height: '100%',
            width: isMobile ? '100%' : 'auto',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {/* Header & Filters */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                รวมแชทและคอมเมนต์
              </h3>
              <span style={{
                fontSize: '0.74rem',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                {filteredConversations.length} รายการ
              </span>
            </div>

            {/* Page Filter Tabs (5 buttons with clean wrap) */}
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '8px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              paddingBottom: '2px',
              flexShrink: 0
            }}>
              <button
                onClick={() => setFilterChannel('all')}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === 'all' ? '700' : '500',
                  backgroundColor: filterChannel === 'all' ? '#0f172a' : '#f1f5f9',
                  color: filterChannel === 'all' ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ทุกเพจ
              </button>
              <button
                onClick={() => setFilterChannel(REAL_GOOD_VIBES_PAGE_ID)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === REAL_GOOD_VIBES_PAGE_ID ? '700' : '500',
                  backgroundColor: filterChannel === REAL_GOOD_VIBES_PAGE_ID ? '#1877f2' : '#f1f5f9',
                  color: filterChannel === REAL_GOOD_VIBES_PAGE_ID ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Good Vibes Texture"
              >
                🎨 Good Vibes
              </button>
              <button
                onClick={() => setFilterChannel(REAL_TAASEEGUN_PAGE_ID)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === REAL_TAASEEGUN_PAGE_ID ? '700' : '500',
                  backgroundColor: filterChannel === REAL_TAASEEGUN_PAGE_ID ? '#d97706' : '#f1f5f9',
                  color: filterChannel === REAL_TAASEEGUN_PAGE_ID ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="บริษัท ทาสีกัน จำกัด"
              >
                🏠 ทาสีกัน
              </button>
              <button
                onClick={() => setFilterChannel(REAL_ROOMS_PAINTING_PAGE_ID)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === REAL_ROOMS_PAINTING_PAGE_ID ? '700' : '500',
                  backgroundColor: filterChannel === REAL_ROOMS_PAINTING_PAGE_ID ? '#7c3aed' : '#f1f5f9',
                  color: filterChannel === REAL_ROOMS_PAINTING_PAGE_ID ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="ทาสีคอนโด RoomsPainting"
              >
                🏢 RoomsPainting
              </button>
              <button
                onClick={() => setFilterChannel(REAL_TEXTURE_BEAR_PAGE_ID)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: filterChannel === REAL_TEXTURE_BEAR_PAGE_ID ? '700' : '500',
                  backgroundColor: filterChannel === REAL_TEXTURE_BEAR_PAGE_ID ? '#ea580c' : '#f1f5f9',
                  color: filterChannel === REAL_TEXTURE_BEAR_PAGE_ID ? '#ffffff' : '#64748b',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="รับทำสีเทกเจอร์ by ช่างหมี"
              >
                🐻 ช่างหมี
              </button>
            </div>

            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '6px 10px',
              marginBottom: '8px'
            }}>
              <Search size={14} color="#94a3b8" style={{ marginRight: '6px' }} />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, ข้อความ, คลิป..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.8rem',
                  width: '100%',
                  color: '#1e293b'
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              <button
                onClick={() => setFilterType('all')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'all' ? '700' : '500',
                  backgroundColor: filterType === 'all' ? '#0f172a' : '#ffffff',
                  color: filterType === 'all' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterType('unreplied')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'unreplied' ? '800' : '600',
                  backgroundColor: filterType === 'unreplied' ? '#dc2626' : (unrepliedCount > 0 ? '#fef2f2' : '#ffffff'),
                  color: filterType === 'unreplied' ? '#ffffff' : (unrepliedCount > 0 ? '#dc2626' : '#64748b'),
                  border: filterType === 'unreplied' ? '1px solid #dc2626' : '1px solid #fecaca',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="กรองดูเฉพาะข้อความที่ยังไม่ได้ตอบลูกค้า"
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: filterType === 'unreplied' ? '#ffffff' : '#ef4444'
                }} />
                รอตอบ ({unrepliedCount})
              </button>
              <button
                onClick={() => setFilterType('replied')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'replied' ? '800' : '500',
                  backgroundColor: filterType === 'replied' ? '#16a34a' : '#ffffff',
                  color: filterType === 'replied' ? '#ffffff' : '#16a34a',
                  border: filterType === 'replied' ? '1px solid #16a34a' : '1px solid #bbf7d0',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="กรองดูแชทที่ตอบกลับแล้ว"
              >
                <Check size={11} strokeWidth={3} /> ตอบแล้ว ({repliedCount})
              </button>
              <button
                onClick={() => setFilterType('due_followup')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'due_followup' ? '700' : '500',
                  backgroundColor: filterType === 'due_followup' ? '#ea580c' : '#ffffff',
                  color: filterType === 'due_followup' ? '#ffffff' : '#ea580c',
                  border: filterType === 'due_followup' ? '1px solid #ea580c' : '1px solid #fed7aa',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="กรองแชทที่ถึงเวลาต้องติดตาม หรือลูกค้าเงียบไปเกิน 18 ชม."
              >
                ⏰ ต้องตาม ({dueFollowUpsCount})
              </button>
              <button
                onClick={() => setFilterType('video_comment')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'video_comment' ? '700' : '500',
                  backgroundColor: filterType === 'video_comment' ? '#f59e0b' : '#ffffff',
                  color: filterType === 'video_comment' ? '#ffffff' : '#b45309',
                  border: '1px solid #fde68a',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                🎬 ใต้คลิป
              </button>
              <button
                onClick={() => setFilterType('inbox')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: filterType === 'inbox' ? '700' : '500',
                  backgroundColor: filterType === 'inbox' ? '#1877f2' : '#ffffff',
                  color: filterType === 'inbox' ? '#ffffff' : '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                📥 Inbox
              </button>
            </div>
          </div>

          {/* Scrollable Conversation List */}
          <div
            className="scrollable-pane"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain'
            }}
          >
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                <div style={{ marginBottom: '8px', color: '#64748b' }}>
                  {isSyncingFb ? '🔄 กำลังดึงแชทสดจาก Facebook ทุกเพจ...' : 'ไม่พบบทสนทนาที่ตรงกัน'}
                </div>
                {filterChannel !== 'all' && (
                  <button
                    onClick={() => setFilterChannel('all')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer'
                    }}
                  >
                    กดดูแชททุกเพจ
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map(lead => {
                const isSelected = lead.id === activeLead?.id;
                const isReplied = isLeadReplied(lead);
                const hasDueFollowUp = isFollowUpDue(lead.followUpDate);
                const closingInfo = analyzeClosingScore(lead);
                const followUpInfo = detectFollowUpStatus(lead);
                const isFollowUpNeeded = hasDueFollowUp || followUpInfo.needsFollowUp;
                const lastMsgObj = lead.messages && lead.messages.length > 0
                  ? lead.messages[lead.messages.length - 1]
                  : null;
                let lastMsg = lastMsgObj ? lastMsgObj.text : lead.inquiry;
                if (lastMsgObj && lastMsgObj.attachments?.length > 0 && (!lastMsg || lastMsg.startsWith('(') || lastMsg.includes('ไฟล์แนบ') || lastMsg.includes('รูปภาพ'))) {
                  const firstAtt = lastMsgObj.attachments[0];
                  lastMsg = firstAtt.isSticker ? '🏷️ [สติกเกอร์]' : (firstAtt.type === 'image' ? '🖼️ [ส่งรูปภาพ]' : (firstAtt.type === 'video' ? '🎥 [ส่งวิดีโอ]' : '📎 [ส่งไฟล์แนบ]'));
                } else if (!lastMsg && lead.inquiry) {
                  lastMsg = lead.inquiry;
                }
                if (typeof lastMsg === 'string' && (lastMsg === '(ไฟล์แนบ / สติกเกอร์)' || lastMsg === '(ส่งไฟล์แนบ/รูปภาพ)')) {
                  lastMsg = '🖼️ [ส่งรูปภาพ / สติกเกอร์]';
                }
                const theme = getPageTheme(lead.channel);

                return (
                  <div
                    key={lead.id}
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      if (isMobile) setMobileTab('chat');
                    }}
                    style={{
                      padding: '10px 12px',
                      margin: '4px 6px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : (!isReplied ? '#ffffff' : '#fafafa'),
                      borderLeft: isSelected
                        ? '4px solid #1877f2'
                        : (isFollowUpNeeded
                          ? '4px solid #ea580c'
                          : (!isReplied
                            ? '4px solid #ef4444'
                            : '4px solid #10b981'
                          )),
                      borderTop: !isReplied && !isSelected ? '1px solid #fee2e2' : '1px solid #f1f5f9',
                      borderRight: !isReplied && !isSelected ? '1px solid #fee2e2' : '1px solid #f1f5f9',
                      borderBottom: !isReplied && !isSelected ? '1px solid #fee2e2' : '1px solid #f1f5f9',
                      boxShadow: isSelected
                        ? '0 2px 8px rgba(24, 119, 242, 0.15)'
                        : (!isReplied
                          ? '0 2px 6px rgba(239, 68, 68, 0.06)'
                          : '0 1px 2px rgba(0,0,0,0.02)'),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = !isReplied ? '#fef2f2' : '#f1f5f9';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = !isReplied ? '#ffffff' : '#fafafa';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Customer Photo Avatar with Reply Status Badge */}
                    <CustomerAvatar
                      lead={lead}
                      size={40}
                      showStatusBadge={true}
                      isReplied={isReplied}
                    />

                    {/* Card Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <div style={{
                          fontWeight: !isReplied || isSelected ? '800' : '700',
                          fontSize: '0.87rem',
                          color: isSelected ? '#1d4ed8' : (!isReplied ? '#0f172a' : '#334155'),
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {lead.name}
                        </div>
                        <span style={{
                          fontSize: '0.70rem',
                          color: !isReplied ? '#dc2626' : '#64748b',
                          fontWeight: !isReplied ? '700' : '500',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatConversationTime(lead)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                          fontWeight: '800',
                          border: `1px solid ${theme.badgeBorder}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          {theme.icon} {theme.shortName}
                        </span>

                        {/* PROMINENT REPLY STATUS BADGE */}
                        {!isReplied ? (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '1px 7px',
                            borderRadius: '999px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontWeight: '800',
                            border: '1px solid #fecaca',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 1px 2px rgba(220, 38, 38, 0.06)'
                          }}>
                            <span style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: '#ef4444'
                            }} />
                            รอตอบ
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '1px 7px',
                            borderRadius: '999px',
                            backgroundColor: '#f0fdf4',
                            color: '#16a34a',
                            fontWeight: '700',
                            border: '1px solid #bbf7d0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Check size={11} strokeWidth={3} /> ตอบแล้ว
                          </span>
                        )}

                        {/* FOLLOW-UP STATUS BADGE */}
                        {followUpInfo.needsFollowUp ? (
                          <span style={{
                            backgroundColor: followUpInfo.urgency === 'high' ? '#fef2f2' : '#fff7ed',
                            color: followUpInfo.urgency === 'high' ? '#dc2626' : '#c2410c',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            border: followUpInfo.urgency === 'high' ? '1px solid #fca5a5' : '1px solid #fed7aa',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            ⏰ เงียบ {followUpInfo.badgeText}
                          </span>
                        ) : hasDueFollowUp ? (
                          <span style={{
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            border: '1px solid #fca5a5'
                          }}>
                            ⏰ ตามวันนี้
                          </span>
                        ) : null}

                        {/* CLOSING PROBABILITY BADGE */}
                        {closingInfo && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            backgroundColor: closingInfo.score >= 75 ? '#fef2f2' : (closingInfo.score >= 45 ? '#fffbeb' : '#f0fdf4'),
                            color: closingInfo.color,
                            fontWeight: '800',
                            border: `1px solid ${closingInfo.color}40`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            marginLeft: 'auto'
                          }}
                          title={`โอกาสปิดการขาย ${closingInfo.score}% (${closingInfo.label})`}
                          >
                            {closingInfo.score >= 75 ? <Flame size={10} color="#ef4444" fill="#ef4444" /> : '⚡'}
                            {closingInfo.score}%
                          </span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '0.76rem',
                        color: !isReplied ? '#0f172a' : '#64748b',
                        fontWeight: !isReplied ? '700' : '400',
                        lineHeight: '1.3',
                        maxHeight: '32px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word'
                      }}>
                        {isReplied ? (
                          <span style={{ color: '#059669', fontWeight: '700', marginRight: '3px' }}>
                            ↩️ ตอบแล้ว:
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: '800', marginRight: '3px' }}>
                            💬 ลูกค้า:
                          </span>
                        )}
                        {lastMsg}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. MIDDLE PANE: LIVE CHAT & REPLY STREAM                        */}
        {/* ============================================================== */}
        <div
          className={`chat-pane-center ${isMobile && mobileTab !== 'chat' ? 'mobile-hide' : 'mobile-show'}`}
          style={{
            display: (isMobile && mobileTab !== 'chat') ? 'none' : 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            height: '100%',
            width: isMobile ? '100%' : 'auto',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {activeLead ? (
            <>
              {/* Active Chat Header */}
              <div style={{
                padding: '10px 14px',
                borderBottom: `2px solid ${activeTheme.cardBorder}`,
                borderTop: `3px solid ${activeTheme.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: activeTheme.bg,
                flexShrink: 0,
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  {isMobile && (
                    <button
                      onClick={() => setMobileTab('list')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: `1.5px solid ${activeTheme.cardBorder}`,
                        color: activeTheme.primary,
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      <ArrowLeft size={16} /> แชท
                    </button>
                  )}

                  {/* Active Customer Avatar (Clickable to change profile pic) */}
                  <div
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="คลิกเพื่อดูหรือเปลี่ยนรูปโปรไฟล์ลูกค้า"
                    style={{ cursor: 'pointer', flexShrink: 0, transition: 'transform 0.15s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <CustomerAvatar
                      lead={activeLead}
                      size={40}
                      border="1.5px solid #cbd5e1"
                    />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeLead.name}
                      </h3>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        backgroundColor: activeTheme.badgeBg,
                        color: activeTheme.badgeText,
                        fontWeight: '800',
                        border: `1px solid ${activeTheme.badgeBorder}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        whiteSpace: 'nowrap'
                      }}>
                        {activeTheme.icon} {activeTheme.shortName}
                      </span>

                      {/* AI Intent Badge */}
                      {currentIntent && (
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: '700',
                          color: currentIntent.badgeColor,
                          backgroundColor: `${currentIntent.badgeColor}15`,
                          padding: '1px 6px',
                          borderRadius: '999px',
                          border: `1px solid ${currentIntent.badgeColor}30`,
                          whiteSpace: 'nowrap'
                        }}>
                          {currentIntent.label}
                        </span>
                      )}
                    </div>

                    {activeLead.sourceTitle ? (
                      <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {renderSourceTypeBadge(activeLead.sourceType)}
                        <span style={{ color: '#334155', fontWeight: '600' }}>{activeLead.sourceTitle}</span>
                        {activeLead.sourceLink && (
                          <a href={activeLead.sourceLink} target="_blank" rel="noreferrer" style={{ color: '#1877f2' }}>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        {renderSourceTypeBadge(activeLead.sourceType || 'inbox')}
                        <span>บทสนทนา Messenger</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {/* Toggle Customer Info Panel Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isMobile) {
                        setMobileTab('profile');
                      } else {
                        setIsRightPaneOpen(!isRightPaneOpen);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 11px',
                      borderRadius: '8px',
                      backgroundColor: isRightPaneOpen ? '#eff6ff' : '#f8fafc',
                      color: isRightPaneOpen ? '#1d4ed8' : '#64748b',
                      border: isRightPaneOpen ? '1px solid #bfdbfe' : '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    title={isRightPaneOpen ? 'ซ่อนแผงข้อมูลลูกค้า' : 'แสดงแผงข้อมูลลูกค้า'}
                  >
                    <Info size={14} />
                    <span>{isRightPaneOpen ? 'ซ่อนข้อมูล' : 'ข้อมูลลูกค้า'}</span>
                  </button>
                  <select
                    value={activeLead.status}
                    onChange={(e) => handleUpdateLeadField('status', e.target.value)}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      maxWidth: isMobile ? '95px' : 'auto'
                    }}
                  >
                    {leadStatusOptions.filter(o => o.value !== 'all').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {isMobile && (
                    <button
                      onClick={() => setMobileTab('profile')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                      title="ดูข้อมูลลูกค้าและดีล"
                    >
                      <User size={13} /> ข้อมูล
                    </button>
                  )}
                </div>
              </div>

              {/* Option 2: AI Chat TL;DR Summary & Closing Probability Ribbon */}
              {activeLead && (
                <div style={{
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '7px 16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    {/* Left: AI Summary Pill & 1-Liner */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                      minWidth: '240px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        border: '1px solid #bfdbfe',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        <Sparkles size={12} color="#2563eb" />
                        AI สรุปงาน:
                      </span>
                      <span style={{
                        fontSize: '0.77rem',
                        color: '#334155',
                        fontWeight: '600',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                      title={activeChatSummary}
                      >
                        {activeChatSummary}
                      </span>
                    </div>

                    {/* Right: Closing Score Meter & Detail Toggle */}
                    {activeClosingScore && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0
                      }}>
                        {/* Closing Score Pill */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: activeClosingScore.score >= 75 ? '#fef2f2' : (activeClosingScore.score >= 45 ? '#fffbeb' : '#f0fdf4'),
                          border: `1.5px solid ${activeClosingScore.color}60`,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                        }}>
                          {activeClosingScore.score >= 75 ? (
                            <Flame size={13} color="#ef4444" fill="#ef4444" />
                          ) : (
                            <span style={{ fontSize: '0.76rem' }}>⚡</span>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              color: activeClosingScore.color
                            }}>
                              โอกาสปิดดีล: {activeClosingScore.score}%
                            </span>
                            <span style={{
                              fontSize: '0.68rem',
                              color: '#64748b',
                              fontWeight: '600'
                            }}>
                              ({activeClosingScore.tier})
                            </span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div style={{
                            width: '42px',
                            height: '6px',
                            borderRadius: '999px',
                            backgroundColor: '#e2e8f0',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${activeClosingScore.score}%`,
                              height: '100%',
                              backgroundColor: activeClosingScore.color,
                              borderRadius: '999px',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>

                        {/* Toggle Expand Button */}
                        <button
                          type="button"
                          onClick={() => setIsAiSummaryExpanded(!isAiSummaryExpanded)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: isAiSummaryExpanded ? '#f1f5f9' : '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            fontSize: '0.70rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                          title={isAiSummaryExpanded ? 'ย่อสรุป' : 'ดูสัญญาณซื้อและคำแนะนำ AI'}
                        >
                          {isAiSummaryExpanded ? (
                            <>ย่อ <ChevronUp size={12} /></>
                          ) : (
                            <>สัญญาณซื้อ <ChevronDown size={12} /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Drawer: Buying Signals & Recommended Next Action */}
                  {isAiSummaryExpanded && activeClosingScore && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px dashed #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      {/* Buying Signals */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: '700' }}>
                          🔍 สัญญาณซื้อที่ตรวจพบ:
                        </span>
                        {activeClosingScore.signals.length > 0 ? (
                          activeClosingScore.signals.map((sig, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#334155',
                                fontWeight: '600'
                              }}
                            >
                              {sig}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>ยังไม่พบสัญญาณซื้อเฉพาะเจาะจง</span>
                        )}
                      </div>

                      {/* Recommended Action */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #dbeafe',
                        fontSize: '0.73rem',
                        color: '#1e40af'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '800' }}>🎯 AI แนะนำขั้นตอนถัดไป:</span>
                          <span>{activeClosingScore.recommendedNextStep}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateAiDraft}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ✨ ให้ AI ร่างตอบทันที
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Context Alert if customer came from a Comment */}
              {(activeLead.sourceType === 'video_comment' || activeLead.sourceType === 'post_comment') && (
                <div style={{
                  backgroundColor: '#fffbeb',
                  borderBottom: '1px solid #fef3c7',
                  padding: '8px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#92400e' }}>
                    <AlertCircle size={15} color="#d97706" />
                    <span>
                      คอมเมนต์สอบถามใต้ {activeLead.sourceTitle || 'คลิป/โพสต์'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    backgroundColor: '#ffffff',
                    padding: '2px',
                    borderRadius: '6px',
                    border: '1px solid #fde68a',
                    fontSize: '0.72rem',
                    fontWeight: '600'
                  }}>
                    <button
                      onClick={() => setReplyMode('inbox')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: replyMode === 'inbox' ? '#1877f2' : 'transparent',
                        color: replyMode === 'inbox' ? '#ffffff' : '#475569'
                      }}
                    >
                      💬 ส่งเข้า Inbox ส่วนตัว
                    </button>
                    <button
                      onClick={() => setReplyMode('comment')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: replyMode === 'comment' ? '#d97706' : 'transparent',
                        color: replyMode === 'comment' ? '#ffffff' : '#475569'
                      }}
                    >
                      ↩️ ตอบใต้คอมเมนต์เดิม
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Messages Stream */}
              <div
                ref={chatMessagesContainerRef}
                className="scrollable-pane"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: '#fafafa'
                }}
              >
                {(!activeLead.messages || activeLead.messages.length === 0) && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px 14px 14px 2px',
                      padding: '12px 16px',
                      maxWidth: '80%',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', marginBottom: '3px' }}>
                        {activeLead.name}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: '1.45' }}>
                        {activeLead.inquiry}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                        {activeLead.date}
                      </div>
                    </div>
                  </div>
                )}

                {(activeLead.messages || []).map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id || idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        backgroundColor: isAdmin ? activeTheme.primary : '#ffffff',
                        color: isAdmin ? '#ffffff' : '#1e293b',
                        border: isAdmin ? 'none' : '1px solid #e2e8f0',
                        borderRadius: isAdmin ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        padding: '11px 15px',
                        maxWidth: '75%',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {/* Clean sender label - only show if human agent or customer */}
                        {(!isAdmin || (msg.adminName && !msg.adminName.includes('Good Vibes') && !msg.adminName.includes('ทาสีกัน') && !msg.adminName.includes('RoomsPainting') && !msg.adminName.includes('ช่างหมี') && msg.adminName !== 'แอดมินเพจ')) && (
                          <div style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: isAdmin ? 'rgba(255,255,255,0.85)' : '#64748b',
                            marginBottom: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>{isAdmin ? `👤 ${msg.adminName}` : activeLead.name}</span>
                            {msg.isComment && (
                              <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem' }}>
                                จากคอมเมนต์
                              </span>
                            )}
                            {msg.isCommentReply && (
                              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem' }}>
                                ตอบใต้คอมเมนต์
                              </span>
                            )}
                          </div>
                        )}

                        {/* Render Attachments (Images, Stickers, Videos, Documents) */}
                        {msg.attachments && msg.attachments.length > 0 && (() => {
                          const normalImages = msg.attachments.filter(a => a.type === 'image' && !a.isSticker);
                          const otherAtts = msg.attachments.filter(a => a.type !== 'image' || a.isSticker);

                          return (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              margin: (msg.text && !msg.text.startsWith('(') && msg.text !== '🖼️ รูปภาพ' && msg.text !== '🏷️ สติกเกอร์' && msg.text !== '📎 ไฟล์แนบ' && msg.text !== '🎥 วิดีโอ') ? '6px 0' : '2px 0'
                            }}>
                              {/* Multi-image album grid layout */}
                              {normalImages.length > 1 ? (
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: normalImages.length === 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(110px, 1fr))',
                                  gap: '5px',
                                  maxWidth: '320px',
                                  borderRadius: '10px',
                                  overflow: 'hidden'
                                }}>
                                  {normalImages.map((att, imgIdx) => (
                                    <div
                                      key={att.id || imgIdx}
                                      onClick={() => setSelectedImageModal({
                                        url: att.url || att.previewUrl,
                                        name: att.name || `รูปภาพที่ ${imgIdx + 1}`,
                                        date: msg.time,
                                        sender: isAdmin ? (msg.adminName || 'แอดมิน') : activeLead.name
                                      })}
                                      style={{
                                        position: 'relative',
                                        height: normalImages.length > 2 ? '105px' : '135px',
                                        backgroundColor: '#0f172a',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        borderRadius: '6px',
                                        border: isAdmin ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0'
                                      }}
                                      title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                                    >
                                      <img
                                        src={att.previewUrl || att.url}
                                        alt={att.name || 'รูปภาพ'}
                                        loading="lazy"
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          display: 'block',
                                          transition: 'transform 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                                      />
                                      <div style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        backgroundColor: 'rgba(0,0,0,0.65)',
                                        color: '#ffffff',
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        fontSize: '0.62rem',
                                        fontWeight: '700',
                                        backdropFilter: 'blur(3px)'
                                      }}>
                                        #{imgIdx + 1}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                normalImages.map((att, attIdx) => (
                                  <div
                                    key={att.id || attIdx}
                                    onClick={() => setSelectedImageModal({
                                      url: att.url || att.previewUrl,
                                      name: att.name || 'รูปภาพ',
                                      date: msg.time,
                                      sender: isAdmin ? (msg.adminName || 'แอดมิน') : activeLead.name
                                    })}
                                    style={{
                                      position: 'relative',
                                      borderRadius: '10px',
                                      overflow: 'hidden',
                                      cursor: 'pointer',
                                      maxWidth: '280px',
                                      maxHeight: '260px',
                                      backgroundColor: '#0f172a',
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                      border: isAdmin ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0'
                                    }}
                                    title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                                  >
                                    <img
                                      src={att.previewUrl || att.url}
                                      alt={att.name || 'รูปภาพแนบ'}
                                      loading="lazy"
                                      style={{
                                        width: '100%',
                                        maxHeight: '260px',
                                        objectFit: 'cover',
                                        display: 'block',
                                        transition: 'transform 0.2s ease'
                                      }}
                                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                                    />
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '6px',
                                      right: '6px',
                                      backgroundColor: 'rgba(0,0,0,0.65)',
                                      color: '#ffffff',
                                      padding: '2px 7px',
                                      borderRadius: '6px',
                                      fontSize: '0.68rem',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      backdropFilter: 'blur(4px)'
                                    }}>
                                      <Maximize2 size={11} /> ขยายรูป
                                    </div>
                                  </div>
                                ))
                              )}

                              {/* Other attachments (Stickers, Videos, Documents) */}
                              {otherAtts.map((att, attIdx) => {
                                if (att.type === 'image' && att.isSticker) {
                                  return (
                                    <img
                                      key={att.id || attIdx}
                                      src={att.previewUrl || att.url}
                                      alt="Sticker"
                                      style={{
                                        width: '105px',
                                        height: '105px',
                                        objectFit: 'contain',
                                        display: 'block'
                                      }}
                                    />
                                  );
                                }

                                if (att.type === 'video') {
                                  return (
                                    <video
                                      key={att.id || attIdx}
                                      src={att.url}
                                      controls
                                      style={{
                                        maxWidth: '280px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(0,0,0,0.1)'
                                      }}
                                    />
                                  );
                                }

                                // Document or generic file
                                return (
                                  <a
                                    key={att.id || attIdx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={att.name || 'document'}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px 12px',
                                      backgroundColor: isAdmin ? 'rgba(255,255,255,0.18)' : '#f8fafc',
                                      color: isAdmin ? '#ffffff' : '#0f172a',
                                      borderRadius: '8px',
                                      textDecoration: 'none',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      border: isAdmin ? '1px solid rgba(255,255,255,0.3)' : '1px solid #cbd5e1'
                                    }}
                                  >
                                    <FileText size={18} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {att.name || 'ดาวน์โหลดเอกสาร'}
                                      </div>
                                      {att.size && (
                                        <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>
                                          {(att.size / 1024).toFixed(0)} KB
                                        </div>
                                      )}
                                    </div>
                                    <Download size={14} />
                                  </a>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {/* Show text message if not just a placeholder */}
                        {msg.text && (
                          !msg.attachments ||
                          msg.attachments.length === 0 ||
                          (!msg.text.startsWith('(') && msg.text !== '🖼️ รูปภาพ' && msg.text !== '🏷️ สติกเกอร์' && msg.text !== '📎 ไฟล์แนบ' && msg.text !== '🎥 วิดีโอ')
                        ) && (
                            <div style={{ fontSize: '0.86rem', lineHeight: '1.45', wordBreak: 'break-word' }}>
                              {msg.text}
                            </div>
                          )}

                        <div style={{
                          fontSize: '0.68rem',
                          color: isAdmin ? '#dbeafe' : '#94a3b8',
                          textAlign: 'right',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '4px'
                        }}>
                          <span>{msg.time}</span>
                          {isAdmin && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Suggestion Bar & Quick Reply Bar */}
              <div style={{
                padding: '6px 14px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                flexShrink: 0
              }}>
                {/* AI Draft Button */}
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={isAiGenerating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    border: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
                  }}
                  title="ให้ AI วิเคราะห์คำถามและร่างคำตอบภาษาไทยให้อัตโนมัติ"
                >
                  <Sparkles size={13} className={isAiGenerating ? 'spin-anim' : ''} />
                  {isAiGenerating ? 'กำลังร่าง...' : '✨ AI ร่างคำตอบให้อัตโนมัติ'}
                </button>

                {/* Quick Portfolio & Color Catalog Button */}
                <button
                  type="button"
                  onClick={() => setIsPortfolioCatalogOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 11px',
                    borderRadius: '999px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    border: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                    cursor: 'pointer'
                  }}
                  title="เปิดคลังรูปตัวอย่างสีเทกเจอร์ ผลงานทาสีบ้านและคอนโด เพื่อส่งให้ลูกค้าทันที"
                >
                  <ImageIcon size={13} />
                  <span>🎨 คลังผลงานด่วน (Catalog)</span>
                </button>

                {/* Saved Replies Button (การตอบกลับที่บันทึกไว้) */}
                <button
                  type="button"
                  onClick={() => setIsSavedRepliesOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 11px',
                    borderRadius: '999px',
                    backgroundColor: '#1877f2',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    border: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)',
                    cursor: 'pointer'
                  }}
                  title="เปิดรายการตอบกลับที่บันทึกไว้ พร้อมรูปภาพและข้อความสำเร็จรูป"
                >
                  <MessageSquare size={13} />
                  <span>💬 การตอบกลับที่บันทึกไว้</span>
                </button>

                <span style={{ color: '#cbd5e1' }}>|</span>

                {quickReplyTemplates.map(qr => (
                  <button
                    key={qr.id}
                    onClick={() => handleApplyQuickReply(qr.text)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: '999px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.73rem',
                      color: '#334155',
                      whiteSpace: 'nowrap',
                      fontWeight: '500'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    {qr.title}
                  </button>
                ))}
              </div>

              {/* Message Composer Form */}
              <form onSubmit={handleSendMessage} style={{
                padding: '10px 14px',
                borderTop: '2px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                flexShrink: 0,
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)'
              }}>
                {/* Option 4: Smart Follow-Up Reminder & Nudge Banner */}
                {activeFollowUp?.needsFollowUp && !dismissedFollowUps[activeLead?.id] && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: activeFollowUp.urgency === 'high'
                      ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                      : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: activeFollowUp.urgency === 'high' ? '1.5px solid #f87171' : '1.5px solid #fcd34d',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color={activeFollowUp.urgency === 'high' ? '#dc2626' : '#d97706'} />
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          color: activeFollowUp.urgency === 'high' ? '#991b1b' : '#92400e'
                        }}>
                          ลูกค้ายังไม่ได้ตอบกลับมา {activeFollowUp.badgeText} (ส่งล่าสุดเมื่อ {activeFollowUp.hoursElapsed} ชม. ที่แล้ว)
                        </span>
                        <span style={{
                          fontSize: '0.66rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: activeFollowUp.urgency === 'high' ? '#ef4444' : '#f59e0b',
                          color: '#ffffff',
                          fontWeight: '800'
                        }}>
                          {activeFollowUp.urgency === 'high' ? '⏰ ตามด่วน' : '⏰ แนะนำ Follow-up'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDismissFollowUp(activeLead.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="ซ่อนการแจ้งเตือนนี้"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Quick 1-Click Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: '700', color: '#475569' }}>
                        ⚡ คลิกส่งข้อความตามลูกค้า:
                      </span>
                      {activeFollowUp.templates.map(tpl => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleApplyFollowUpTemplate(tpl.text)}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            backgroundColor: '#ffffff',
                            border: activeFollowUp.urgency === 'high' ? '1px solid #fca5a5' : '1px solid #fde68a',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.borderColor = '#93c5fd';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = activeFollowUp.urgency === 'high' ? '#fca5a5' : '#fde68a';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                          title={tpl.shortDesc}
                        >
                          {tpl.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Multi-Attachment Preview Queue Tray */}
                {selectedAttachments.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1.5px dashed #3b82f6',
                    borderRadius: '12px',
                    marginBottom: '4px',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    {/* Header info bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: '#1e3a8a'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>
                          {selectedAttachments.some(a => a.type !== 'image') ? '📎' : '📷'} แนบไว้ {selectedAttachments.length} รายการ
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>
                          ({(selectedAttachments.reduce((acc, curr) => acc + (curr.size || 0), 0) / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedAttachments.some(a => a.type !== 'image') ? (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                            title="เลือกไฟล์เอกสาร/PDF เพิ่มอีก"
                          >
                            <Plus size={13} /> เพิ่มไฟล์อีก
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                            title="เลือกรูปภาพเพิ่มอีก"
                          >
                            <Plus size={13} /> เพิ่มรูปอีก
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleClearAllAttachments}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: '#fee2e2',
                            border: 'none',
                            color: '#dc2626',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title="ล้างรูปทั้งหมด"
                        >
                          <X size={12} /> ล้างทั้งหมด
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Horizontal Preview Row */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '4px',
                      paddingTop: '2px',
                      overscrollBehavior: 'contain'
                    }}>
                      {selectedAttachments.map((att, idx) => (
                        <div
                          key={att.id || idx}
                          style={{
                            position: 'relative',
                            flexShrink: 0,
                            width: '76px',
                            height: '76px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            overflow: 'hidden',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          }}
                        >
                          {att.previewUrl ? (
                            <img
                              src={att.previewUrl}
                              alt={att.name || 'preview'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              padding: '4px'
                            }}>
                              <FileText size={20} />
                              <span style={{ fontSize: '0.6rem', marginTop: '2px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '90%' }}>
                                {att.name}
                              </span>
                            </div>
                          )}

                          {/* Index Badge */}
                          <span style={{
                            position: 'absolute',
                            bottom: '3px',
                            left: '3px',
                            backgroundColor: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '1px 4px',
                            fontSize: '0.62rem',
                            fontWeight: '800',
                            lineHeight: '1.1'
                          }}>
                            #{idx + 1}
                          </span>

                          {/* Remove Single Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSingleAttachment(att.id)}
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(239, 68, 68, 0.9)',
                              color: '#ffffff',
                              border: '1px solid #ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              padding: 0
                            }}
                            title="ลบรูปนี้ออก"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  {/* Hidden Photo Input (accept="image/*" multiple) */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                  />

                  {/* Hidden Document Input (multiple) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,application/pdf"
                    multiple
                    style={{ display: 'none' }}
                  />

                  {/* 1. DEDICATED PHOTO ATTACHMENT BUTTON (Compact Icon with Badge) */}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      position: 'relative',
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      border: selectedAttachments.some(a => a.type === 'image') ? '2px solid #2563eb' : '1px solid #bfdbfe',
                      backgroundColor: selectedAttachments.some(a => a.type === 'image') ? '#dbeafe' : '#eff6ff',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                    title="แนบรูปภาพส่งให้ลูกค้า (เลือกได้ทีละหลายรูป)"
                  >
                    <Camera size={19} />
                    {selectedAttachments.filter(a => a.type === 'image').length > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {selectedAttachments.filter(a => a.type === 'image').length}
                      </span>
                    )}
                  </button>

                  {/* 2. DOCUMENT ATTACHMENT BUTTON (Compact Icon with Badge) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'relative',
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      border: selectedAttachments.some(a => a.type !== 'image') ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: selectedAttachments.some(a => a.type !== 'image') ? '#eff6ff' : '#f8fafc',
                      color: selectedAttachments.some(a => a.type !== 'image') ? '#2563eb' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                    title="แนบเอกสาร PDF หรือไฟล์อื่นๆ"
                  >
                    <Paperclip size={18} />
                    {selectedAttachments.filter(a => a.type !== 'image').length > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {selectedAttachments.filter(a => a.type !== 'image').length}
                      </span>
                    )}
                  </button>

                  {/* 3. CATALOG BUTTON IN COMPOSER (Compact Icon) */}
                  <button
                    type="button"
                    onClick={() => setIsPortfolioCatalogOpen(true)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      border: '1px solid #ddd6fe',
                      backgroundColor: '#faf5ff',
                      color: '#7e22ce',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                    title="เปิดคลังรูปตัวอย่างสีเทกเจอร์และผลงานทาสี (Catalog)"
                  >
                    <ImageIcon size={18} />
                  </button>

                  {/* 4. SAVED REPLIES BUTTON IN COMPOSER (Compact Icon) */}
                  <button
                    type="button"
                    onClick={() => setIsSavedRepliesOpen(prev => !prev)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      border: isSavedRepliesOpen ? '2px solid #1877f2' : '1px solid #bfdbfe',
                      backgroundColor: isSavedRepliesOpen ? '#1877f2' : '#eff6ff',
                      color: isSavedRepliesOpen ? '#ffffff' : '#1877f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                    title="การตอบกลับที่บันทึกไว้ (เลือกข้อความสำเร็จรูป + รูปภาพ ส่งให้ลูกค้า)"
                  >
                    <MessageSquare size={18} />
                  </button>

                  {/* Textarea: Wide, Comfortable & Spacious (4-5 lines visible) */}
                  <textarea
                    ref={chatInputRef}
                    rows={isMobile ? 3 : 4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      selectedAttachments.length > 0
                        ? (selectedAttachments.every(a => a.type === 'image')
                          ? `พิมพ์ข้อความแนบไปกับ ${selectedAttachments.length} รูปนี้ (Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)...`
                          : `พิมพ์ข้อความอธิบาย ${selectedAttachments.length} ไฟล์นี้ (Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)...`)
                        : `พิมพ์ข้อความตอบกลับ ${activeLead.name}... (Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)`
                    }
                    style={{
                      flex: 1,
                      minHeight: isMobile ? '80px' : '108px',
                      maxHeight: '220px',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      backgroundColor: '#ffffff',
                      lineHeight: '1.5',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1877f2';
                      e.target.style.boxShadow = '0 0 0 3px rgba(24, 119, 242, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />

                  {/* Friendly Send Button */}
                  <button
                    type="submit"
                    disabled={(!replyText.trim() && selectedAttachments.length === 0) || isSendingAttachment}
                    style={{
                      padding: '0 18px',
                      borderRadius: '12px',
                      backgroundColor: (replyText.trim() || selectedAttachments.length > 0) ? '#1877f2' : '#e2e8f0',
                      color: (replyText.trim() || selectedAttachments.length > 0) ? '#ffffff' : '#94a3b8',
                      fontWeight: '700',
                      fontSize: '0.86rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: ((replyText.trim() || selectedAttachments.length > 0) && !isSendingAttachment) ? 'pointer' : 'not-allowed',
                      height: '44px',
                      boxShadow: (replyText.trim() || selectedAttachments.length > 0) ? '0 2px 8px rgba(24, 119, 242, 0.3)' : 'none',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    {isSendingAttachment ? (
                      <>
                        <RefreshCw size={15} className="spin-anim" />
                        {sendingProgress ? `ส่ง ${sendingProgress.current}/${sendingProgress.total}...` : 'ส่ง...'}
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        {selectedAttachments.length > 1 ? `ส่ง (${selectedAttachments.length})` : 'ส่ง'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              เลือกบทสนทนาทางซ้ายเพื่อเริ่มตอบแชท
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 3. RIGHT PANE: CRM PROFILE & FOLLOW-UP REMINDER (Collapsible)    */}
        {/* ============================================================== */}
        {(!isMobile ? isRightPaneOpen : mobileTab === 'profile') && (
          <div
            className={`scrollable-pane chat-pane-right ${isMobile && mobileTab !== 'profile' ? 'mobile-hide' : 'mobile-show'}`}
            style={{
              borderLeft: isMobile ? 'none' : '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              padding: '14px',
              height: '100%',
              width: isMobile ? '100%' : 'auto',
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              display: (isMobile && mobileTab !== 'profile') ? 'none' : 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {isMobile && (
              <button
                onClick={() => setMobileTab('chat')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  marginBottom: '2px'
                }}
              >
                <ArrowLeft size={16} /> กลับไปที่หน้าต่างแชท
              </button>
            )}
            {activeLead ? (
              <>
                {/* Follow-up Reminder Module */}
                <div style={{
                  backgroundColor: isFollowUpDue(activeLead.followUpDate) ? '#fef2f2' : '#f8fafc',
                  border: isFollowUpDue(activeLead.followUpDate) ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Clock size={16} color={isFollowUpDue(activeLead.followUpDate) ? '#dc2626' : '#64748b'} />
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isFollowUpDue(activeLead.followUpDate) ? '#b91c1c' : '#1e293b' }}>
                      ⏰ ติดตามผล (Follow-up)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                    {activeLead.followUpDate ? (
                      <div>
                        วันนัดหมาย: <strong>{activeLead.followUpDate}</strong>{' '}
                        {isFollowUpDue(activeLead.followUpDate) && <span style={{ color: '#dc2626', fontWeight: '800' }}>[ครบกำหนดแล้ว!]</span>}
                      </div>
                    ) : (
                      'ยังไม่ได้ตั้งวันติดตามผล'
                    )}
                  </div>

                  {/* Quick Follow-up Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
                    <button
                      onClick={() => handleSetFollowUpDays(1)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: '#334155'
                      }}
                    >
                      +1 วัน
                    </button>
                    <button
                      onClick={() => handleSetFollowUpDays(2)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: '#334155'
                      }}
                    >
                      +2 วัน
                    </button>
                    <button
                      onClick={() => handleSetFollowUpDays(7)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: '#334155'
                      }}
                    >
                      +1 สัปดาห์
                    </button>
                  </div>

                  {/* Send Follow-up template button */}
                  <button
                    onClick={() => {
                      const name = (activeLead.name || 'ลูกค้า').replace(/\(.*?\)/g, '').trim();
                      setReplyText(`สวัสดีครับคุณ${name} ทางเราขออนุญาตติดตามเรื่องข้อเสนอและเรทการ์ดที่ส่งให้ก่อนหน้านี้ครับ สะดวกพิจารณาหรือมีคำถามตรงไหนเพิ่มเติมไหมครับผม 😊`);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #93c5fd',
                      color: '#1d4ed8',
                      fontSize: '0.73rem',
                      fontWeight: '700'
                    }}
                  >
                    💬 ใส่ข้อความทักตามผล
                  </button>
                </div>

                {/* Customer Profile */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', margin: 0 }}>
                      ข้อมูลลูกค้า
                    </h4>
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        color: '#1d4ed8',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                      title="เปลี่ยนหรืออัปโหลดรูปโปรไฟล์ลูกค้า"
                    >
                      <Camera size={12} /> เปลี่ยนรูปโปรไฟล์
                    </button>
                  </div>

                  {/* Profile Card with Photo */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    marginBottom: '10px'
                  }}>
                    <div
                      onClick={() => setIsAvatarModalOpen(true)}
                      style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                      title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
                    >
                      <CustomerAvatar
                        lead={activeLead}
                        size={54}
                        border="2px solid #ffffff"
                        style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                      }}>
                        <Camera size={10} />
                      </span>
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeLead.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        {activeLead.avatar ? '🟢 รูปโปรไฟล์กำหนดเอง' : '🔵 รูปโปรไฟล์อัตโนมัติ'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    backgroundColor: activeTheme.badgeBg,
                    border: `1px solid ${activeTheme.badgeBorder}`,
                    color: activeTheme.badgeText,
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '10px'
                  }}>
                    {activeTheme.icon} เพจ: {activeLead.channelName || activeTheme.name}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                      <Phone size={14} color="#64748b" />
                      <span>{activeLead.contact || 'Facebook Messenger'}</span>
                    </div>

                    {activeLead.tag && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                        <Tag size={14} color="#64748b" />
                        <span>{activeLead.tag}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Sales Intelligence Card */}
                {activeClosingScore && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a' }}>
                        <Sparkles size={14} color="#7c3aed" />
                        AI โอกาสปิดการขาย
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: activeClosingScore.score >= 75 ? '#fef2f2' : (activeClosingScore.score >= 45 ? '#fffbeb' : '#f0fdf4'),
                        color: activeClosingScore.color,
                        border: `1px solid ${activeClosingScore.color}50`
                      }}>
                        {activeClosingScore.score >= 75 ? '🔥 ' : ''}{activeClosingScore.score}% ({activeClosingScore.tier})
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '7px',
                      borderRadius: '999px',
                      backgroundColor: '#f1f5f9',
                      overflow: 'hidden',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        width: `${activeClosingScore.score}%`,
                        height: '100%',
                        backgroundColor: activeClosingScore.color,
                        borderRadius: '999px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>

                    {/* Signals List */}
                    {activeClosingScore.signals.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.70rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                          สัญญาณความสนใจจากแชท:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {activeClosingScore.signals.map((sig, sIdx) => (
                            <div key={sIdx} style={{ fontSize: '0.72rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>•</span> {sig}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Next Step */}
                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #dbeafe',
                      fontSize: '0.72rem',
                      color: '#1e40af'
                    }}>
                      <div style={{ fontWeight: '800', color: '#1d4ed8', marginBottom: '2px' }}>
                        🎯 AI แนะนำขั้นตอนถัดไป:
                      </div>
                      <div>{activeClosingScore.recommendedNextStep}</div>
                    </div>
                  </div>
                )}

                {/* Follow-Up Status in CRM Panel */}
                {activeFollowUp?.needsFollowUp && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: activeFollowUp.urgency === 'high' ? '#fef2f2' : '#fffbeb',
                    border: activeFollowUp.urgency === 'high' ? '1.5px solid #fca5a5' : '1.5px solid #fde68a'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Clock size={13} color={activeFollowUp.urgency === 'high' ? '#dc2626' : '#d97706'} />
                      <span style={{ fontSize: '0.74rem', fontWeight: '800', color: activeFollowUp.urgency === 'high' ? '#991b1b' : '#92400e' }}>
                        ⏰ ถึงเวลาส่งข้อความตามลูกค้า
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '8px' }}>
                      ลูกค้าเงียบไป {activeFollowUp.badgeText} หลังแอดมินตอบล่าสุด
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {activeFollowUp.templates.map(tpl => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleApplyFollowUpTemplate(tpl.text)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.70rem',
                            fontWeight: '600',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#334155'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          {tpl.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deal Value */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>
                    มูลค่าดีลคาดการณ์ (บาท):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>฿</span>
                    <input
                      type="number"
                      value={activeLead.dealValue || 0}
                      onChange={(e) => handleUpdateLeadField('dealValue', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: '700',
                        color: '#0f172a'
                      }}
                    />
                  </div>
                </div>

                {/* Admin Assignment */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>
                    แอดมินผู้ดูแล:
                  </label>
                  <select
                    value={activeLead.admin}
                    onChange={(e) => handleUpdateLeadField('admin', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem'
                    }}
                  >
                    <option value="แอดมินนนท์">แอดมินนนท์</option>
                    <option value="แอดมินแพรว">แอดมินแพรว</option>
                    <option value="แอดมินโบว์">แอดมินโบว์</option>
                    <option value="ยังไม่ได้มอบหมาย">ยังไม่ได้มอบหมาย</option>
                  </select>
                </div>

                {/* Internal Notes Notepad */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '3px' }}>
                    โน้ตภายใน (Admin Notes):
                  </label>
                  <textarea
                    rows="4"
                    value={activeLead.notes || ''}
                    onChange={(e) => handleUpdateLeadField('notes', e.target.value)}
                    placeholder="บันทึกข้อตกลง ข้อกำหนด..."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.76rem',
                      fontFamily: 'inherit',
                      backgroundColor: '#fffbeb'
                    }}
                  />
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Modal Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '900px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.96rem' }}>{selectedImageModal.sender}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>• {selectedImageModal.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeLead && (
                <button
                  onClick={() => {
                    handleUpdateLeadField('avatar', selectedImageModal.url);
                    setToastNotification(`📷 ตั้งรูปภาพนี้เป็นรูปโปรไฟล์ของ "${activeLead.name}" เรียบร้อยแล้ว`);
                    setTimeout(() => setToastNotification(null), 3000);
                    setSelectedImageModal(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  title="ใช้รูปนี้เป็นรูปโปรไฟล์ของลูกค้าคนนี้"
                >
                  <Camera size={14} /> ตั้งเป็นรูปโปรไฟล์ลูกค้า
                </button>
              )}
              <a
                href={selectedImageModal.url}
                target="_blank"
                rel="noopener noreferrer"
                download={selectedImageModal.name || 'image.jpg'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
              >
                <Download size={14} /> ดาวน์โหลดรูปต้นฉบับ
              </a>
              <button
                onClick={() => setSelectedImageModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="ปิด (Esc)"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Modal Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
            }}
          >
            <img
              src={selectedImageModal.url}
              alt="Full View"
              style={{
                maxWidth: '100%',
                maxHeight: '82vh',
                objectFit: 'contain',
                display: 'block',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      )}

      {/* Portfolio & Texture Color Catalog Modal */}
      <PortfolioCatalogModal
        isOpen={isPortfolioCatalogOpen}
        onClose={() => setIsPortfolioCatalogOpen(false)}
        onSelectPhotoToSend={handleSelectCatalogPhoto}
        onSelectMultiplePhotosToSend={handleSelectMultipleCatalogPhotos}
        onInsertDescription={handleInsertCatalogDescription}
        activeLead={activeLead}
      />

      {/* Saved Replies (การตอบกลับที่บันทึกไว้ พร้อมรูปภาพ) Modal */}
      <SavedRepliesModal
        isOpen={isSavedRepliesOpen}
        onClose={() => setIsSavedRepliesOpen(false)}
        onSelectReply={handleSelectSavedReply}
      />

      {/* Customer Avatar Customization Modal */}
      {isAvatarModalOpen && activeLead && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAvatarModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                  เปลี่ยนรูปโปรไฟล์ลูกค้า
                </h3>
              </div>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', maxHeight: '78vh', overflowY: 'auto' }}>
              {/* Current Avatar Preview */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 16px',
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <CustomerAvatar lead={activeLead} size={64} border="3px solid #ffffff" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
                    {activeLead.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    {activeLead.avatar ? '🟢 ใช้รูปภาพโปรไฟล์ที่กำหนดเอง' : '🔵 ใช้รูปภาพอัตโนมัติประจำตัว'}
                  </div>
                  {activeLead.avatar && (
                    <button
                      onClick={() => {
                        handleUpdateLeadField('avatar', null);
                        setToastNotification(`รีเซ็ตรูปโปรไฟล์ของ "${activeLead.name}" เป็นค่าเริ่มต้นแล้ว`);
                        setTimeout(() => setToastNotification(null), 3000);
                        setIsAvatarModalOpen(false);
                      }}
                      style={{
                        marginTop: '6px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: '#ef4444',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ล้างรูป / กลับเป็นค่าเริ่มต้น
                    </button>
                  )}
                </div>
              </div>

              {/* Action 1: Upload from Device */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
                  📤 1. อัปโหลดรูปภาพจากอุปกรณ์
                </label>
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => avatarFileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#ffffff',
                    border: '2px dashed #93c5fd',
                    borderRadius: '10px',
                    color: '#2563eb',
                    fontWeight: '700',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#93c5fd';
                  }}
                >
                  <Camera size={16} /> เลือกรูปภาพจากคอม/มือถือ (ย่อขนาดอัตโนมัติ)
                </button>
              </div>

              {/* Action 2: Preset Avatar Gallery */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
                  ✨ 2. เลือกจากคลังรูปโปรไฟล์สำเร็จรูป
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px'
                }}>
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleUpdateLeadField('avatar', url);
                        setToastNotification(`📷 เปลี่ยนรูปโปรไฟล์ของ "${activeLead.name}" เรียบร้อยแล้ว`);
                        setTimeout(() => setToastNotification(null), 3000);
                        setIsAvatarModalOpen(false);
                      }}
                      style={{
                        padding: 0,
                        border: activeLead.avatar === url ? '3px solid #2563eb' : '2px solid transparent',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        aspectRatio: '1/1',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img
                        src={url}
                        alt={`Preset ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action 3: Direct URL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
                  🔗 3. วางลิงก์รูปภาพ (Direct Image URL)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={customAvatarUrlInput}
                    onChange={(e) => setCustomAvatarUrlInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!customAvatarUrlInput.trim()) return;
                      handleUpdateLeadField('avatar', customAvatarUrlInput.trim());
                      setToastNotification(`📷 อัปเดตรูปโปรไฟล์ของ "${activeLead.name}" เรียบร้อยแล้ว`);
                      setTimeout(() => setToastNotification(null), 3000);
                      setCustomAvatarUrlInput('');
                      setIsAvatarModalOpen(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                style={{
                  padding: '7px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
