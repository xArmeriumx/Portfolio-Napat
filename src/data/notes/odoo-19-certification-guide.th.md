---
title: "เตรียมสอบ Odoo 19 Certification ภาษาไทย: โครงข้อสอบและแผนอ่าน"
excerpt: "สอบ Odoo 19 Functional Certification มี 120 ข้อ 90 นาที เกณฑ์ผ่าน 70% มาดูขอบเขตแต่ละโมดูล กับดักที่ออกบ่อย และแผนอ่าน 4 สัปดาห์พร้อมตัวอย่างคำถาม"
seo_title: "เตรียมสอบ Odoo 19 Certification ภาษาไทย"
seo_description: "แนวเตรียมสอบ Odoo 19 Functional Certification ภาษาไทย: โครงข้อสอบ 120 ข้อ เกณฑ์ผ่าน 70% ขอบเขตโมดูล กับดักข้อสอบ และแผนอ่านพร้อมตัวอย่างคำถาม"
order: 14
---

# เตรียมสอบ Odoo 19 Certification ภาษาไทย: โครงข้อสอบและแผนอ่าน

**คำตอบสั้น:** ข้อสอบ Odoo 19 Functional Certification มี 120 ข้อ เวลา 90 นาที เกณฑ์ผ่าน 70% ครอบคลุม Website, eCommerce, CRM, Sales, Purchases, Project, Accounting, Inventory, MRP, HR, POS และ Studio วิธีผ่านที่ชัวร์สุดคือลงมือคลิกจริงในฐานข้อมูลทดลองทุกโมดูล ไม่ใช่อ่านอย่างเดียว

## โครงข้อสอบอย่างเป็นทางการ

ข้อมูลจากหน้า certification ของ Odoo:

- จำนวนข้อ: 120 ข้อ (ปรนัย)
- เวลา: 1.5 ชั่วโมง (เฉลี่ยข้อละ 45 วินาที — ต้องแม่น ไม่ใช่ค่อย ๆ คิด)
- เกณฑ์ผ่าน: 70%
- รูปแบบ: สอบออนไลน์

ขอบเขตโมดูล: Website, eCommerce, Survey, Marketing, AI, CRM, Sales, Purchases, Project, Timesheet, Accounting, Inventory, MRP, HR, Spreadsheet, Knowledge, POS และ Studio

อ้างอิง: https://www.odoo.com/th_TH/slides/odoo-19-functional-certification-502

## กับดักที่ออกบ่อย (จากแพทเทิร์นข้อสอบ functional)

1. **ความต่างของ flow ที่คล้ายกัน** — เช่น Quotation กับ Sales Order ต่างกันตรงไหน, RFQ กลายเป็น Purchase Order เมื่อไร ข้อสอบชอบถามจุดเปลี่ยนสถานะ
2. **สิทธิ์และการตั้งค่า** — ฟีเจอร์ไม่ขึ้นเพราะยังไม่เปิด developer mode หรือยังไม่ติ๊ก setting ตัวนั้น ต้องจำว่าแต่ละความสามารถเปิดที่เมนูไหน
3. **Inventory double-entry** — การเคลื่อนไหวสต็อกทุกครั้งมีต้นทาง-ปลายทาง (source-destination) ถามบ่อยใน Receipt, Delivery, Internal Transfer
4. **Accounting พื้นฐาน** — Invoice, Bill, Payment, Reconciliation ออกแน่นอน คนสาย dev มักพลาดหมวดนี้มากสุด
5. **Studio vs custom module** — อะไรทำได้ด้วย Studio อย่างเดียว อะไรต้องเขียนโค้ด

## แผนอ่าน 4 สัปดาห์

**สัปดาห์ที่ 1 — Sales flow:** CRM > Quotation > Sales Order > Delivery > Invoice ลงมือสร้างเอกสารจริงทีละขั้นจนครบวงจร แล้วลองยกเลิก/คืนสินค้าดูว่าเกิดอะไรขึ้น

**สัปดาห์ที่ 2 — Purchase + Inventory:** RFQ > Purchase Order > Receipt > Bill ควบคู่กับ Internal Transfer, Landed Costs และ Inventory Adjustment

**สัปดาห์ที่ 3 — Accounting + Project:** Invoice/Bill/Payment/Reconciliation ควบคู่กับ Project > Task > Timesheet > Invoicing

**สัปดาห์ที่ 4 — ที่เหลือ + ตะลุยโจทย์:** Website, eCommerce, POS, HR, Marketing, Survey, Knowledge, Spreadsheet, AI features และ Studio ลองทำ Automated Action ง่าย ๆ ด้วยตัวเอง (ดู [แก้ STORE_ATTR](/th/notes/odoo-automated-action-store-attr) กับ [แก้ IMPORT_NAME](/th/notes/odoo-automated-action-import-name) ประกอบ)

## ตัวอย่างคำถามแนวข้อสอบ (แต่งใหม่เพื่อฝึก)

**ข้อ 1:** ใบเสนอราคา (Quotation) จะกลายเป็น Sales Order ได้เมื่อใด

- ก. เมื่อสร้างใบเสนอราคาเสร็จ
- ข. เมื่อลูกค้ากดยืนยัน (Confirm)
- ค. เมื่อออก Invoice
- ง. เมื่อส่งของครบ

เฉลย: ข. การ Confirm คือจุดเปลี่ยนสถานะอย่างเป็นทางการ

**ข้อ 2:** อยากให้ส่วนลดแสดงแยกบรรทัดใน Sales Order ต้องทำอย่างไร

- ก. เปิดใช้งาน Discount ใน Sales settings แล้วกรอกที่คอลัมน์ Discount
- ข. แก้ไข PDF โดยตรง
- ค. สร้าง pricelist ใหม่เท่านั้น
- ง. ทำไม่ได้

เฉลย: ก. เป็น setting มาตรฐานของ Sales

**ข้อ 3:** Internal Transfer ต้องระบุอะไรบ้าง

- ก. สินค้าและจำนวนเท่านั้น
- ข. Source Location, Destination Location, สินค้า และจำนวน
- ค. Vendor และราคา
- ง. Customer และที่อยู่จัดส่ง

เฉลย: ข. ทุกการเคลื่อนไหวสต็อกต้องมีต้นทาง-ปลายทางเสมอ

## เทคนิควันสอบ

- ข้อไหนใช้เวลาคิดเกิน 1 นาทีให้ข้ามก่อน กลับมาทำตอนท้าย (เวลาเฉลี่ยข้อละ 45 วินาที)
- คำถาม functional มักมีคำตอบที่ "ทำได้แต่ผิด best practice" ให้เลือกวิธีมาตรฐานของ Odoo ก่อน
- ถ้าลังเลระหว่าง 2 ข้อ ให้นึกว่า "ถ้าเป็นผู้ใช้จริงจะคลิกตรงไหน" ประสบการณ์ลงมือทำช่วยข้อนี้โดยตรง

## อ้างอิง

- Odoo 19 Functional Certification: https://www.odoo.com/th_TH/slides/odoo-19-functional-certification-502
- Odoo 19 Automated Actions (ไทย): https://www.odoo.com/documentation/19.0/th/applications/studio/automated_actions.html

## บทความที่เกี่ยวข้อง

- [Odoo Automated Action: แก้ forbidden opcode STORE_ATTR ด้วย record.write()](/th/notes/odoo-automated-action-store-attr)
- [Odoo Automated Action: ทำไม import ไม่ได้ และแก้ IMPORT_NAME อย่างไร](/th/notes/odoo-automated-action-import-name)
- [Odoo QWeb: วิธีแก้ PDF ตัดหน้า Page Break พร้อมตัวอย่างจริง](/th/notes/odoo-qweb-report-page-break)
- [โน้ต Odoo ทั้งหมด](/th/notes/odoo)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
