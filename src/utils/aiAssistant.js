// AI Smart Sales & Conversation Intelligence Engine for OmniSocial & CRM
// Specialized for Painting, Renovation, and Texture Wall Services

/**
 * Analyzes the intent of a customer message
 */
export function analyzeMessageIntent(text) {
  const lower = (text || '').toLowerCase();

  if (lower.includes('โอน') || lower.includes('มัดจำ') || lower.includes('เลขบัญชี') || lower.includes('พร้อมทำ') || lower.includes('ตกลงทำ') || lower.includes('เอาช่างเลย')) {
    return {
      category: 'ClosingDeal',
      label: '🔥 พร้อมจอง / ขอเลขบัญชีมัดจำ',
      badgeColor: '#16a34a',
      priority: 'Highest',
      suggestedAction: 'ส่งเลขบัญชีบริษัท และออกใบนัดหมายคิวงานทันที'
    };
  }

  if (lower.includes('คิว') || lower.includes('วันไหน') || lower.includes('เข้าดู') || lower.includes('วัดหน้างาน') || lower.includes('วัดพื้นที่') || lower.includes('สะดวกวัน') || lower.includes('กี่วันเสร็จ')) {
    return {
      category: 'ScheduleVisit',
      label: '📅 นัดหมายสำรวจหน้างาน / เช็คคิวช่าง',
      badgeColor: '#8b5cf6',
      priority: 'High',
      suggestedAction: 'ตรวจสอบตารางคิวช่าง และเสนอวันเข้าสำรวจหน้างาน'
    };
  }

  if (lower.includes('ราคา') || lower.includes('เท่าไหร่') || lower.includes('ตรม') || lower.includes('ตร.ม.') || lower.includes('ตารางเมตร') || lower.includes('ประเมิน') || lower.includes('ค่าแรง') || lower.includes('กี่บาท')) {
    return {
      category: 'SalesInquiry',
      label: '💰 สอบถามราคา / ประเมินพื้นที่',
      badgeColor: '#2563eb',
      priority: 'Urgent',
      suggestedAction: 'ขอขนาดห้อง/จำนวนผนัง และเสนอราคาเบื้องต้นทันที'
    };
  }

  if (lower.includes('สี') || lower.includes('เฉด') || lower.includes('เทกเจอร์') || lower.includes('texture') || lower.includes('แคตตาล็อก') || lower.includes('แบบ') || lower.includes('ลาย')) {
    return {
      category: 'ColorConsult',
      label: '🎨 เลือกเฉดสี / ลายเทกเจอร์',
      badgeColor: '#ea580c',
      priority: 'Medium',
      suggestedAction: 'เปิด Catalog ส่งตัวอย่างชาร์ตสีและผลงานยอดนิยม'
    };
  }

  if (lower.includes('สปอนเซอร์') || lower.includes('เรทการ์ด') || lower.includes('รีวิว') || lower.includes('ติดต่อธุรกิจ')) {
    return {
      category: 'BusinessInquiry',
      label: '🤝 ติดต่องานธุรกิจ / สปอนเซอร์',
      badgeColor: '#ec4899',
      priority: 'High',
      suggestedAction: 'ขอข้อมูลบริษัทและอีเมลเพื่อจัดส่งข้อเสนอ'
    };
  }

  return {
    category: 'General',
    label: '💬 สอบถามข้อมูลทั่วไป',
    badgeColor: '#64748b',
    priority: 'Normal',
    suggestedAction: 'ทักทายต้อนรับและสอบถามลักษณะงานที่ต้องการทำ'
  };
}

/**
 * AI Chat TL;DR Summarizer: Extracts key project details, sizes, urgency & status
 */
export function generateChatSummary(lead) {
  if (!lead) return 'ยังไม่มีข้อมูลการสนทนา';

  const messages = Array.isArray(lead.messages) ? lead.messages : [];
  const allTexts = messages.map(m => m.text || '').join(' ') + ' ' + (lead.inquiry || '') + ' ' + (lead.notes || '');
  const lower = allTexts.toLowerCase();

  // 1. Identify Service Type
  let serviceType = 'งานบริการ';
  if (lower.includes('เทกเจอร์') || lower.includes('texture') || lower.includes('ฉาบ') || lower.includes('พ่น')) {
    serviceType = 'ทำผนังสีเทกเจอร์ (Texture Wall)';
  } else if (lower.includes('คอนโด') || lower.includes('ห้องชุด')) {
    serviceType = 'ทาสีคอนโดภายใน';
  } else if (lower.includes('บ้านเดี่ยว') || lower.includes('ทาวน์โฮม') || lower.includes('บ้าน')) {
    serviceType = 'ทาสีบ้านพักอาศัย';
  } else if (lower.includes('ตึก') || lower.includes('อาคาร') || lower.includes('ออฟฟิศ')) {
    serviceType = 'ทาสีอาคาร/สำนักงาน';
  } else {
    serviceType = 'ทาสีตกแต่งภายใน';
  }

  // 2. Identify Area / Size / Unit
  let sizeInfo = '';
  const sqmMatch = allTexts.match(/(\d+[\.,]?\d*)\s*(ตรม|ตร\.ม\.|ตารางเมตร|sqm|sq\.m)/i);
  const wallMatch = allTexts.match(/(\d+)\s*(ด้าน|ผนัง|จุด|ห้อง)/);
  if (sqmMatch) {
    sizeInfo = `พื้นที่ประมาณ ${sqmMatch[1]} ตร.ม.`;
  } else if (wallMatch) {
    sizeInfo = `${wallMatch[1]} ${wallMatch[2]}`;
  } else if (lower.includes('สตูดิโอ') || lower.includes('studio')) {
    sizeInfo = 'ห้อง Studio';
  } else if (lower.includes('1 bed') || lower.includes('1 ห้องนอน')) {
    sizeInfo = 'ห้อง 1 Bedroom';
  } else if (lower.includes('2 bed') || lower.includes('2 ห้องนอน')) {
    sizeInfo = 'ห้อง 2 Bedroom';
  }

  // 3. Identify Timeline / Deadline
  let timelineInfo = '';
  const dateMatch = allTexts.match(/(วันที่\s*\d{1,2}|สิ้นเดือน|อาทิตย์หน้า|สัปดาห์หน้า|พรุ่งนี้|ด่วน|ผู้เช่าเข้า|ย้ายเข้า)/);
  if (dateMatch) {
    timelineInfo = `กำหนดการ: ${dateMatch[0]}`;
  }

  // 4. Identify Current Next Step / Status
  let statusInfo = 'เพิ่งเริ่มต้นทักคุย';
  if (lead.status.includes('Won') || lead.status.includes('ปิดการขาย') || lower.includes('โอนแล้ว') || lower.includes('มัดจำแล้ว')) {
    statusInfo = '✅ ปิดการขายเรียบร้อย พร้อมจัดคิวงาน';
  } else if (lower.includes('วัดหน้างาน') || lower.includes('เข้าดูหน้างาน') || lower.includes('นัดวัน')) {
    statusInfo = 'กำลังรอนัดหมายสำรวจหน้างาน';
  } else if (lower.includes('บาท') || lower.includes('ราคา') || lead.dealValue > 0) {
    statusInfo = `ประเมินราคาแล้ว (ดีล ~฿${(lead.dealValue || 0).toLocaleString()}) รอลูกค้าคอนเฟิร์ม`;
  } else if (messages.length > 3) {
    statusInfo = 'กำลังปรึกษารายละเอียดและเฉดสี';
  }

  // Build clean concise TL;DR
  const parts = [serviceType];
  if (sizeInfo) parts.push(sizeInfo);
  if (timelineInfo) parts.push(timelineInfo);
  parts.push(statusInfo);

  return parts.join(' • ');
}

/**
 * Deal Closing Probability Engine (0% - 100%) & Buying Intent Analysis
 */
export function analyzeClosingScore(lead) {
  if (!lead) return { score: 30, tier: 'COOL', color: '#64748b', label: 'ทั่วไป', signals: [], recommendedNextStep: 'สอบถามรายละเอียดงาน' };

  if (lead.status.includes('Won') || lead.status.includes('ปิดการขาย')) {
    return {
      score: 100,
      tier: 'WON',
      color: '#16a34a',
      label: 'ปิดการขายสำเร็จแล้ว 🎉',
      signals: ['💰 มัดจำ/ชำระเงินแล้ว', '📅 ล็อกคิวช่างแล้ว', '🤝 ยืนยันทำงาน'],
      recommendedNextStep: 'ติดตามผลงานและส่งช่างเข้าทำงานตามกำหนด'
    };
  }

  if (lead.status.includes('Lost') || lead.status.includes('ไม่สนใจ')) {
    return {
      score: 10,
      tier: 'LOST',
      color: '#94a3b8',
      label: 'ปิดดีลไม่สำเร็จ',
      signals: ['❌ ลูกค้ายกเลิก/ไม่พร้อมทำ'],
      recommendedNextStep: 'เก็บข้อมูลไว้ติดตามผลในแคมเปญถัดไป'
    };
  }

  const messages = Array.isArray(lead.messages) ? lead.messages : [];
  const allTexts = messages.map(m => m.text || '').join(' ') + ' ' + (lead.inquiry || '');
  const lower = allTexts.toLowerCase();

  let score = 35; // base score for inbound lead
  const signals = [];

  // Signal: Asked for bank account / deposit / ready to book (+30%)
  if (lower.includes('เลขบัญชี') || lower.includes('โอน') || lower.includes('มัดจำ') || lower.includes('พร้อมทำ') || lower.includes('ตกลงทำ')) {
    score += 30;
    signals.push('💳 ขอเลขบัญชี / พร้อมมัดจำ');
  }

  // Signal: Asked for schedule / measurement date (+20%)
  if (lower.includes('คิว') || lower.includes('วันไหน') || lower.includes('วัดหน้างาน') || lower.includes('เข้าดูหน้างาน') || lower.includes('กี่วันเสร็จ')) {
    score += 20;
    signals.push('📅 ถามคิวช่าง / ขอนัดวันเข้าทำ');
  }

  // Signal: Urgency / Tenant moving in (+15%)
  if (lower.includes('ด่วน') || lower.includes('ผู้เช่า') || lower.includes('ย้ายเข้า') || lower.includes('วันที่') || lower.includes('อาทิตย์หน้า')) {
    score += 15;
    signals.push('⏱️ มีกำหนดการใช้งานห้องชัดเจน');
  }

  // Signal: Specified room size / floor / condo (+15%)
  if (lower.includes('ตรม') || lower.includes('ตร.ม.') || lower.includes('ชั้น') || lower.includes('คอนโด') || lower.includes('ด้าน')) {
    score += 15;
    signals.push('📐 ระบุขนาดห้อง/ตำแหน่งชัดเจน');
  }

  // Signal: Provided phone / contact / LINE (+10%)
  if (lead.contact && lead.contact !== 'Facebook Messenger' && lead.contact.length > 5) {
    score += 10;
    signals.push('📞 ให้เบอร์ติดต่อ / LINE ไว้แล้ว');
  }

  // Signal: Sent room photos or attachments (+10%)
  const hasCustomerPhotos = messages.some(m => m.sender === 'lead' && Array.isArray(m.attachments) && m.attachments.length > 0);
  if (hasCustomerPhotos) {
    score += 10;
    signals.push('📸 ส่งรูปสภาพห้องจริงมาให้ดู');
  }

  // Penalty: Inactive > 72 hours (-15%)
  const lastMsg = messages[messages.length - 1];
  const lastTime = lastMsg?.timestamp || lead.timestamp || 0;
  const hoursSince = lastTime ? (Date.now() - lastTime) / 3600000 : 0;
  if (hoursSince > 72 && lastMsg?.sender === 'admin') {
    score -= 15;
    signals.push('⏳ ลูกค้าเงียบไปเกิน 3 วัน');
  }

  // Clamp score
  score = Math.max(15, Math.min(95, score));

  let tier = 'WARM';
  let color = '#f59e0b';
  let label = 'โอกาสปานกลาง (Warm)';
  let recommendedNextStep = 'ส่งภาพตัวอย่างผลงานที่ใกล้เคียง และสอบถามขนาดพื้นที่';

  if (score >= 75) {
    tier = 'HOT';
    color = '#ef4444';
    label = '🔥 ร้อนแรงมาก (Hot Deal)';
    recommendedNextStep = 'ส่งใบเสนอราคาอย่างเป็นทางการ และขอคอนเฟิร์มวันล็อกคิวทันที!';
  } else if (score < 45) {
    tier = 'COOL';
    color = '#3b82f6';
    label = '❄️ เพิ่งเริ่มต้นสอบถาม (Inquiry)';
    recommendedNextStep = 'ทักทายอย่างอบอุ่นและส่งตัวอย่างชาร์ตสีให้ชม';
  }

  return {
    score,
    tier,
    color,
    label,
    signals,
    recommendedNextStep
  };
}

/**
 * Smart Follow-Up Reminder & Nudge Engine
 * Detects if the customer hasn't responded to the admin's last message
 */
export function detectFollowUpStatus(lead) {
  if (!lead) return { needsFollowUp: false };

  const messages = Array.isArray(lead.messages) ? lead.messages : [];
  if (messages.length === 0) return { needsFollowUp: false };

  const lastMsg = messages[messages.length - 1];
  // If the last sender was the customer, it's not a follow-up case (it's unreplied/waiting for admin)
  if (lastMsg.sender === 'lead') {
    return {
      needsFollowUp: false,
      waitingOn: 'admin',
      label: 'รอลูกค้าตอบ: ไม่ใช่ (รอแอดมินตอบ)'
    };
  }

  // Last sender was admin: calculate how long customer has been quiet
  const lastTime = lastMsg.timestamp || (lastMsg.created_time ? new Date(lastMsg.created_time).getTime() : lead.timestamp || Date.now());
  const elapsedMs = Math.max(0, Date.now() - lastTime);
  const hoursElapsed = Math.floor(elapsedMs / (1000 * 60 * 60));
  const daysElapsed = Math.floor(hoursElapsed / 24);

  // Consider follow-up needed if > 18 hours have passed without reply
  const needsFollowUp = hoursElapsed >= 18 && !lead.status.includes('Won') && !lead.status.includes('Lost');

  let urgency = 'low';
  let badgeColor = '#f59e0b';
  let badgeText = `${hoursElapsed} ชม.`;

  if (daysElapsed >= 3) {
    urgency = 'high';
    badgeColor = '#dc2626';
    badgeText = `${daysElapsed} วัน`;
  } else if (daysElapsed >= 1) {
    urgency = 'medium';
    badgeColor = '#ea580c';
    badgeText = `${daysElapsed} วัน`;
  }

  const customerName = lead.name.replace(/\(.*?\)/g, '').trim() || 'คุณลูกค้า';

  // Smart Pre-written Tailored Follow-up Templates
  const templates = [
    {
      id: 'nudge_schedule',
      title: '📅 ทักสอบถามคิวงาน (Lock Schedule)',
      shortDesc: 'แจ้งเตือนเรื่องคิวช่างกำลังเต็ม',
      text: `สวัสดีครับคุณ${customerName} ทางทีมขออนุญาตสอบถามเพิ่มเติมเรื่องงานทาสีห้องนะครับ พอดีทางทีมช่างกำลังจัดตารางคิวงานสัปดาห์นี้ หากคุณ${customerName} ได้วันเวลาที่สะดวกแล้ว สามารถแจ้งล็อกคิวไว้ก่อนได้เลยนะครับ จะได้ล็อกทีมช่างชุดดีที่สุดไว้ให้ครับผม 😊✨`
    },
    {
      id: 'nudge_promo',
      title: '🎁 ส่งส่วนลดพิเศษกระตุ้น (Special Promo)',
      shortDesc: 'มอบส่วนลดค่าสำรวจ/ค่าอุปกรณ์',
      text: `สวัสดีครับคุณ${customerName} พอดีทางเรามีโปรโมชั่นพิเศษประจำเดือนสำหรับงานทาสี/เทกเจอร์ มอบส่วนลดพิเศษค่าสำรวจหน้างาน หรือแถมฟรีเก็บงานจุดบกพร่องเพิ่มให้อีก 1 จุด หากคอนเฟิร์มคิวภายในสัปดาห์นี้ครับ สนใจรับสิทธิ์โปรนี้ไว้ก่อนไหมครับ 🚀`
    },
    {
      id: 'nudge_samples',
      title: '🎨 ส่งรูปรีวิวตัวอย่างเฉดสี (Showcase)',
      shortDesc: 'ส่งไอเดียห้องจริงที่เพิ่งทำเสร็จ',
      text: `สวัสดีครับคุณ${customerName} วันนี้นำภาพรีวิวผลงานห้องที่เพิ่งส่งมอบงานสไตล์ใกล้เคียงกันมาฝากให้ชมเป็นไอเดียครับ ผนังเน้นคุมโทน สบายตาและสวยหรูมากๆ หากมีข้อสงสัยเรื่องการเลือกโทนสี สามารถปรึกษาทางช่างได้ฟรีตลอดเลยนะครับ 🏡`
    }
  ];

  return {
    needsFollowUp,
    hoursElapsed,
    daysElapsed,
    urgency,
    badgeColor,
    badgeText,
    templates,
    lastAdminReplyTime: lastTime
  };
}

/**
 * Generates an AI Draft Reply with context from painting and renovation services
 */
export function generateAIDraftReply(lead, customInstruction = '') {
  if (!lead) return 'สวัสดีครับ ยินดีให้บริการครับ มีอะไรให้ทางทีมช่างดูแลเพิ่มเติมแจ้งได้เลยนะครับ 😊';

  const lastInquiry = lead.messages && lead.messages.length > 0
    ? lead.messages[lead.messages.length - 1].text
    : lead.inquiry;

  const intent = analyzeMessageIntent(lastInquiry);
  const isComment = lead.sourceType === 'video_comment' || lead.sourceType === 'post_comment';
  const customerName = lead.name.replace(/\(.*?\)/g, '').trim() || 'คุณลูกค้า';

  // 1. Ready to Book / Asking for Bank Account
  if (intent.category === 'ClosingDeal') {
    return `สวัสดีครับคุณ${customerName} ยินดีมากๆ ครับ! ทางบริษัท ทาสีกัน จำกัด ขออนุญาตส่งเลขที่บัญชีสำหรับมัดจำล็อกคิวงานให้นะครับ:\n\n🏦 ธนาคารกสิกรไทย (K-Bank)\nเลขบัญชี: xxx-x-xxxxx-x\nชื่อบัญชี: บจก. ทาสีกัน\n\nเมื่อโอนเรียบร้อยแล้วสามารถแนบสลิปพร้อมแจ้งชื่อ-เบอร์โทร และที่อยู่หน้างานได้เลยนะครับ ทางทีมจะออกเอกสารยืนยันนัดหมายให้ทันทีครับผม 🙏✨`;
  }

  // 2. Schedule Visit / Check Queue
  if (intent.category === 'ScheduleVisit') {
    return `สวัสดีครับคุณ${customerName} ทางทีมสามารถส่งช่างเข้าสำรวจหน้างานและวัดพื้นที่จริงได้เลยครับ ช่วงนี้มีคิวสำรวจสะดวกเป็นช่วงบ่ายของวันพุธ และวันเสาร์ครับ คุณ${customerName} สะดวกเป็นวันไหนและช่วงเวลากี่โมงดีครับ เดี๋ยวทางเราจัดตารางล็อกคิวช่างไว้ให้ก่อนครับ 📅`;
  }

  // 3. Price & Quotation Inquiry
  if (intent.category === 'SalesInquiry') {
    if (isComment) {
      return `สวัสดีครับคุณ${customerName} ทางทีมทักแชท Inbox ส่งรายละเอียดราคาประเมินและภาพผลงานตัวอย่างจริงให้เรียบร้อยแล้วนะครับ สามารถคลิกเช็กข้อความใน Inbox ได้เลยครับผม 😊`;
    }
    return `สวัสดีครับคุณ${customerName} สำหรับงานทาสี/พ่นสีเทกเจอร์ ราคาเริ่มต้นที่ตร.ม. ละประมาณ 250 - 450 บาท (รวมค่าสีเกรดพรีเมียมและค่าแรงช่างมืออาชีพแล้วครับ) รบกวนขอทราบขนาดห้องคร่าวๆ (ตร.ม.) หรือส่งรูปผนังจริงให้ทางช่างช่วยประเมินราคาเน็ตๆ ให้ได้เลยนะครับ 🎨`;
  }

  // 4. Color & Texture Catalog
  if (intent.category === 'ColorConsult') {
    return `สวัสดีครับคุณ${customerName} ทางเรามีชาร์ตเฉดสียอดนิยม Earth Tone, Modern Luxury และตัวอย่างลวดลาย Texture ให้เลือกเยอะมากๆ เลยครับ ทางช่างขออนุญาตส่งแคตตาล็อกให้ชมในนี้นะครับ สามารถเลือกโทนสีที่ชอบแล้วส่งให้เราประเมินคู่สีได้เลยครับ ✨`;
  }

  // 5. Default General
  return `สวัสดีครับคุณ${customerName} ขอบคุณที่ติดต่อเข้ามานะครับ ทางทีมช่างยินดีให้คำแนะนำและประเมินราคาให้ฟรีครับ ไม่ทราบว่าสนใจทำเป็นงานทาสีห้องคอนโด บ้านเดี่ยว หรือพ่นสีเทกเจอร์ตกแต่งผนังครับ? 😊`;
}
