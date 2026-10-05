// Saved Replies (การตอบกลับที่บันทึกไว้) Data Store
// Tailored for Facebook Business Suite / OmniSocial Live Chat
// Stores standard answers, promotional messages, and paint spec photos

export const initialSavedReplies = [
  {
    id: 'sr-1',
    title: 'TOA ซุปเปอร์ชิลด์ ดูราคลีน A+',
    category: 'สเปกสี',
    isFrequent: true,
    imageUrl: '/images/toa_duraclean_a_plus.jpg',
    text: 'สีที่ใช้ TOA ซุปเปอร์ชิลด์ ดูราคลีน A+ เกรดพรีเมียมคุณภาพสูง เช็ดล้างทำความสะอาดได้ปลอดภัย ไร้แบคทีเรีย ไร้กลิ่น ช่วยยับยั้งแบคทีเรียและเชื้อราได้ค่ะ เกรดเดียวกับที่ใช้ในโรงพยาบาล นะคะ'
  },
  {
    id: 'sr-2',
    title: 'ขอภาพ ประเมินราคา',
    category: 'ขอข้อมูลหน้างาน',
    isFrequent: true,
    imageUrl: null,
    text: 'เพื่อใช้ประเมินราคา รบกวนลูกค้าส่งรูปผนังห้องหรือมุมกว้าง ๆ ให้ดูหน่อยได้ไหมคะ'
  },
  {
    id: 'sr-3',
    title: 'โปรโมชั่น ห้องใหม่',
    category: 'โปรโมชั่น',
    isFrequent: true,
    imageUrl: '/images/condo_painting_promo.jpg',
    text: 'โปรโมชั่น เริ่มต้นที่ ราคา 8500 บาท สำหรับ .. คอนโด ห้องใหม่ .. ขนาดไม่เกิน 30ตารางเมตร เป็นห้องเปล่า ไม่มีของในห้อง สีเดิมทาไว้ไม่เกิน 6 เดือนค่ะ ช่างจะทาให้เฉพาะสีจริงนะคะ ลูกค้าสามารถเลือกเฉดสีเองได้ ไม่รวมระเบียง ฝ้า ประตู วงกบ บัว ห้องน้ำ ค่ะ'
  },
  {
    id: 'sr-4',
    title: 'สีเทกเจอร์ Travertine หินอ่อนธรรมชาติ',
    category: 'สีเทกเจอร์',
    isFrequent: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    text: 'งานสีเทกเจอร์ลาย Travertine สไตล์หินอ่อนธรรมชาติ เรียบหรูคลาสสิก ป้องกันเชื้อราและคราบตะไคร่น้ำ ราคาเริ่มต้นประมาณ 1,100 บาท/ตร.ม. (รวมค่าแรงช่างเทกเจอร์เฉพาะทางและวัสดุสีเกรดพรีเมียม) มีรับประกันผลงานค่ะ ✨'
  },
  {
    id: 'sr-5',
    title: 'สีพ่นหินทราย Sandstone ผิวธรรมชาติ',
    category: 'สีเทกเจอร์',
    isFrequent: false,
    imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    text: 'สีพ่นเทกเจอร์ลายหินทราย Sandstone ผิวสัมผัสเม็ดทรายธรรมชาติ ทนแดดทนฝน ไม่หลุดล่อนง่าย เม็ดละเอียดช่วยพรางรอยต่อและผิวผนังที่ไม่สม่ำเสมอได้ดี ราคาเริ่มต้นเพียง 650 บาท/ตร.ม. ค่ะ 🧱'
  },
  {
    id: 'sr-6',
    title: 'นัดคิวดูหน้างาน & วัดพื้นที่จริง',
    category: 'นัดหมาย',
    isFrequent: true,
    imageUrl: null,
    text: 'ทีมช่างสามารถเข้าดูหน้างานและวัดพื้นที่จริงเพื่อทำใบเสนอราคาอย่างละเอียดได้ค่ะ สะดวกเป็นวันและช่วงเวลาไหนดีคะ พร้อมขอแชร์โลเคชั่นและเบอร์โทรติดต่อกลับไว้ได้เลยนะคะ 📍📞'
  },
  {
    id: 'sr-7',
    title: 'เงื่อนไขชำระเงิน & มัดจำล็อกคิวงาน',
    category: 'ชำระเงิน',
    isFrequent: false,
    imageUrl: null,
    text: 'เงื่อนไขการดำเนินงาน: ชำระมัดจำ 30-50% เพื่อล็อกคิวทีมช่างและเตรียมสั่งเบิกสี/วัสดุ ชำระส่วนที่เหลือเมื่องานแล้วเสร็จและตรวจรับมอบงานเรียบร้อย มีการรับประกันผลงานตามสัญญาค่ะ 🤝'
  }
];

export const SAVED_REPLY_CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'frequent', label: 'ใช้บ่อย' },
  { id: 'สเปกสี', label: 'สเปกสี / TOA' },
  { id: 'ขอข้อมูลหน้างาน', label: 'ขอข้อมูลหน้างาน' },
  { id: 'โปรโมชั่น', label: 'โปรโมชั่น' },
  { id: 'สีเทกเจอร์', label: 'สีเทกเจอร์' },
  { id: 'นัดหมาย', label: 'นัดหมาย' },
  { id: 'ชำระเงิน', label: 'ชำระเงิน' }
];

const STORAGE_KEY = 'omnisocial_saved_replies_v2';

export function loadSavedReplies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed loading saved replies from storage:', err);
  }
  return initialSavedReplies;
}

export function saveSavedReplies(replies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
  } catch (err) {
    console.warn('Failed saving saved replies to storage:', err);
  }
}
