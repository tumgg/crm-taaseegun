// Data structures and mock data for OmniSocial Hub

export const REAL_GOOD_VIBES_PAGE_ID = '113532784994486';
export const REAL_GOOD_VIBES_TOKEN = 'EAAZCpCdzNLVIBSqHMVvZCutYZAPmAZBpWItpfkNXmFNrU2RIZASiV4YvZC1W3dmZAcfAxnZCC4ZA7ptk6r0WpKMBlnDRKBli8yzdZCLDBl77QQU58Wie0yZAYBNcWPNaLmZCl41bfe87zfeTj2qacppOOdnxyZAZAbpnpApaoBZCQtousIhkRpUuPGryfZAevGVXW6Ip2x0jijS4sKyb';

export const initialFacebookPages = [
  {
    id: REAL_GOOD_VIBES_PAGE_ID,
    name: 'รับพ่นสี Texture ฉาบเทคเจอร์ ราคาถูก By Good Vibes',
    handle: '@goodvibes.texturepaint',
    category: 'ช่างพ่นสีเทกเจอร์ / ตกแต่งผนัง',
    avatar: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&auto=format&fit=crop&q=80',
    followers: 24500,
    reach: 98000,
    engagementRate: '5.8%',
    growthRate: '+18.4%',
    activePageToken: REAL_GOOD_VIBES_TOKEN,
    demographics: {
      gender: { women: 45, men: 52, other: 3 },
      ageRange: [
        { age: '18-24', pct: 15 },
        { age: '25-34', pct: 52 },
        { age: '35-44', pct: 24 },
        { age: '45-54', pct: 7 },
        { age: '55+', pct: 2 }
      ],
      topCities: [
        { city: 'กรุงเทพมหานคร (Bangkok)', pct: 68 },
        { city: 'นนทบุรี (Nonthaburi)', pct: 14 },
        { city: 'สมุทรปราการ (Samut Prakan)', pct: 9 },
        { city: 'ปทุมธานี (Pathum Thani)', pct: 6 },
        { city: 'ชลบุรี (Chonburi)', pct: 3 }
      ],
      bestTimes: [
        'วันจันทร์ 19:00 - 22:00 น.',
        'วันพุธ 20:00 - 23:00 น.',
        'วันเสาร์ 10:00 - 14:00 น.'
      ]
    },
    metrics: {
      profileViews: '38.4K',
      linkClicks: '19.2K',
      totalShares: '8.4K',
      inboxLeadsCount: 42
    }
  }
];

export const youtubeAnalytics = {
  channelName: 'Antigravity Studio TH',
  handle: '@antigravity.studio',
  subscribers: '115,000',
  views: '1.42M',
  watchTimeHours: '86.4K hrs',
  avgViewDuration: '4:28 min',
  avgPctViewed: '46.8%',
  engagementRate: '5.12%',
  demographics: {
    gender: { women: 38, men: 59, other: 3 },
    ageRange: [
      { age: '18-24', pct: 21 },
      { age: '25-34', pct: 48 },
      { age: '35-44', pct: 22 },
      { age: '45-54', pct: 7 },
      { age: '55+', pct: 2 }
    ],
    topCities: [
      { city: 'ประเทศไทย (Thailand)', pct: 92.4 },
      { city: 'สปป. ลาว (Laos)', pct: 4.1 },
      { city: 'สหรัฐอเมริกา (Thai Diaspora)', pct: 1.8 },
      { city: 'ออสเตรเลีย (Australia)', pct: 1.1 },
      { city: 'ญี่ปุ่น (Japan)', pct: 0.6 }
    ],
    bestTimes: [
      'วันเสาร์ 10:00 - 13:00 น.',
      'วันอาทิตย์ 17:00 - 21:00 น.',
      'วันพฤหัสบดี 19:00 - 22:00 น.'
    ]
  }
};

export const tiktokAnalytics = {
  channelName: 'Antigravity Shorts TH',
  handle: '@antigravity_th',
  followers: '284,500',
  videoViews: '8.65M',
  likes: '1.24M',
  shares: '184.2K',
  engagementRate: '8.45%',
  demographics: {
    gender: { women: 56, men: 41, other: 3 },
    ageRange: [
      { age: '18-24', pct: 44 },
      { age: '25-34', pct: 39 },
      { age: '35-44', pct: 12 },
      { age: '45-54', pct: 4 },
      { age: '55+', pct: 1 }
    ],
    topCities: [
      { city: 'กรุงเทพฯ และปริมณฑล', pct: 54 },
      { city: 'ภาคเหนือ (เชียงใหม่, เชียงราย)', pct: 16 },
      { city: 'ภาคอีสาน (ขอนแก่น, โคราช)', pct: 15 },
      { city: 'ภาคใต้ (ภูเก็ต, สงขลา)', pct: 10 },
      { city: 'ภาคตะวันออก (ชลบุรี, ระยอง)', pct: 5 }
    ],
    bestTimes: [
      'วันทุกวัน 12:00 - 13:00 น. (ช่วงพักเที่ยง)',
      'วันทุกวัน 18:00 - 20:00 น. (เลิกงาน)',
      'วันศุกร์-เสาร์ 21:30 - 23:30 น.'
    ]
  }
};

export const instagramAnalytics = {
  channelName: 'Antigravity Official',
  handle: '@antigravity.official',
  followers: '94,200',
  reach: '389,000',
  profileViews: '28.4K',
  interactions: '42.1K',
  engagementRate: '6.15%',
  demographics: {
    gender: { women: 61, men: 36, other: 3 },
    ageRange: [
      { age: '18-24', pct: 26 },
      { age: '25-34', pct: 54 },
      { age: '35-44', pct: 14 },
      { age: '45-54', pct: 5 },
      { age: '55+', pct: 1 }
    ],
    topCities: [
      { city: 'Bangkok', pct: 68 },
      { city: 'Nonthaburi', pct: 9 },
      { city: 'Chiang Mai', pct: 8 },
      { city: 'Chonburi', pct: 7 },
      { city: 'Khon Kaen', pct: 4 }
    ],
    bestTimes: [
      'วันอังคาร 19:00 - 21:00 น.',
      'วันพฤหัสบดี 20:00 - 22:00 น.',
      'วันอาทิตย์ 18:00 - 21:00 น.'
    ]
  }
};

export const interactionTypeOptions = [
  { value: 'all', label: 'ทั้งหมด (ทุกประเภท)' },
  { value: 'inbox', label: '📥 ข้อความ Inbox / DM', icon: 'MessageSquare', color: '#1877f2', bg: '#eff6ff' },
  { value: 'post_comment', label: '📝 คอมเมนต์หน้าเพจ / โพสต์', icon: 'FileText', color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'video_comment', label: '🎬 คอมเมนต์ใต้คลิป / Reels / Shorts', icon: 'Video', color: '#f59e0b', bg: '#fffbeb' }
];

export const quickReplyTemplates = [
  { id: 'qr-1', title: '👋 ทักทายต้อนรับ', text: 'สวัสดีครับ ยินดีให้บริการครับ สนใจสอบถามข้อมูลหรือสั่งซื้อสินค้าแจ้งได้เลยนะครับ 😊' },
  { id: 'qr-2', title: '📦 แจ้งสินค้าพร้อมส่ง', text: 'สินค้ารุ่นนี้มีสินค้าพร้อมส่งจากไทยครับ จัดส่งด่วนได้รับของภายใน 1-2 วันทำการครับผม' },
  { id: 'qr-3', title: '📋 ขอเรทการ์ดสปอนเซอร์', text: 'ได้รับข้อมูลเรียบร้อยครับ ทางเราได้แนบ Rate Card 2026 และคิววันว่างให้พิจารณาทางนี้แล้วครับ' },
  { id: 'qr-4', title: '🧾 ใบกำกับภาษี / สรุปยอด', text: 'สามารถออกใบกำกับภาษีเต็มรูปแบบได้ครับ รบกวนแจ้งชื่อ-ที่อยู่จดทะเบียน และเลข 13 หลักได้เลยครับ' }
];

export const initialLeads = [];

export const leadStatusOptions = [
  { value: 'all', label: 'สถานะทั้งหมด' },
  { value: 'ทักใหม่ (New)', label: 'ทักใหม่ (New)', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'ติดต่อกลับแล้ว (Contacted)', label: 'ติดต่อกลับแล้ว (Contacted)', color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'กำลังเสนอราคา (Quoted)', label: 'กำลังเสนอราคา (Quoted)', color: '#f59e0b', bg: '#fffbeb' },
  { value: 'กำลังเจรจา (Negotiating)', label: 'กำลังเจรจา (Negotiating)', color: '#06b6d4', bg: '#ecfeff' },
  { value: 'ปิดการขายแล้ว (Won)', label: 'ปิดการขายแล้ว (Won)', color: '#10b981', bg: '#ecfdf5' },
  { value: 'ยกเลิก / ปิดเคส (Lost)', label: 'ยกเลิก / ปิดเคส (Lost)', color: '#ef4444', bg: '#fef2f2' }
];

