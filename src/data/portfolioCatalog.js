// Pre-saved Portfolios & Texture Catalogs for Fast One-Click Chat Delivery
// Tailored for Taaseegun, Good Vibes, RoomsPainting, and ช่างหมี

export const initialCatalogCategories = [
  { id: 'all', name: 'ทั้งหมด', icon: '🎨' },
  { id: 'texture', name: 'สีเทกเจอร์ / Texture', icon: '🧱' },
  { id: 'house', name: 'ทาสีบ้าน & ภายนอก', icon: '🏠' },
  { id: 'condo', name: 'ทาสีคอนโด & ภายใน', icon: '🏢' },
  { id: 'color_chart', name: 'ชาร์ตเฉดสียอดนิยม', icon: '🎨' }
];

export const initialCatalogItems = [
  // 1. Texture Painting (ช่างหมี & Good Vibes)
  {
    id: 'cat-tex-1',
    category: 'texture',
    title: 'สีเทกเจอร์ ลาย Travertine หินอ่อนธรรมชาติ',
    pageName: 'ช่างหมี / Good Vibes',
    priceEstimate: '1,100 บาท / ตร.ม.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'สีเทกเจอร์ตกแต่งผนังลาย Travertine เรียบหรู สไตล์โมเดิร์นคลาสสิก ป้องกันเชื้อราและคราบตะไคร่น้ำ อายุการใช้งานยาวนาน 10+ ปี',
    tags: ['Travertine', 'สีเทกเจอร์', 'ยอดนิยม']
  },
  {
    id: 'cat-tex-2',
    category: 'texture',
    title: 'สีเทกเจอร์ ลายสนิม Rust Texture ดิบเท่สไตล์ลอฟท์',
    pageName: 'ช่างหมี / Good Vibes',
    priceEstimate: '950 - 1,200 บาท / ตร.ม.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    description: 'สีเทกเจอร์ลายสนิมเหล็กจริง ให้มิติความดิบเท่ เป็นเอกลักษณ์เฉพาะตัว เหมาะสำหรับผนังไฮไลท์ คาเฟ่ ร้านอาหาร หรือห้องรับแขก',
    tags: ['ลายสนิม', 'Loft', 'Accent Wall']
  },
  {
    id: 'cat-tex-3',
    category: 'texture',
    title: 'สีพ่นเทกเจอร์ ลายหินทรายธรรมชาติ (Sandstone)',
    pageName: 'Good Vibes / ช่างหมี',
    priceEstimate: '650 บาท / ตร.ม.',
    imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    description: 'งานพ่นสีเทกเจอร์ลายหินทราย เม็ดละเอียด ช่วยพรางรอยต่อและผิวผนังที่ไม่เรียบ ทนทานแดดฝน เหมาะสำหรับทั้งภายนอกและภายในอาคาร',
    tags: ['พ่นหินทราย', 'ราคาประหยัด', 'ภายนอก/ภายใน']
  },
  {
    id: 'cat-tex-4',
    category: 'texture',
    title: 'สีเทกเจอร์ ลายคลื่นทะเล Ocean Wave นูนมีมิติ',
    pageName: 'ช่างหมี',
    priceEstimate: '1,100 บาท / ตร.ม.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    description: 'ลายฉาบพิเศษสร้างมิติริ้วคลื่นแสงเงาสวยงาม สะท้อนแสงไฟ Warm Light ดูมีชีวิตชีวา เหมาะกับผนังห้องนอนและห้องรับแขก',
    tags: ['ลายคลื่น', 'มิติแสงเงา', 'ฉาบพิเศษ']
  },

  // 2. House & Commercial Painting (บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี)
  {
    id: 'cat-house-1',
    category: 'house',
    title: 'ผลงานทาสีบ้านเดี่ยว 2 ชั้น (ภายนอกและรั้วบ้าน)',
    pageName: 'บริษัท ทาสีกัน จำกัด',
    priceEstimate: 'ประเมินตามพื้นที่หน้างานจริง',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    description: 'งานทาสีบ้านเดี่ยวภายนอก ขัดล้างเชื้อรา ซ่อมแซมรอยแตกลายงาด้วยหมันโป๊วอะคริลิก และทาสีเกรดพรีเมียม 15 ปี กันร้อนสะท้อนยูวี',
    tags: ['บ้านเดี่ยว', 'ภายนอก', 'กันร้อน']
  },
  {
    id: 'cat-house-2',
    category: 'house',
    title: 'งานทาสีตึกแถว / อาคารพาณิชย์ & ตกแต่งสีทูโทน',
    pageName: 'บริษัท ทาสีกัน จำกัด',
    priceEstimate: 'แพ็กเกจปรับปรุงตึกแถว',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'ผลงานรีโนเวททาสีตึกแถวพาณิชย์ 3-4 ชั้น เปลี่ยนโฉมอาคารเก่าให้ทันสมัย สะดุดตาลูกค้า พร้อมระบบกันซึมดาดฟ้ามาตรฐาน',
    tags: ['ตึกแถว', 'อาคารพาณิชย์', 'รีโนเวท']
  },
  {
    id: 'cat-house-3',
    category: 'house',
    title: 'งานแก้ไขปัญหาสีลอกล่อน รอยแตกลายงา และน้ำซึม',
    pageName: 'บริษัท ทาสีกัน จำกัด',
    priceEstimate: 'แก้ไขเฉพาะจุด + ทาสีทั้งหลัง',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    description: 'ขั้นตอนการขูดสีเก่าที่พองลอก อุดโป๊วรอยแยกด้วย PU Sealant เกรดช่างมืออาชีพ ทารองพื้นปูนเก่าสูตรเข้มข้น และลงสีทับหน้า 2 เที่ยว',
    tags: ['ซ่อมรอยร้าว', 'แก้สีลอก', 'กันซึม']
  },

  // 3. Condo Painting (RoomsPainting)
  {
    id: 'cat-condo-1',
    category: 'condo',
    title: 'ทาสีคอนโด สไตล์มินิมอล มูจิ (Warm White & Cream)',
    pageName: 'RoomsPainting',
    priceEstimate: 'เหมาห้อง เริ่มต้น 4,500 - 8,500 บ.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    description: 'ผลงานทาสีห้องคอนโด 1 Bedroom สไตล์มินิมอล ให้ห้องดูกว้างและอบอุ่น ไร้กลิ่นฉุน เข้าอยู่ได้ในวันเดียว เก็บงานสะอาด 100%',
    tags: ['คอนโด', 'มินิมอล', 'ไร้กลิ่น']
  },
  {
    id: 'cat-condo-2',
    category: 'condo',
    title: 'ผนังไฮไลท์ Accent Wall สีเอิร์ธโทนสุดหรู',
    pageName: 'RoomsPainting',
    priceEstimate: 'เฉพาะผนังไฮไลท์ 2,500 - 3,500 บ.',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    description: 'ทาสีเน้นผนังหลังโซฟาหรือหัวเตียง สี Sage Green / Deep Navy สร้างบรรยากาศโรงแรมหรูในห้องพักคอนโด',
    tags: ['Accent Wall', 'คอนโด', 'เอิร์ธโทน']
  },

  // 4. Color Chart & Standard Quotation Samples
  {
    id: 'cat-color-1',
    category: 'color_chart',
    title: 'ชาร์ตสียอดนิยม Earth Tone & Modern Luxury',
    pageName: 'ทาสีกัน & ช่างหมี',
    priceEstimate: 'เลือกเฉดสีได้ทุกเบอร์',
    imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    description: 'เฉดสีขายดีประจำปี 2026: ขาวควันบุหรี่, ครีมอุ่น, เทากลางโมเดิร์น, เขียวโอลีฟ และครีมทราย เข้ากับเฟอร์นิเจอร์ไม้ได้ทุกแบบ',
    tags: ['ชาร์ตสี', 'Earth Tone', 'เฉดสี']
  }
];

const STORAGE_KEY = 'omnisocial_portfolio_catalog_v1';

export function loadCatalogItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed loading catalog items from storage:', err);
  }
  return initialCatalogItems;
}

export function saveCatalogItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed saving catalog items to storage:', err);
  }
}
