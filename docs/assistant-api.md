# OmniSocial Secure Assistant API Documentation

เอกสารข้อกำหนดและการใช้งาน **OmniSocial Secure Assistant API** สำหรับ AI Assistant ภายนอก (เช่น สมหญิง, Claude, ChatGPT, LINE Bot, Telegram Bot) เพื่ออ่านข้อมูลสถิติลีด ประวัติการสนทนา สถานะการตอบกลับ และห้องแชทแบบ **Read-only** 100% ภายใต้มาตรฐานความปลอดภัยระดับองค์กร

---

## 1. ข้อกำหนดและสถาปัตยกรรมความปลอดภัย (Security Architecture)

1. **Authentication:** ทุกคำขอต้องแนบ Header `X-Assistant-API-Key`
2. **Timing-Safe Key Comparison:** ระบบเปรียบเทียบ Key ฝั่ง Server ด้วย `crypto.timingSafeEqual` เพื่อป้องกัน Side-channel Timing Attack
3. **Zero Secrets in Response:** ห้ามและไม่มีการส่ง Facebook Page Access Token, Supabase Service Key หรือ Secret ใดๆ ออกไปใน Response
4. **Strictly Read-Only:** อนุญาตเฉพาะ `GET` HTTP Method เท่านั้น (หากส่ง `POST`, `PUT`, `DELETE` ระบบจะตอบ `405 Method Not Allowed`)
5. **Rate Limiting:** จำกัดอัตราการเรียกสูงสุด 60 ครั้งต่อนาที (Requests / Minute) ต่อ IP / API Key หากเกินจะตอบ `429 Too Many Requests`
6. **Timezone & Date Standard:** ข้อมูลเวลาทั้งหมดใช้มาตรฐาน **ISO 8601** พร้อมระบุเขตเวลา **Asia/Bangkok (+07:00)** เช่น `2026-10-11T22:30:00+07:00`
7. **Strict Security Headers:**
   - `Content-Security-Policy: default-src 'self' ...`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 2. การตั้งค่า Environment Variables บน Vercel

ในการเปิดใช้งาน Assistant API ให้ตั้งค่า Environment Variable บน Vercel Dashboard (`Settings -> Environment Variables`):

| Variable Name | Environment | Description | ตัวอย่าง |
| :--- | :--- | :--- | :--- |
| `ASSISTANT_API_KEY` | Production, Preview | คีย์ความลับสำหรับให้ AI Assistant ส่งผ่าน Header `X-Assistant-API-Key` | `ast_live_a8f93b2c1e7...` |
| `FB_TOKEN_GOOD_VIBES` | Production | Page Access Token เพจ Good Vibes | `EAA...` (Secret) |
| `FB_TOKEN_TAASEEGUN` | Production | Page Access Token เพจ ทาสีกัน | `EAA...` (Secret) |
| `FB_TOKEN_ROOMS_PAINTING` | Production | Page Access Token เพจ RoomsPainting | `EAA...` (Secret) |
| `FB_TOKEN_TEXTURE_BEAR` | Production | Page Access Token เพจ ช่างหมี Texture Bear | `EAA...` (Secret) |

---

## 3. รายชื่อ Endpoint ทั้งหมด (Endpoints Overview)

Base URL: `https://crm-taaseegun.vercel.app`

| Endpoint | Method | คำอธิบาย |
| :--- | :---: | :--- |
| `/api/assistant/health` | `GET` | ตรวจสอบสถานะความพร้อมของระบบ เวลาซิงก์ล่าสุด และจำนวนเพจที่เชื่อมต่อ |
| `/api/assistant/pages` | `GET` | รายชื่อเพจทั้งหมด 4 เพจ สถานะ และเวลาซิงก์ (ไม่มี Token) |
| `/api/assistant/inbox-summary` | `GET` | สรุปภาพรวม Inbox ประจำวัน ยอดรวม ตอบแล้ว/ยังไม่ตอบ รอนานเกิน 60 นาที |
| `/api/assistant/conversations` | `GET` | รายการห้องสนทนา คัดกรองตามสถานะ วันที่ เพจ พร้อมคำนวณเวลาการรอ |
| `/api/assistant/conversations/:id/messages` | `GET` | ดึงประวัติข้อความของห้องแชทที่ระบุ พร้อมไฟล์แนบ |
| `/api/assistant/alerts` | `GET` | รายการห้องที่ลูกค้ากำลังรอตอบเกินเวลาที่กำหนด (เช่น เกิน 60 นาที) |
| `/api/assistant/leads` | `GET` | รายชื่อ Lead และสถานะติดตามลูกค้าจาก Supabase CRM |

---

## 4. รายละเอียดแต่ละ Endpoint

### 4.1 GET `/api/assistant/health`
ตรวจสุขภาพของระบบ Backend

- **Query Parameters:** ไม่มี
- **Header:** `X-Assistant-API-Key: <YOUR_KEY>`
- **Response Example (200 OK):**
```json
{
  "status": "healthy",
  "service": "OmniSocial Secure Assistant API",
  "version": "1.0.0",
  "timestamp": "2026-10-11T22:30:00+07:00",
  "timezone": "Asia/Bangkok",
  "connected_pages_count": 4,
  "total_configured_pages": 4,
  "last_sync_at": "2026-10-11T22:30:00+07:00",
  "storage": {
    "supabase_connected": true,
    "facebook_graph_api": "active"
  }
}
```

---

### 4.2 GET `/api/assistant/pages`
ดึงรายชื่อเพจ Facebook ทั้งหมดที่ระบบบริหารจัดการ

- **Query Parameters:** ไม่มี
- **Header:** `X-Assistant-API-Key: <YOUR_KEY>`
- **Response Example (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-10-11T22:30:00+07:00",
  "count": 4,
  "pages": [
    {
      "page_id": "113532784994486",
      "page_name": "รับพ่นสี Texture By Good Vibes",
      "status": "active",
      "last_sync_at": "2026-10-11T22:30:00+07:00"
    },
    {
      "page_id": "110842514841725",
      "page_name": "บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี",
      "status": "active",
      "last_sync_at": "2026-10-11T22:30:00+07:00"
    },
    {
      "page_id": "100873871740668",
      "page_name": "ทาสีคอนโด ทาสีภายใน - RoomsPainting",
      "status": "active",
      "last_sync_at": "2026-10-11T22:30:00+07:00"
    },
    {
      "page_id": "101038208390600",
      "page_name": "รับทำสีเทกเจอร์ by ช่างหมี",
      "status": "active",
      "last_sync_at": "2026-10-11T22:30:00+07:00"
    }
  ]
}
```

---

### 4.3 GET `/api/assistant/inbox-summary`
สรุปภาพรวม Inbox ตามวัน และสรุปสถานะการตอบ

- **Query Parameters:**
  - `date`: วันที่ต้องการสรุป รูปแบบ `YYYY-MM-DD` ในเขตเวลา Asia/Bangkok (Optional เช่น `2026-10-11`)
  - `timezone`: เขตเวลา (Default: `Asia/Bangkok`)
  - `page_id`: รหัสเพจที่ต้องการกรอง (Optional)
- **Header:** `X-Assistant-API-Key: <YOUR_KEY>`
- **Response Example (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-10-11T22:30:00+07:00",
  "timezone": "Asia/Bangkok",
  "filter": {
    "date": "2026-10-11",
    "page_id": "all"
  },
  "summary": {
    "total_customers": 42,
    "new_customers_count": 8,
    "answered_count": 39,
    "unanswered_count": 3,
    "waiting_over_60_min_count": 1
  },
  "by_page": [
    {
      "page_id": "113532784994486",
      "page_name": "รับพ่นสี Texture By Good Vibes",
      "total": 15,
      "answered": 14,
      "unanswered": 1,
      "waiting_over_60_min": 0
    },
    {
      "page_id": "110842514841725",
      "page_name": "บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี",
      "total": 12,
      "answered": 11,
      "unanswered": 1,
      "waiting_over_60_min": 1
    }
  ],
  "conversations": [
    {
      "conversation_id": "t_2599960257109025",
      "page_id": "113532784994486",
      "page_name": "รับพ่นสี Texture By Good Vibes",
      "customer_name": "คุณสมชาย",
      "last_message_preview": "สนใจประเมินราคาผนัง 50 ตร.ม. ครับ",
      "last_message_at": "2026-10-11T21:40:00+07:00",
      "answered": false,
      "waiting_minutes": 50,
      "lead_status": "ทักใหม่ (New)"
    }
  ]
}
```

---

### 4.4 GET `/api/assistant/conversations`
ดึงรายการห้องสนทนา พร้อมสถานะการตอบและระยะเวลาที่ลูกค้ารอ

- **Query Parameters:**
  - `status`: `all` | `answered` | `unanswered` (Default: `all`)
  - `date`: รูปแบบ `YYYY-MM-DD` (Optional)
  - `page_id`: รหัสเพจ (Optional)
  - `updated_since`: วันที่อัปเดตล่าสุด ISO 8601 (Optional)
  - `limit`: จำนวนรายการ (Default: `20`, Max: `100`)
  - `cursor`: หมายเลข Pagination Offset (Optional)
- **Header:** `X-Assistant-API-Key: <YOUR_KEY>`
- **Response Example (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-10-11T22:30:00+07:00",
  "count": 1,
  "total": 1,
  "next_cursor": null,
  "conversations": [
    {
      "conversation_id": "t_2599960257109025",
      "page_id": "113532784994486",
      "page_name": "รับพ่นสี Texture By Good Vibes",
      "customer_id": "28784055277880598",
      "customer_name": "คุณสมชาย ตัวอย่าง",
      "customer_email": null,
      "profile_picture_url": "https://example.com/avatar.jpg",
      "last_message_preview": "สนใจฉาบเทกเจอร์ลายหินอ่อนครับ",
      "last_message_at": "2026-10-11T21:15:00+07:00",
      "last_customer_message_at": "2026-10-11T21:15:00+07:00",
      "last_admin_message_at": "2026-10-11T20:50:00+07:00",
      "answered": false,
      "waiting_minutes": 75,
      "unread_count": 1,
      "lead_status": "ทักใหม่ (New)",
      "tags": ["ลูกค้าเพจจริง"],
      "assigned_admin": "ช่างเสือ ทาสี"
    }
  ]
}
```

---

### 4.5 GET `/api/assistant/conversations/:conversationId/messages`
ดึงข้อความสนทนาทั้งหมดของห้องแชท

- **Query Parameters:**
  - `limit`: จำนวนข้อความ (Default: `50`, Max: `100`)
  - `before`: Cursor สำหรับดึงข้อความก่อนหน้า (Optional)
  - `after`: Cursor สำหรับดึงข้อความถัดไป (Optional)
  - `page_id`: รหัสเพจ (Optional หากทราบ)
- **Header:** `X-Assistant-API-Key: <YOUR_KEY>`
- **Response Example (200 OK):**
```json
{
  "success": true,
  "conversation_id": "t_2599960257109025",
  "page_id": "113532784994486",
  "count": 2,
  "messages": [
    {
      "message_id": "m_001",
      "conversation_id": "t_2599960257109025",
      "sender_type": "customer",
      "sender_name": "คุณสมชาย ตัวอย่าง",
      "message": "สวัสดีครับ ขอดูตัวอย่างผลงานหน่อยครับ",
      "created_at": "2026-10-11T20:45:00+07:00",
      "timestamp": 1791733500000,
      "attachments": [],
      "is_echo": false,
      "reply_to_message_id": null
    },
    {
      "message_id": "m_002",
      "conversation_id": "t_2599960257109025",
      "sender_type": "page",
      "sender_name": "รับพ่นสี Texture By Good Vibes",
      "message": "สวัสดีค่ะ ยินดีส่งผลงานให้ชมทางนี้นะคะ",
      "created_at": "2026-10-11T20:50:00+07:00",
      "timestamp": 1791733800000,
      "attachments": [
        {
          "id": "att-123",
          "type": "image",
          "mimeType": "image/jpeg",
          "name": "รูปภาพ",
          "url": "https://example.com/sample.jpg",
          "previewUrl": "https://example.com/sample.jpg",
          "isSticker": false
        }
      ],
      "is_echo": true,
      "reply_to_message_id": null
    }
  ]
}
```

---

### 4.6 GET `/api/assistant/alerts`
ดึงห้องสนทนาเร่งด่วนที่ลูกค้ารอตอบเกินเวลาที่กำหนด

- **Query Parameters:**
  - `waiting_minutes`: เกณฑ์เวลาการรอเป็นนาที (Default: `60`)
  - `date`: รูปแบบ `YYYY-MM-DD` (Optional)
  - `page_id`: รหัสเพจ (Optional)
- **Header:** `X-Assistant-API-Key: <YOUR_KEY>`
- **Response Example (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-10-11T22:30:00+07:00",
  "timezone": "Asia/Bangkok",
  "filter": {
    "waiting_minutes_threshold": 60,
    "date": "all",
    "page_id": "all"
  },
  "count": 1,
  "alerts": [
    {
      "conversation_id": "t_2599960257109025",
      "page_id": "113532784994486",
      "page_name": "รับพ่นสี Texture By Good Vibes",
      "customer_name": "คุณสมชาย ตัวอย่าง",
      "last_message_preview": "สนใจฉาบเทกเจอร์ลายหินอ่อนครับ",
      "last_customer_message_at": "2026-10-11T21:15:00+07:00",
      "waiting_minutes": 75,
      "unread_count": 1,
      "lead_status": "ทักใหม่ (New)",
      "assigned_admin": "ช่างเสือ ทาสี"
    }
  ]
}
```

---

### 4.7 GET `/api/assistant/leads`
ดึงข้อมูลลีดและประวัติการติดตามจาก Supabase CRM

- **Query Parameters:**
  - `status`: สถานะลีด (เช่น `ทักใหม่ (New)`, `ติดต่อแล้ว`, `นัดดูหน้างาน`, `ปิดการขายได้`)
  - `page_id`: รหัสเพจ (Optional)
  - `updated_since`: วันที่อัปเดตล่าสุด ISO 8601 (Optional)
  - `limit`: จำนวนรายการ (Default: `20`, Max: `100`)
- **Header:** `X-Assistant-API-Key: <YOUR_KEY>`
- **Response Example (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-10-11T22:30:00+07:00",
  "count": 1,
  "total": 1,
  "leads": [
    {
      "lead_id": "fb-live-28784055277880598",
      "customer_name": "คุณสมชาย ตัวอย่าง",
      "page_name": "รับพ่นสี Texture By Good Vibes",
      "channel": "113532784994486",
      "status": "ทักใหม่ (New)",
      "tags": ["ลูกค้าเพจจริง"],
      "note": "สนใจสอบถามบริการพ่นสีเทกเจอร์ ผนัง 50 ตร.ม.",
      "created_at": "2026-10-11T21:15:00+07:00",
      "updated_at": "2026-10-11T21:15:00+07:00",
      "conversation_id": "t_2599960257109025"
    }
  ]
}
```

---

## 5. รหัสข้อผิดพลาด (HTTP Error Codes)

| HTTP Status | Error Name | คำอธิบาย |
| :---: | :--- | :--- |
| `200` | OK | คำขอสำเร็จ ข้อมูลส่งกลับครบถ้วน |
| `400` | Bad Request | Parameter ไม่ถูกต้องหรือไม่ได้รับอนุญาต (เช่น page_id ไม่อยู่ใน allowlist) |
| `401` | Unauthorized | ไม่ได้แนบ Header `X-Assistant-API-Key` หรือ Key ไม่ถูกต้อง |
| `403` | Forbidden | ปฏิเสธการเรียกข้าม Origin ที่ไม่ได้รับอนุญาต (CORS Protection) |
| `404` | Not Found | ไม่พบ Endpoint ที่ระบุ |
| `405` | Method Not Allowed | เรียกด้วย Method อื่นที่ไม่ใช่ `GET` (เนื่องจากเป็น Read-Only API) |
| `429` | Too Many Requests | อัตราการเรียกเกินโควตา 60 ครั้งต่อนาที (ดู Header `Retry-After`) |
| `500` | Internal Server Error | เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์ |

---

## 6. แนวทางปฏิบัติการทดสอบอย่างปลอดภัย (Safe Testing Guide)

เพื่อความปลอดภัยสูงสุดและป้องกันไม่ให้ API Key หลุดลงใน Terminal History หรือ Log สาธารณะ:

### วิธีทดสอบผ่าน cURL โดยใช้ Environment Variable ชั่วคราว:
```bash
# 1. ตั้งค่า Key ใน Memory ของ Terminal ชั่วคราว (ไม่พิมพ์ Key ลงไฟล์)
read -s MY_KEY
# (พิมพ์หรือวาง Key แล้วกด Enter)

# 2. ทดสอบ Health Check
curl -s -i "https://crm-taaseegun.vercel.app/api/assistant/health" \
  -H "X-Assistant-API-Key: $MY_KEY"

# 3. ทดสอบสรุปภาพรวม Inbox
curl -s "https://crm-taaseegun.vercel.app/api/assistant/inbox-summary" \
  -H "X-Assistant-API-Key: $MY_KEY"

# 4. ทดสอบรายการ Alerts ที่รอนานเกิน 30 นาที
curl -s "https://crm-taaseegun.vercel.app/api/assistant/alerts?waiting_minutes=30" \
  -H "X-Assistant-API-Key: $MY_KEY"
```
