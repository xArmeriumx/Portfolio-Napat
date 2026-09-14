---
title: "Odoo Automated Action: แก้ forbidden opcode STORE_ATTR ด้วย record.write()"
excerpt: "เจอ ValueError forbidden opcode STORE_ATTR ใน Odoo Automated Action เพราะ safe_eval ห้ามสั่ง record.field = value ตรง ๆ วิธีแก้คือใช้ record.write() พร้อมตัวอย่างที่รันได้จริง"
seo_title: "Odoo Automated Action แก้ STORE_ATTR ด้วย record.write()"
seo_description: "วิธีแก้ ValueError forbidden opcode STORE_ATTR ใน Odoo Automated Action: เข้าใจข้อจำกัด safe_eval แล้วเปลี่ยนการกำหนดค่าฟิลด์มาใช้ record.write() พร้อมตัวอย่างและข้อผิดพลาดที่พบบ่อย"
order: 10
---

# Odoo Automated Action: แก้ forbidden opcode STORE_ATTR ด้วย record.write()

**คำตอบสั้น:** ถ้าเจอ `ValueError: forbidden opcode(s) in "...": STORE_ATTR` แปลว่าโค้ด Python ใน Automated Action พยายามกำหนดค่าฟิลด์ตรง ๆ แบบ `record.stage_id = 5` ซึ่ง `safe_eval` ของ Odoo ไม่อนุญาต ให้เปลี่ยนมาใช้ `record.write({'stage_id': 5})` แทน แล้ว error จะหาย

## สภาพแวดล้อม

- Odoo 17 / 18 / 19 (พฤติกรรม `safe_eval` เหมือนกันทุกเวอร์ชัน)
- เมนู Settings > Technical > Automation > Automated Actions
- Action To Do เลือกเป็น Execute Python Code

## ตัวอย่างที่ทำให้เกิด error (ห้ามทำแบบนี้)

สมมติอยากให้ใบเสนอราคาที่ได้รับอนุมัติย้าย stage อัตโนมัติ โค้ดแบบนี้พังทันที:

```python
for record in records:
    record.x_stage = 'approved'
```

ข้อความ error ที่ได้:

```text
ValueError: forbidden opcode(s) in "<string>": STORE_ATTR
```

## ทำไมถึงเกิด error

Automated Action ไม่ได้รัน Python ธรรมดา แต่รันผ่าน `safe_eval` ซึ่งเป็น Python แบบจำกัดความสามารถ Odoo ตัด opcode ที่เสี่ยงออกไป หนึ่งในนั้นคือ `STORE_ATTR` หรือคำสั่งกำหนด attribute ให้ object ตรง ๆ

เหตุผลคือความปลอดภัย: โค้ดใน Automated Action ถูกเก็บในฐานข้อมูลและอาจถูกแก้ผ่าน UI ได้ Odoo จึงไม่อนุญาตให้โค้ดแตะ object ภายในโดยตรง แต่บังคับให้ผ่าน ORM API (`write`, `create`, `unlink`) ซึ่งมีระบบ access rights และ audit คุมอยู่อีกชั้น

## วิธีแก้ที่ถูกต้อง

ใช้ `record.write()` แทนการกำหนดค่าตรง ๆ:

```python
for record in records:
    record.write({'x_stage': 'approved'})
```

ถ้าต้องอัปเดตหลายฟิลด์พร้อมกัน ส่ง dict เดียว:

```python
for record in records:
    record.write({
        'x_stage': 'approved',
        'x_approved_by': user.id,
        'x_approved_date': datetime.date.today(),
    })
```

ถ้าอยากอัปเดตเฉพาะ record ที่เข้าเงื่อนไข ให้เช็กก่อน write เพื่อลดการเขียนฐานข้อมูลโดยไม่จำเป็น:

```python
for record in records:
    if record.x_stage != 'approved' and record.amount_total > 0:
        record.write({'x_stage': 'approved'})
```

## ข้อผิดพลาดที่พบบ่อย

1. **ใช้ `record.field = value` ใน loop** — พังด้วย `STORE_ATTR` เสมอ ไม่มีข้อยกเว้น
2. **เรียก `records.write(...)` ทั้งชุดโดยไม่กรองก่อน** — ทำงานได้แต่เขียนทับ record ที่ไม่ควรโดน ให้ loop แล้วเช็กเงื่อนไขก่อน
3. **ใช้ชื่อฟิลด์ผิด** — `write` กับฟิลด์ที่ไม่มีจริงจะได้ `ValueError: Invalid field` ให้เช็ก technical name ที่ Settings > Technical > Database Structure > Fields ก่อน
4. **ลืมว่า `records` อาจมีหลาย record** — อย่าเขียนโค้ดที่สมมติว่ามี record เดียว ถ้าต้องการ record เดียวให้ใช้ `record` (Odoo เตรียมไว้ให้เมื่อ trigger มาจาก form) หรือ `records[:1]` อย่างระมัดระวัง
5. **แก้ปัญหาผิดจุดด้วย `sudo()`** — `STORE_ATTR` ไม่เกี่ยวกับสิทธิ์การเข้าถึง ใส่ `sudo()` แล้ว assign ตรง ๆ ก็ยังพังเหมือนเดิม

## ตัวแปรที่ใช้ได้ใน Execute Python Code

- `records` — recordset ที่ trigger action
- `record` — record เดียว (ถ้ามี)
- `env` — environment สำหรับเรียก model อื่น เช่น `env['res.partner']`
- `user` — ผู้ใช้ปัจจุบัน
- `datetime`, `dateutil`, `time` — ใช้จัดการวันที่ได้โดยไม่ต้อง import

ถ้าต้อง `import` library เองจะเจออีก error หนึ่ง อ่านต่อที่ [Odoo Automated Action: ทำไม import ไม่ได้ และแก้ IMPORT_NAME อย่างไร](/th/notes/odoo-automated-action-import-name)

## อ้างอิง

- Odoo 19 Automated Actions เอกสารภาษาไทย: https://www.odoo.com/documentation/19.0/th/applications/studio/automated_actions.html
- Odoo QWeb และ developer reference: https://www.odoo.com/documentation/master/developer/reference/frontend/qweb.html

## บทความที่เกี่ยวข้อง

- [Odoo Automated Action: ทำไม import ไม่ได้ และแก้ IMPORT_NAME อย่างไร](/th/notes/odoo-automated-action-import-name)
- [Odoo QWeb: วิธีแก้ PDF ตัดหน้า Page Break พร้อมตัวอย่างจริง](/th/notes/odoo-qweb-report-page-break)
- [โน้ต Odoo ทั้งหมด](/th/notes/odoo)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
