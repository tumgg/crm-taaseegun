// AI Smart Assistant Engine for OmniSocial Hub

export function analyzeMessageIntent(text) {
  const lower = (text || '').toLowerCase();
  
  if (lower.includes('สปอนเซอร์') || lower.includes('เรทการ์ด') || lower.includes('rate card') || lower.includes('จ้าง') || lower.includes('งานจ้าง') || lower.includes('รีวิว')) {
    return {
      category: 'Sponsorship',
      label: '🤝 สนใจลงโฆษณา / สปอนเซอร์',
      badgeColor: '#ec4899',
      priority: 'High',
      suggestedAction: 'ส่ง Rate Card 2026 และขออีเมลติดต่อประสานงาน'
    };
  }

  if (lower.includes('ราคาส่ง') || lower.includes('จำนวน') || lower.includes('ชิ้น') || lower.includes('ตัวแทน') || lower.includes('ใบกำกับภาษี')) {
    return {
      category: 'Wholesale',
      label: '📦 สอบถามราคาส่ง / B2B',
      badgeColor: '#8b5cf6',
      priority: 'High',
      suggestedAction: 'ส่งตาราง Tier ราคาส่ง และขอชื่อบริษัทออกใบเสนอราคา'
    };
  }

  if (lower.includes('ราคา') || lower.includes('เท่าไหร่') || lower.includes('มีของไหม') || lower.includes('สั่งซื้อ') || lower.includes('พร้อมส่ง') || lower.includes('พิกัด')) {
    return {
      category: 'SalesInquiry',
      label: '🛒 สอบถามราคา / สนใจซื้อสินค้า',
      badgeColor: '#3b82f6',
      priority: 'Urgent',
      suggestedAction: 'แจ้งราคาโปรโมชั่น พร้อมลิงก์หรือขั้นตอนชำระเงินทันที'
    };
  }

  if (lower.includes('คอร์ส') || lower.includes('เรียน') || lower.includes('สอน') || lower.includes('รอบ')) {
    return {
      category: 'Education',
      label: '🎓 สนใจคอร์สเรียน / อบรม',
      badgeColor: '#10b981',
      priority: 'Medium',
      suggestedAction: 'ส่งรายละเอียดหลักสูตร และวันเปิดรับสมัคร'
    };
  }

  return {
    category: 'General',
    label: '💬 สอบถามข้อมูลทั่วไป',
    badgeColor: '#64748b',
    priority: 'Normal',
    suggestedAction: 'ทักทายต้อนรับและสอบถามความต้องการเพิ่มเติม'
  };
}

export function generateAIDraftReply(lead, customInstruction = '') {
  if (!lead) return 'สวัสดีครับ ยินดีให้บริการครับ มีอะไรให้ทางเราดูแลเพิ่มเติมแจ้งได้เลยนะครับ 😊';

  const lastInquiry = lead.messages && lead.messages.length > 0
    ? lead.messages[lead.messages.length - 1].text
    : lead.inquiry;

  const intent = analyzeMessageIntent(lastInquiry);
  const isComment = lead.sourceType === 'video_comment' || lead.sourceType === 'post_comment';
  const customerName = lead.name.replace(/\(.*?\)/g, '').trim();

  // Sponsorship draft
  if (intent.category === 'Sponsorship') {
    return `สวัสดีครับ${customerName} ยินดีมากๆ ครับ! ทางทีมได้แนบ Rate Card 2026 พร้อมสถิติ Demographic ของช่องให้พิจารณาเรียบร้อยครับ หากมีบรีฟหรือวันเวลาที่ต้องการลงคลิป/โพสต์ สามารถแจ้งเบื้องต้นได้เลยนะครับ เพื่อที่ทางทีมจะได้ล็อคคิวให้ก่อนครับผม 😊`;
  }

  // Wholesale draft
  if (intent.category === 'Wholesale') {
    return `สวัสดีครับ${customerName} ขอบคุณที่สนใจสั่งซื้อราคาส่งครับ สินค้ามีของพร้อมส่งจากไทย สามารถออกใบกำกับภาษีเต็มรูปแบบได้ครับ ทางเราขออนุญาตส่งตารางราคาส่งตามจำนวนชิ้นให้ในนี้เลยนะครับ สะดวกให้จัดส่งใบเสนอราคาอย่างเป็นทางการทางอีเมลด้วยไหมครับ? 📦`;
  }

  // Sales / Price Inquiry draft
  if (intent.category === 'SalesInquiry') {
    if (isComment) {
      return `สวัสดีครับคุณ${customerName} สินค้ารุ่นนี้มีของพร้อมส่งเลยครับ จัดส่งด่วน Flash Express ถึงใน 1-2 วันครับผม ทางทีมทักแชท Inbox ส่งรายละเอียดราคาโปรโมชั่นและโค้ดลดให้เรียบร้อยแล้วนะครับ สามารถเช็กแชทได้เลยครับ ✨`;
    }
    return `สวัสดีครับ${customerName} สินค้ารุ่นนี้มีของพร้อมส่งเลยครับ ราคาพิเศษช่วงนี้จัดโปรโมชั่นลดเหลือเพียง ฿${lead.dealValue ? lead.dealValue.toLocaleString() : 'พิเศษ'} ส่งฟรีทั่วประเทศครับ สนใจรับเป็นเซ็ตนี้เลยไหมครับ แจ้งชื่อ-ที่อยู่จัดส่งได้เลยนะครับ 🚀`;
  }

  // Course / Mentoring draft
  if (intent.category === 'Education') {
    return `สวัสดีครับ${customerName} ขอบคุณที่สนใจหลักสูตรครับ ตอนนี้รุ่นใหม่กำลังเปิดรับจำนวนจำกัด 2 ที่สุดท้ายครับ ทางเราขออนุญาตส่ง Outline เนื้อหาให้พิจารณา และสามารถนัดหมายคุยวิดีโอคอลแนะนำก่อนตัดสินใจได้นะครับ สะดวกช่วงวันไหนแจ้งได้เลยครับผม 🎓`;
  }

  // General default
  return `สวัสดีครับ${customerName} ขอบคุณที่ติดต่อเข้ามานะครับ ทางเรายินดีให้คำแนะนำและข้อมูลเพิ่มเติมอย่างเต็มที่ครับ สามารถแจ้งสิ่งที่ต้องการสอบถามหรือรายละเอียดเพิ่มเติมได้เลยนะครับ 😊`;
}
