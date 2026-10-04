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
  },
  {
    id: '110842514841725',
    name: 'บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี',
    handle: '@taaseegun.official',
    category: 'รับเหมาทาสีครบวงจร / ช่างทาสี',
    avatar: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=80',
    followers: 58200,
    reach: 245000,
    engagementRate: '6.4%',
    growthRate: '+22.1%',
    activePageToken: '',
    demographics: {
      gender: { women: 40, men: 57, other: 3 },
      ageRange: [
        { age: '18-24', pct: 12 },
        { age: '25-34', pct: 48 },
        { age: '35-44', pct: 28 },
        { age: '45-54', pct: 9 },
        { age: '55+', pct: 3 }
      ],
      topCities: [
        { city: 'กรุงเทพมหานคร (Bangkok)', pct: 65 },
        { city: 'นนทบุรี (Nonthaburi)', pct: 12 },
        { city: 'ปทุมธานี (Pathum Thani)', pct: 10 },
        { city: 'สมุทรปราการ (Samut Prakan)', pct: 8 },
        { city: 'นครปฐม (Nakhon Pathom)', pct: 5 }
      ],
      bestTimes: [
        'วันอังคาร 19:30 - 22:00 น.',
        'วันพฤหัสบดี 19:00 - 21:30 น.',
        'วันอาทิตย์ 09:00 - 13:00 น.'
      ]
    },
    metrics: {
      profileViews: '54.2K',
      linkClicks: '32.1K',
      totalShares: '14.8K',
      inboxLeadsCount: 68
    }
  },
  {
    id: '100873871740668',
    name: 'ทาสีคอนโด ทาสีภายใน อย่างมืออาชีพ - RoomsPainting -',
    handle: '@roomspainting.condo',
    category: 'ทาสีห้องคอนโด / งานภายใน',
    avatar: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=80',
    followers: 31200,
    reach: 142000,
    engagementRate: '5.1%',
    growthRate: '+16.5%',
    activePageToken: '',
    demographics: {
      gender: { women: 58, men: 39, other: 3 },
      ageRange: [
        { age: '18-24', pct: 22 },
        { age: '25-34', pct: 58 },
        { age: '35-44', pct: 15 },
        { age: '45-54', pct: 4 },
        { age: '55+', pct: 1 }
      ],
      topCities: [
        { city: 'กรุงเทพมหานคร (Bangkok)', pct: 82 },
        { city: 'นนทบุรี (Nonthaburi)', pct: 10 },
        { city: 'สมุทรปราการ (Samut Prakan)', pct: 5 },
        { city: 'ปทุมธานี (Pathum Thani)', pct: 3 }
      ],
      bestTimes: [
        'วันพุธ 20:00 - 23:00 น.',
        'วันศุกร์ 20:00 - 23:30 น.',
        'วันอาทิตย์ 18:00 - 22:00 น.'
      ]
    },
    metrics: {
      profileViews: '42.6K',
      linkClicks: '24.5K',
      totalShares: '11.3K',
      inboxLeadsCount: 54
    }
  },
  {
    id: '410827156426441',
    name: 'ทาสีบ้าน ทาวเฮ้าส์ บ้านเดี่ยว หอพัก อาคาร',
    handle: '@taaseebaan.bangkok',
    category: 'รับเหมาทาสีภายนอก-ภายใน',
    avatar: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=150&auto=format&fit=crop&q=80',
    followers: 46800,
    reach: 185000,
    engagementRate: '4.9%',
    growthRate: '+12.7%',
    activePageToken: '',
    demographics: {
      gender: { women: 48, men: 49, other: 3 },
      ageRange: [
        { age: '18-24', pct: 10 },
        { age: '25-34', pct: 44 },
        { age: '35-44', pct: 32 },
        { age: '45-54', pct: 11 },
        { age: '55+', pct: 3 }
      ],
      topCities: [
        { city: 'กรุงเทพมหานคร (Bangkok)', pct: 70 },
        { city: 'นนทบุรี (Nonthaburi)', pct: 12 },
        { city: 'ปทุมธานี (Pathum Thani)', pct: 10 },
        { city: 'สมุทรปราการ (Samut Prakan)', pct: 8 }
      ],
      bestTimes: [
        'วันจันทร์ 19:00 - 21:00 น.',
        'วันพฤหัสบดี 19:30 - 22:00 น.',
        'วันเสาร์ 09:00 - 12:00 น.'
      ]
    },
    metrics: {
      profileViews: '31.2K',
      linkClicks: '16.7K',
      totalShares: '7.9K',
      inboxLeadsCount: 39
    }
  },
  {
    id: '101038208390600',
    name: 'รับทำสีเทกเจอร์ texture สีตกแต่งพิเศษ by ช่างหมี',
    handle: '@texture.bear',
    category: 'งานสีเทกเจอร์เฉพาะทาง',
    avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=150&auto=format&fit=crop&q=80',
    followers: 18400,
    reach: 82000,
    engagementRate: '5.4%',
    growthRate: '+15.2%',
    activePageToken: '',
    demographics: {
      gender: { women: 42, men: 55, other: 3 },
      ageRange: [
        { age: '18-24', pct: 16 },
        { age: '25-34', pct: 54 },
        { age: '35-44', pct: 22 },
        { age: '45-54', pct: 6 },
        { age: '55+', pct: 2 }
      ],
      topCities: [
        { city: 'กรุงเทพมหานคร (Bangkok)', pct: 62 },
        { city: 'เชียงใหม่ (Chiang Mai)', pct: 15 },
        { city: 'ชลบุรี (Chonburi)', pct: 12 }
      ],
      bestTimes: [
        'วันพุธ 18:00 - 21:00 น.',
        'วันอาทิตย์ 14:00 - 18:00 น.'
      ]
    },
    metrics: {
      profileViews: '21.5K',
      linkClicks: '11.8K',
      totalShares: '5.2K',
      inboxLeadsCount: 28
    }
  },
  {
    id: '200343403170775',
    name: 'เดอ นา เดอ เมีย ฟาร์มสเตย์',
    handle: '@derna.farmstay',
    category: 'ท่องเที่ยว / ฟาร์มสเตย์ & ธรรมชาติ',
    avatar: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=150&auto=format&fit=crop&q=80',
    followers: 29800,
    reach: 125000,
    engagementRate: '7.8%',
    growthRate: '+24.5%',
    activePageToken: '',
    demographics: {
      gender: { women: 65, men: 32, other: 3 },
      ageRange: [
        { age: '18-24', pct: 28 },
        { age: '25-34', pct: 46 },
        { age: '35-44', pct: 18 },
        { age: '45-54', pct: 6 },
        { age: '55+', pct: 2 }
      ],
      topCities: [
        { city: 'กรุงเทพมหานคร (Bangkok)', pct: 55 },
        { city: 'ขอนแก่น (Khon Kaen)', pct: 20 },
        { city: 'นครราชสีมา (Korat)', pct: 15 }
      ],
      bestTimes: [
        'วันศุกร์ 18:00 - 22:00 น.',
        'วันเสาร์ 08:00 - 12:00 น.',
        'วันอาทิตย์ 17:00 - 21:00 น.'
      ]
    },
    metrics: {
      profileViews: '35.4K',
      linkClicks: '18.9K',
      totalShares: '12.1K',
      inboxLeadsCount: 37
    }
  },
  {
    id: '100869824670807',
    name: 'มันส์ติดปาก',
    handle: '@muntidpak.food',
    category: 'อาหาร & ขนม / ของกินเล่น',
    avatar: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&auto=format&fit=crop&q=80',
    followers: 35400,
    reach: 164000,
    engagementRate: '6.9%',
    growthRate: '+19.8%',
    activePageToken: '',
    demographics: {
      gender: { women: 62, men: 35, other: 3 },
      ageRange: [
        { age: '18-24', pct: 35 },
        { age: '25-34', pct: 45 },
        { age: '35-44', pct: 14 },
        { age: '45-54', pct: 5 },
        { age: '55+', pct: 1 }
      ],
      topCities: [
        { city: 'กรุงเทพมหานคร (Bangkok)', pct: 60 },
        { city: 'ชลบุรี (Chonburi)', pct: 15 },
        { city: 'เชียงใหม่ (Chiang Mai)', pct: 12 }
      ],
      bestTimes: [
        'วันจันทร์ 11:30 - 13:30 น.',
        'วันพฤหัสบดี 17:30 - 20:00 น.',
        'วันเสาร์ 18:00 - 22:00 น.'
      ]
    },
    metrics: {
      profileViews: '48.9K',
      linkClicks: '29.3K',
      totalShares: '16.4K',
      inboxLeadsCount: 62
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

export const initialLeads = [
  {
    id: 'lead-1',
    name: 'คุณวรัญญา (ตัวแทนแบรนด์ Anker Thailand)',
    channel: 'fb-page-1',
    channelName: 'FB: เพจหลัก Tech & Lifestyle',
    platform: 'facebook',
    sourceType: 'inbox',
    sourceTitle: 'Facebook Messenger Direct',
    sourceLink: 'https://m.me/techlifestyle.th',
    contact: '081-987-6543 / waranya@brand.co.th',
    inquiry: 'ต้องการสปอนเซอร์คลิปรีวิว Power Bank ตัวใหม่ 1 คลิป YouTube + ไทอินในเพจ FB ขอเรทการ์ดและวันว่างเดือนหน้า',
    tag: 'Sponsorship / Media',
    dealValue: 45000,
    status: 'กำลังเสนอราคา (Quoted)',
    date: '2026-10-04 08:15',
    admin: 'แอดมินนนท์',
    notes: 'ส่ง Rate Card 2026 ไปทางอีเมลแล้ว รอคอนเฟิร์มสคริปต์',
    messages: [
      { id: 'm1', sender: 'customer', text: 'สวัสดีค่ะ ติดต่อจากแบรนด์ Anker Thailand นะคะ สนใจจ้างรีวิว Power Bank ตัวใหม่ค่ะ', time: '08:10' },
      { id: 'm2', sender: 'customer', text: 'ต้องการคลิปรีวิว 1 คลิป YouTube + โพสต์รูปภาพไทอินในเพจ FB ขอเรทการ์ดและวันว่างเดือนหน้าหน่อยค่ะ', time: '08:15' },
      { id: 'm3', sender: 'admin', text: 'สวัสดีครับคุณวรัญญา ยินดีมากๆ ครับ ทางเราส่ง Rate Card พร้อมตัวอย่างผลงานรีวิวปีก่อนหน้าให้ทางอีเมลเรียบร้อยแล้วนะครับ', time: '08:25', adminName: 'แอดมินนนท์' }
    ]
  },
  {
    id: 'lead-2',
    name: 'คุณกิตติศักดิ์ (ร้าน iService เชียงใหม่)',
    channel: 'fb-page-2',
    channelName: 'FB: เพจรีวิว Gadget Review',
    platform: 'facebook',
    sourceType: 'post_comment',
    sourceTitle: 'โพสต์: "เปิดตัว Hub Type-C 10-in-1 อะลูมิเนียมเกรดพรีเมียม"',
    sourceLink: 'https://facebook.com/posts/1029384756',
    contact: 'Line: @kittiservice / 089-222-3344',
    inquiry: 'คอมเมนต์ถามหน้าเพจ: "สนใจสั่งราคาส่ง 50 ชิ้น มีของพร้อมส่งไหมครับ ออกใบกำกับภาษีได้หรือเปล่า"',
    tag: 'Wholesale / ราคาส่ง',
    dealValue: 28500,
    status: 'ติดต่อกลับแล้ว (Contacted)',
    date: '2026-10-04 07:40',
    admin: 'แอดมินแพรว',
    notes: 'ดึงเข้าแชท Inbox แล้ว ส่งแคตตาล็อกสินค้าและตารางราคาส่งให้ทาง Line',
    messages: [
      { id: 'm1', sender: 'customer', text: 'คอมเมนต์ใต้โพสต์: สนใจสั่งราคาส่ง 50 ชิ้น มีของพร้อมส่งไหมครับ ออกใบกำกับภาษีได้หรือเปล่า', time: '07:40', isComment: true },
      { id: 'm2', sender: 'admin', text: 'สวัสดีครับคุณกิตติศักดิ์ ทางเราทัก Inbox มาแจ้งรายละเอียดราคาส่ง 50 ชิ้น และมีของพร้อมส่งออกใบกำกับภาษีได้ครับผม', time: '07:45', adminName: 'แอดมินแพรว' }
    ]
  },
  {
    id: 'lead-3',
    name: 'คุณพิมพ์ใจ (Creative Agency Bangkok)',
    channel: 'youtube',
    channelName: 'YouTube Inquiries',
    platform: 'youtube',
    sourceType: 'video_comment',
    sourceTitle: 'คลิป YouTube: "AI เปลี่ยนวงการ Content Creator ไปตลอดกาลได้อย่างไร"',
    sourceLink: 'https://youtube.com/watch?v=mockai2026',
    contact: 'pimjai@sparkagency.com',
    inquiry: 'คอมเมนต์ใต้คลิป: "ติดตามช่องมาตลอดเลยค่ะ อยากเชิญคุณมาเป็น Speaker งานสัมมนา AI for Content Creators 25 พ.ย. นี้ และคุยเรื่อง Brand Partnership ค่ะ ส่งอีเมลไปแล้วนะคะ"',
    tag: 'Speaker / Event',
    dealValue: 35000,
    status: 'ทักใหม่ (New)',
    date: '2026-10-03 21:10',
    admin: 'ยังไม่ได้มอบหมาย',
    notes: 'เช็กในอีเมลพบข้อเสนออย่างเป็นทางการ ต้องประสานงานกับผู้บริหาร',
    messages: [
      { id: 'm1', sender: 'customer', text: 'คอมเมนต์ใต้คลิป: ติดตามช่องมาตลอดเลยค่ะ อยากเชิญคุณมาเป็น Speaker งานสัมมนา AI for Content Creators 25 พ.ย. นี้ และคุยเรื่อง Brand Partnership ค่ะ ส่งอีเมลไปแล้วนะคะ', time: '21:10', isComment: true }
    ]
  },
  {
    id: 'lead-4',
    name: 'คุณธีรพงศ์',
    channel: 'tiktok',
    channelName: 'TikTok Clip Comments',
    platform: 'tiktok',
    sourceType: 'video_comment',
    sourceTitle: 'คลิป TikTok: "คีย์บอร์ดไร้สายเสียง Thock ที่ราคาไม่ถึงสองพัน!"',
    sourceLink: 'https://tiktok.com/@antigravity_th/video/1029384',
    contact: 'TikTok: @theerapong_it / 084-555-1234',
    inquiry: 'คอมเมนต์ใต้คลิป TikTok: "รุ่นนี้ยังมีสีขาวพร้อมส่งไหมครับ อยากได้พร้อมแผ่นรองข้อมือ 1 ชุด ตอบกลับด่วนทีครับ"',
    tag: 'Retail Order / ซื้อปลีก',
    dealValue: 3200,
    status: 'ปิดการขายแล้ว (Won)',
    date: '2026-10-03 18:30',
    admin: 'แอดมินแพรว',
    notes: 'ทัก DM TikTok ไปปิดการขาย โอนเงินเรียบร้อยแล้ว',
    messages: [
      { id: 'm1', sender: 'customer', text: 'คอมเมนต์ใต้คลิป TikTok: รุ่นนี้ยังมีสีขาวพร้อมส่งไหมครับ อยากได้พร้อมแผ่นรองข้อมือ 1 ชุด ตอบกลับด่วนทีครับ', time: '18:30', isComment: true },
      { id: 'm2', sender: 'admin', text: 'สวัสดีครับ มีของพร้อมส่งเลยครับผม ยอดรวมเซ็ตคีย์บอร์ดสีขาว+แผ่นรองข้อมือ ฿3,200 ส่งฟรีครับ', time: '18:35', adminName: 'แอดมินแพรว' },
      { id: 'm3', sender: 'customer', text: 'โอนเรียบร้อยแล้วครับ ส่งที่อยู่จัดส่งให้ในแชทแล้วนะครับ ขอบคุณครับ', time: '18:42' }
    ]
  },
  {
    id: 'lead-5',
    name: 'คุณณัฐวุฒิ',
    channel: 'fb-page-1',
    channelName: 'FB: เพจหลัก Tech & Lifestyle',
    platform: 'facebook',
    sourceType: 'video_comment',
    sourceTitle: 'คลิป Reels: "เทคนิคจัดโต๊ะทำงานสาย Coding ให้โฟกัสได้ทั้งวัน"',
    sourceLink: 'https://facebook.com/reel/9948271',
    contact: 'FB Profile: Natthawut B.',
    inquiry: 'คอมเมนต์ใต้ Reels: "โคมไฟแขวนจอคอมในคลิปใช้รุ่นไหนครับ สั่งซื้อได้ที่ไหน มีโค้ดลดไหมครับ"',
    tag: 'Product Inquiry',
    dealValue: 1890,
    status: 'ทักใหม่ (New)',
    date: '2026-10-03 16:15',
    admin: 'ยังไม่ได้มอบหมาย',
    notes: 'ยังไม่ได้ตอบกลับใต้คอมเมนต์ แนะนำให้แอดมินส่งลิงก์และโค้ดทาง Inbox',
    messages: [
      { id: 'm1', sender: 'customer', text: 'คอมเมนต์ใต้ Reels: โคมไฟแขวนจอคอมในคลิปใช้รุ่นไหนครับ สั่งซื้อได้ที่ไหน มีโค้ดลดไหมครับ', time: '16:15', isComment: true }
    ]
  },
  {
    id: 'lead-6',
    name: 'คุณดนัย (Creator Club Member)',
    channel: 'fb-page-3',
    channelName: 'FB: เพจ Creator Club',
    platform: 'facebook',
    sourceType: 'inbox',
    sourceTitle: 'Messenger แชทเพจ Creator Club',
    sourceLink: 'https://m.me/creatorclub.th',
    contact: 'Line: danai_creator',
    inquiry: 'สนใจสมัครคอร์ส Private Mentoring ทำช่อง YouTube และ TikTok จาก 0 สู่ 100K วิว ยังมีรอบเปิดรับไหมครับ',
    tag: 'Course / Training',
    dealValue: 12900,
    status: 'กำลังเจรจา (Negotiating)',
    date: '2026-10-03 15:45',
    admin: 'แอดมินนนท์',
    notes: 'นัดสัมภาษณ์เบื้องต้นผ่าน Zoom วันพรุ่งนี้ 14:00 น.',
    messages: [
      { id: 'm1', sender: 'customer', text: 'สวัสดีครับ สนใจสมัครคอร์ส Private Mentoring ทำช่อง YouTube และ TikTok จาก 0 สู่ 100K วิว ยังมีรอบเปิดรับไหมครับ', time: '15:45' },
      { id: 'm2', sender: 'admin', text: 'สวัสดีครับคุณดนัย ตอนนี้รุ่นเดือนพฤศจิกายนยังเปิดรับ 2 ที่สุดท้ายครับ สะดวกนัดคุยวิดีโอคอลแนะนำหลักสูตรเบื้องต้นก่อนได้นะครับ', time: '15:55', adminName: 'แอดมินนนท์' },
      { id: 'm3', sender: 'customer', text: 'สะดวกครับ วันพรุ่งนี้ช่วงบ่าย 2 ว่างเลยครับ', time: '16:02' }
    ]
  },
  {
    id: 'lead-7',
    name: 'คุณวรรณภา (Marketing Manager, FinTech App)',
    channel: 'fb-page-1',
    channelName: 'FB: เพจหลัก Tech & Lifestyle',
    platform: 'facebook',
    sourceType: 'inbox',
    sourceTitle: 'Messenger แชทเพจหลัก',
    sourceLink: 'https://m.me/techlifestyle.th',
    contact: 'wannapa@finapp.co.th',
    inquiry: 'ต้องการโปรโมทแคมเปญเปิดตัวแอปพลิเคชันการเงินใหม่ วางงบ 3 แพลตฟอร์ม (FB Post + YouTube Clip + TikTok Challenge)',
    tag: 'Package / Mega Deal',
    dealValue: 120000,
    status: 'กำลังเสนอราคา (Quoted)',
    date: '2026-10-02 16:20',
    admin: 'แอดมินนนท์',
    notes: 'ส่งข้อเสนอ Media Package 3 ช่องทาง นัดประชุมตรวจดราฟท์วันพฤหัสบดี',
    messages: [
      { id: 'm1', sender: 'customer', text: 'สวัสดีค่ะ ติดต่อเรื่องแคมเปญเปิดตัวแอปการเงินใหม่ ต้องการจัดแพ็กเกจ 3 ช่องทาง FB+YouTube+TikTok งบประมาณ 120,000 ค่ะ', time: '16:20' },
      { id: 'm2', sender: 'admin', text: 'สวัสดีครับคุณวรรณภา ขอขอบพระคุณที่ไว้วางใจครับ ทางทีมทำตารางแพ็กเกจส่งให้ทางอีเมลเรียบร้อย นัดประชุมคุยดีเทลวันพฤหัสนี้ตามสะดวกเลยครับ', time: '16:40', adminName: 'แอดมินนนท์' }
    ]
  },
  {
    id: 'lead-8',
    name: 'คุณศิริพร (SME เจ้าของร้านกาแฟ)',
    channel: 'fb-page-2',
    channelName: 'FB: เพจรีวิว Gadget Review',
    platform: 'facebook',
    sourceType: 'post_comment',
    sourceTitle: 'โพสต์รูปภาพ: "สรุป 5 เครื่อง POS คิดเงินหน้าร้านสำหรับคาเฟ่"',
    sourceLink: 'https://facebook.com/posts/88219482',
    contact: 'Messenger / 082-333-8899',
    inquiry: 'คอมเมนต์ใต้โพสต์: "ที่ร้านกำลังจะเปิดสาขา 2 สนใจเครื่องแบบรุ่นที่ 3 ในรูป มีบริการติดตั้งที่เชียงใหม่ไหมคะ"',
    tag: 'Wholesale / ราคาส่ง',
    dealValue: 18500,
    status: 'กำลังเสนอราคา (Quoted)',
    date: '2026-10-02 14:10',
    admin: 'แอดมินแพรว',
    notes: 'ตอบคอมเมนต์แล้วดึงเข้า Inbox แนะนำแพ็กเกจติดตั้ง',
    messages: [
      { id: 'm1', sender: 'customer', text: 'คอมเมนต์ใต้โพสต์: ที่ร้านกำลังจะเปิดสาขา 2 สนใจเครื่องแบบรุ่นที่ 3 ในรูป มีบริการติดตั้งที่เชียงใหม่ไหมคะ', time: '14:10', isComment: true },
      { id: 'm2', sender: 'admin', text: 'สวัสดีค่ะคุณศิริพร ทางเรามีทีมช่างพาร์ทเนอร์ดูแลในพื้นที่เชียงใหม่พร้อมติดตั้งและสอนใช้งานเลยค่ะ เดี๋ยวส่งใบเสนอราคาให้ในนี้เลยนะคะ', time: '14:25', adminName: 'แอดมินแพรว' }
    ]
  },
  {
    id: 'lead-9',
    name: 'คุณสมภพ',
    channel: 'fb-page-2',
    channelName: 'FB: เพจรีวิว Gadget Review',
    platform: 'facebook',
    sourceType: 'inbox',
    sourceTitle: 'Messenger แชทเพจ Gadget Review',
    sourceLink: 'https://m.me/gadgetdeals.review',
    contact: 'Messenger Chat',
    inquiry: 'สอบถามเรื่องของแถมเมาส์ไร้สายยังมีโปรลด 20% ถึงเมื่อไหร่ครับ',
    tag: 'Product Inquiry',
    dealValue: 890,
    status: 'ติดต่อกลับแล้ว (Contacted)',
    date: '2026-10-02 11:05',
    admin: 'แอดมินแพรว',
    notes: 'แจ้งโค้ดส่วนลดให้ลูกค้าในแชทแล้ว',
    messages: [
      { id: 'm1', sender: 'customer', text: 'สอบถามเรื่องของแถมเมาส์ไร้สายยังมีโปรลด 20% ถึงเมื่อไหร่ครับ', time: '11:05' },
      { id: 'm2', sender: 'admin', text: 'สวัสดีครับ โปรโมชั่นลด 20% มีถึงสิ้นเดือนนี้ครับ สามารถกรอกโค้ด GADGET20 ได้เลยครับผม', time: '11:12', adminName: 'แอดมินแพรว' }
    ]
  }
];

export const leadStatusOptions = [
  { value: 'all', label: 'สถานะทั้งหมด' },
  { value: 'ทักใหม่ (New)', label: 'ทักใหม่ (New)', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'ติดต่อกลับแล้ว (Contacted)', label: 'ติดต่อกลับแล้ว (Contacted)', color: '#8b5cf6', bg: '#f5f3ff' },
  { value: 'กำลังเสนอราคา (Quoted)', label: 'กำลังเสนอราคา (Quoted)', color: '#f59e0b', bg: '#fffbeb' },
  { value: 'กำลังเจรจา (Negotiating)', label: 'กำลังเจรจา (Negotiating)', color: '#06b6d4', bg: '#ecfeff' },
  { value: 'ปิดการขายแล้ว (Won)', label: 'ปิดการขายแล้ว (Won)', color: '#10b981', bg: '#ecfdf5' },
  { value: 'ยกเลิก / ปิดเคส (Lost)', label: 'ยกเลิก / ปิดเคส (Lost)', color: '#ef4444', bg: '#fef2f2' }
];

