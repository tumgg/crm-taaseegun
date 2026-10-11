// Date and Timezone Utilities for Asia/Bangkok (UTC+7)

/**
 * Formats a date or timestamp into ISO 8601 with Asia/Bangkok offset (+07:00)
 * Example: 2026-10-11T22:30:00+07:00
 */
export function toBangkokIso(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  // UTC time in ms + 7 hours (7 * 3600 * 1000 ms)
  const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
  const bangkokDate = new Date(date.getTime() + BANGKOK_OFFSET_MS);

  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = bangkokDate.getUTCFullYear();
  const mm = pad(bangkokDate.getUTCMonth() + 1);
  const dd = pad(bangkokDate.getUTCDate());
  const hh = pad(bangkokDate.getUTCHours());
  const min = pad(bangkokDate.getUTCMinutes());
  const ss = pad(bangkokDate.getUTCSeconds());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}+07:00`;
}

/**
 * Returns YYYY-MM-DD string in Asia/Bangkok timezone
 */
export function getBangkokDateString(dateInput = new Date()) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
  const bangkokDate = new Date(date.getTime() + BANGKOK_OFFSET_MS);

  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = bangkokDate.getUTCFullYear();
  const mm = pad(bangkokDate.getUTCMonth() + 1);
  const dd = pad(bangkokDate.getUTCDate());

  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculates whether a conversation has been answered by admin
 * and waiting time in minutes according to specification.
 *
 * Rules:
 * - find last_customer_message_at
 * - find last_admin_message_at (or is_echo=true or from page)
 * - if last_admin_message_at > last_customer_message_at => answered = true
 * - if last_customer_message_at > last_admin_message_at => answered = false
 * - waiting_minutes counted from last_customer_message_at to current time
 * - never rely on unread_count alone
 */
export function calculateWaitingMetrics(messages, pageId, now = Date.now()) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      answered: true,
      waiting_minutes: 0,
      last_message_at: null,
      last_customer_message_at: null,
      last_admin_message_at: null
    };
  }

  let lastCustomerTime = 0;
  let lastCustomerIso = null;
  let lastAdminTime = 0;
  let lastAdminIso = null;
  let lastMessageTime = 0;
  let lastMessageIso = null;

  messages.forEach(msg => {
    const rawTime = msg.created_time || msg.created_at || msg.timestamp;
    const msgDate = rawTime ? new Date(rawTime) : null;
    const msgTime = (msgDate && !isNaN(msgDate.getTime())) ? msgDate.getTime() : 0;
    if (!msgTime) return;

    if (msgTime > lastMessageTime) {
      lastMessageTime = msgTime;
      lastMessageIso = toBangkokIso(msgTime);
    }

    const isFromAdmin = msg.sender === 'admin' ||
      msg.sender_type === 'admin' ||
      msg.sender_type === 'page' ||
      msg.from?.id === pageId ||
      msg.is_echo === true;

    if (isFromAdmin) {
      if (msgTime > lastAdminTime) {
        lastAdminTime = msgTime;
        lastAdminIso = toBangkokIso(msgTime);
      }
    } else {
      if (msgTime > lastCustomerTime) {
        lastCustomerTime = msgTime;
        lastCustomerIso = toBangkokIso(msgTime);
      }
    }
  });

  let answered = true;
  let waitingMinutes = 0;

  if (lastCustomerTime > 0) {
    if (lastAdminTime === 0) {
      // Customer wrote, no admin reply yet
      answered = false;
      waitingMinutes = Math.max(0, Math.floor((now - lastCustomerTime) / (60 * 1000)));
    } else if (lastCustomerTime > lastAdminTime) {
      // Customer wrote after last admin reply
      answered = false;
      waitingMinutes = Math.max(0, Math.floor((now - lastCustomerTime) / (60 * 1000)));
    } else {
      // Admin replied after last customer message
      answered = true;
      waitingMinutes = 0;
    }
  } else {
    // No customer messages (admin initiated only)
    answered = true;
    waitingMinutes = 0;
  }

  return {
    answered,
    waiting_minutes: waitingMinutes,
    last_message_at: lastMessageIso,
    last_customer_message_at: lastCustomerIso,
    last_admin_message_at: lastAdminIso
  };
}
