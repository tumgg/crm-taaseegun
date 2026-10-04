# 🚀 คู่มือการนำระบบขึ้นออนไลน์ที่ crm.taaseegun.com

ยินดีด้วยครับพี่ตั้ม! โค้ดระบบ **OmniSocial & Lead Hub** พร้อมนำขึ้นสู่โดเมนจริง `crm.taaseegun.com` เรียบร้อยแล้ว 100% 

---

## 📌 ขั้นตอนที่ 1: นำโค้ดขึ้น GitHub ของพี่ตั้ม (ทำครั้งเดียว)

1. ไปที่ [github.com](https://github.com) แล้วกดสร้าง **New Repository** (ตั้งชื่อ เช่น `crm-taaseegun`)
2. เปิด Terminal ในเครื่องพี่ตั้ม แล้วรัน 2 คำสั่งนี้:

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/crm-taaseegun.git
git push -u origin main
```

*(ระบบได้ทำ `git init` และ commit โค้ดทั้งหมดเตรียมไว้ให้พี่ตั้มเรียบร้อยแล้วครับ)*

---

## 📌 ขั้นตอนที่ 2: Deploy ขึ้น Vercel (ฟรีตลอดชีพ)

1. ไปที่ [vercel.com](https://vercel.com) แล้วล็อกอินด้วย GitHub
2. กดปุ่ม **"Add New..." ➔ "Project"**
3. เลือก Repository `crm-taaseegun` ที่เพิ่ง push ไป
4. กดปุ่ม **"Deploy"** (รอประมาณ 30 วินาที จะได้เว็บออนไลน์พร้อมทำงานทันที)

---

## 📌 ขั้นตอนที่ 3: ผูกชื่อโดเมน crm.taaseegun.com

### 3.1 เพิ่มโดเมนใน Vercel
1. ในหน้าโปรเจกต์ของ Vercel ไปที่ **Settings** ➔ **Domains**
2. พิมพ์ `crm.taaseegun.com` แล้วกด **Add**

### 3.2 ตั้งค่า DNS ที่ผู้ให้บริการโดเมน taaseegun.com
เข้าไปที่หน้าจัดการ DNS ของโดเมน `taaseegun.com` (เช่น Cloudflare, GoDaddy, Namecheap ฯลฯ) แล้วกด **Add Record**:

| Type (ประเภท) | Name / Host (ชื่อโฮสต์) | Target / Value (ค่าปลายทาง) | TTL / Proxy |
| :--- | :--- | :--- | :--- |
| **CNAME** | **crm** | **cname.vercel-dns.com** | Auto (หรือ DNS Only) |

---

## 🎉 ผลลัพธ์
- Vercel จะตรวจจับ DNS และออกใบรับรอง **HTTPS (SSL กุญแจเขียว) ฟรีตลอดชีพ** ให้ภายใน 2–5 นาที
- พี่ตั้มและทีมงานสามารถเข้าใช้งานได้ทันทีที่:
  👉 **https://crm.taaseegun.com**

---

## 👥 บัญชีเข้าสู่ระบบเริ่มต้น
- **พี่ตั้ม (Owner / Super Admin):** `tum` / `password123`
- **แอดมินนนท์ (Lead Sales):** `non` / `password123`
- **แอดมินแพรว (Customer Support):** `praew` / `password123`

*(พี่ตั้มสามารถกดปุ่ม **"👥 จัดการทีมงาน"** ที่มุมขวาบนของระบบ เพื่อเพิ่มทีมงานใหม่ เปลี่ยนรหัสผ่าน หรือคัดลอกข้อมูลส่งให้ทีมงานได้ตลอดเวลาครับ)*
