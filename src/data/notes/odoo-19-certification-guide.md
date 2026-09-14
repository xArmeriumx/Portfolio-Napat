# Odoo 19 Certification ภาษาไทย: โครงข้อสอบและแผนอ่านให้เป็นระบบ

ถ้ากำลังเตรียมสอบ **Odoo 19 Functional Certification** สิ่งสำคัญคืออย่าเริ่มจากท่องเมนูแบบกระจัดกระจาย ควรรู้ format ของข้อสอบก่อน แล้วค่อยวางลำดับ module ตาม flow ธุรกิจ

ข้อมูลทางการของ Odoo ระบุว่า Odoo 19 Functional Certification มี **120 ข้อ**, ใช้เวลา **1.5 ชั่วโมง** และต้องได้อย่างน้อย **70%** จึงผ่าน

## รูปแบบคะแนน

ตามหน้าสอบทางการ:

- ตอบถูก = +1 คะแนน
- ตอบผิด = -0.5 คะแนน
- ไม่ตอบ = 0 คะแนน
- หลัง submit หน้าสุดท้ายแล้วไม่สามารถย้อนกลับไปแก้ได้

ดังนั้น strategy ไม่ควรเป็นการเดาทุกข้อโดยไม่ประเมินความมั่นใจ

## Module ที่ Odoo ระบุว่าอยู่ในข้อสอบ

Odoo 19 ระบุหัวข้อดังนี้:

1. Website
2. eCommerce
3. Survey
4. Marketing
5. AI
6. CRM
7. Sales
8. Purchases
9. Project
10. Timesheet
11. Accounting
12. Inventory
13. MRP
14. HR
15. Spreadsheet
16. Knowledge
17. POS
18. Studio

จุดที่ควรสังเกตคือ Odoo 19 มีหัวข้อ **AI** และ **Knowledge** อยู่ในรายการอย่างชัดเจน

## วิธีอ่านที่แนะนำ: เรียนเป็น Business Flow

แทนที่จะแยกจำแต่ละ app ให้จัดกลุ่มเป็น flow

### กลุ่ม Sales-to-Cash

```text
CRM
→ Quotation
→ Sales Order
→ Delivery
→ Invoice
→ Payment
```

หัวข้อที่ต้องเข้าใจ:

- quotation กับ sales order ต่างกันเมื่อไร
- invoice policy
- delivery flow
- customer payment
- taxes และ fiscal behavior พื้นฐาน

### กลุ่ม Procure-to-Pay

```text
Purchase
→ Receipt
→ Vendor Bill
→ Payment
```

ต้องเข้าใจ:

- RFQ / PO
- receipt
- purchase control
- vendor bill
- product type และ inventory impact

### กลุ่ม Inventory / MRP

```text
Product
→ Route
→ Replenishment
→ Receipt / Delivery
→ Manufacturing
```

เน้น concept มากกว่าจำตำแหน่งปุ่มอย่างเดียว เช่น:

- on hand vs forecast
- replenishment
- lot / serial
- route
- manufacturing order
- bill of materials

## Accounting ต้องเข้าใจผลกระทบ ไม่ใช่จำเมนู

โจทย์ certification มักวัดว่า configuration หนึ่งส่งผลอะไรต่อ flow

เวลาอ่าน Accounting ให้เชื่อม:

```text
Document
→ Journal Entry
→ Tax
→ Reconciliation
→ Reporting
```

ถ้าเห็น transaction ให้คิดต่อว่า:

- journal ไหน
- account ไหน
- posted เมื่อไร
- payment/reconciliation ทำให้สถานะเปลี่ยนอย่างไร

## Project + Timesheet

ควรรู้ความสัมพันธ์ของ:

- project
- task
- assignee
- milestone
- timesheet
- billable behavior

อย่าจำ task screen แยกจาก Sales เพราะ service product บาง flow เชื่อม Sales กับ Project/Timesheet

## POS และ eCommerce

สอง module นี้มี front-office flow มากกว่าหน้าหลังบ้าน

สิ่งที่ควรฝึกคือทำ flow จริงตั้งแต่ต้นจนจบ เช่น:

```text
Configure product
→ Make sale
→ Payment
→ Receipt / Order
→ Back-office result
```

## Studio

Studio ไม่ใช่แค่เพิ่ม field

ควรเข้าใจ:

- field types
- views
- automation
- approval/customization concept
- ผลกระทบของ customization ต่อผู้ใช้

ถ้าต้องเขียน Execute Code ควรเข้าใจข้อจำกัดของ Automated Actions ด้วย:

- [แก้ STORE_ATTR ด้วย record.write()](/th/notes/odoo-automated-action-store-attr)
- [เข้าใจ IMPORT_NAME และ safe execution context](/th/notes/odoo-automated-action-import-name)

## แผนอ่าน 14 วัน

### Day 1–2
CRM + Sales

### Day 3–4
Purchase + Inventory

### Day 5
MRP

### Day 6–7
Accounting

### Day 8
Project + Timesheet

### Day 9
Website + eCommerce

### Day 10
POS

### Day 11
Marketing + Survey

### Day 12
HR + Knowledge + Spreadsheet

### Day 13
Studio + AI

### Day 14
ทำ mock review โดยไล่ business flow ทั้งระบบ

## วิธีทำข้อสอบเมื่อมี negative marking

เมื่อข้อผิดถูกหัก 0.5 คะแนน ให้แบ่งคำถามเป็น 3 กลุ่ม:

### มั่นใจสูง
ตอบทันที

### เหลือ 2 ตัวเลือกและมีเหตุผลรองรับ
ประเมินจาก functional behavior และ wording ของโจทย์

### ไม่รู้จริง
อย่ารีบเดาเพราะการตอบผิดมีต้นทุนคะแนน

ควรบริหารเวลาเฉลี่ยต่อข้อ เพราะ 120 ข้อใน 90 นาทีเท่ากับประมาณ 45 วินาทีต่อข้อโดยเฉลี่ย แต่บางข้อเร็วมากจึงใช้เวลาที่เหลือกับข้อ scenario ได้

## วิธีฝึกที่มีประสิทธิภาพกว่าการอ่านอย่างเดียว

1. เปิด Odoo 19 demo/training environment
2. ทำ flow จริง
3. เปลี่ยน configuration แล้วดูผล
4. จดเหตุผลว่าทำไมระบบเปลี่ยน
5. กลับไปอ่าน official docs เฉพาะจุดที่ยังไม่เข้าใจ

Certification วัดความเข้าใจ functional behavior จึงควรฝึกแบบ scenario

## Checklist ก่อนสอบ

- รู้ scoring rule
- รู้ module coverage
- ทำ Sales/Purchase/Inventory flow ได้
- เข้าใจ Accounting result ของ transaction พื้นฐาน
- ทำ Project/Timesheet flow ได้
- เข้าใจ Website/eCommerce/POS
- ทบทวน Studio, Knowledge, Spreadsheet และ AI
- ฝึกตัดสินใจเมื่อไม่มั่นใจ เพราะมี negative marking

## อ่านต่อ

- [Odoo Technical Guides](/th/notes/odoo)
- [Odoo Automated Action: STORE_ATTR](/th/notes/odoo-automated-action-store-attr)
- [Odoo QWeb Page Break](/th/notes/odoo-qweb-page-break)

## Official reference

- [Odoo 19 Functional Certification](https://www.odoo.com/th_TH/slides/odoo-19-functional-certification-502)
