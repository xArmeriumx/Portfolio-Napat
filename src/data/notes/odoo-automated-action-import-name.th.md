---
title: "Odoo Automated Action: ทำไม import ไม่ได้ และแก้ IMPORT_NAME อย่างไร"
excerpt: "เจอ forbidden opcode IMPORT_NAME ใน Odoo Automated Action เพราะ safe_eval ห้ามใช้คำสั่ง import ตรง ๆ มาดูรายชื่อตัวแปรที่ Odoo เตรียมไว้ให้ และ pattern เขียนโค้ดโดยไม่ต้อง import"
seo_title: "Odoo Automated Action แก้ IMPORT_NAME ไม่ต้อง import"
seo_description: "วิธีแก้ forbidden opcode IMPORT_NAME ใน Odoo Automated Action: ใช้ env, datetime, dateutil ที่ Odoo เตรียมไว้แทนคำสั่ง import พร้อมตัวอย่างใช้งานจริง"
order: 11
---

# Odoo Automated Action: ทำไม import ไม่ได้ และแก้ IMPORT_NAME อย่างไร

**คำตอบสั้น:** ถ้าเจอ `ValueError: forbidden opcode(s) in "...": IMPORT_NAME` แปลว่าโค้ดมีคำสั่ง `import` ซึ่ง `safe_eval` ของ Odoo ห้ามไว้ วิธีแก้คือลบบรรทัด `import` ทิ้งแล้วใช้สิ่งที่ Odoo เตรียมไว้ให้อยู่แล้ว เช่น `env`, `datetime`, `dateutil`, `time`, `user`

## สภาพแวดล้อม

- Odoo 17 / 18 / 19
- Settings > Technical > Automation > Automated Actions > Execute Python Code

## ตัวอย่างที่พัง

```python
import datetime

for record in records:
    record.write({'x_reminder_date': datetime.date.today()})
```

error ที่ได้:

```text
ValueError: forbidden opcode(s) in "<string>": IMPORT_NAME
```

## ทำไม Odoo ห้าม import

`safe_eval` อนุญาตเฉพาะชื่อ (names) ที่ Odoo ใส่ไว้ใน execution context เท่านั้น คำสั่ง `import` จะดึง module ภายนอกเข้ามาซึ่ง Odoo ควบคุมไม่ได้ จึงถูกตัดออกตั้งแต่ระดับ opcode พร้อมกับ `STORE_ATTR` และ opcode เสี่ยงอื่น ๆ

ข่าวดีคือของที่ใช้บ่อย Odoo เตรียมไว้ให้หมดแล้ว ไม่ต้อง import เอง

## รายชื่อที่ใช้ได้โดยไม่ต้อง import

| ชื่อ | ใช้ทำอะไร | ตัวอย่าง |
|---|---|---|
| `env` | เรียก model อื่น | `env['res.partner'].search([])` |
| `records` / `record` | record ที่ trigger | `for record in records:` |
| `user` | ผู้ใช้ปัจจุบัน | `user.id`, `user.company_id` |
| `datetime` | วันที่เวลา | `datetime.date.today()` |
| `dateutil` | คำนวณวันที่สัมพัทธ์ | `dateutil.relativedelta.relativedelta(days=7)` |
| `time` | เวลา | `time.strftime('%Y-%m-%d')` |
| `float_compare` ฯลฯ | helper ของ Odoo | ขึ้นกับเวอร์ชัน ให้ลองใน UI |

## วิธีแก้: เขียนใหม่โดยไม่ใช้ import

โค้ดตัวอย่างข้างบนแก้เป็นแบบนี้ (ลบบรรทัด import ทิ้งเฉย ๆ ที่เหลือเหมือนเดิม):

```python
for record in records:
    record.write({'x_reminder_date': datetime.date.today()})
```

ตัวอย่างคำนวณวันครบกำหนด 7 วันข้างหน้า:

```python
for record in records:
    deadline = datetime.date.today() + dateutil.relativedelta.relativedelta(days=7)
    record.write({'x_deadline': deadline})
```

ตัวอย่างค้นหา partner แล้วผูกกับ record:

```python
for record in records:
    partner = env['res.partner'].search([('email', '=', record.x_contact_email)], limit=1)
    if partner:
        record.write({'partner_id': partner.id})
```

## ข้อผิดพลาดที่พบบ่อย

1. **`from datetime import date`** — ก็เป็น `IMPORT_NAME` เหมือนกัน ห้ามทุกท่าที่มีคำว่า import
2. **`import json` เพื่อแปลงข้อมูล** — ใช้วิธีอื่นแทน เช่น ส่ง string ผ่านฟิลด์ `Char`/`Text` ตรง ๆ หรือเก็บเป็น `repr` ถ้าจำเป็นจริง ๆ ให้ย้าย logic ไปเขียนเป็น server action แบบ module (custom addon) แทน
3. **ใช้ library ภายนอกเช่น `requests`** — ทำไม่ได้ใน Automated Action ถ้าต้องยิง API ภายนอก ให้ใช้ webhook action ที่ Odoo มีให้ หรือเขียน custom module
4. **สับสนกับ `STORE_ATTR`** — ถ้าแก้ import แล้วเจอ `STORE_ATTR` ต่อ แปลว่าโค้ดยัง assign ฟิลด์ตรง ๆ ให้เปลี่ยนเป็น `record.write()` อ่านวิธีแก้ที่ [แก้ forbidden opcode STORE_ATTR ด้วย record.write()](/th/notes/odoo-automated-action-store-attr)

## เมื่อไรควรเลิกใช้ Automated Action แล้วเขียน module แทน

- ต้องใช้ library ภายนอก (`requests`, `pandas`, อื่น ๆ)
- logic ซับซ้อนเกิน 30–40 บรรทัด อ่านยาก ดูแลยาก
- ต้องมี unit test หรือ version control จริงจัง

Automated Action เหมาะกับงาน if-then-write สั้น ๆ ถ้าเกินนี้ custom addon จะถูกกว่าในระยะยาว

## อ้างอิง

- Odoo 19 Automated Actions เอกสารภาษาไทย: https://www.odoo.com/documentation/19.0/th/applications/studio/automated_actions.html

## บทความที่เกี่ยวข้อง

- [Odoo Automated Action: แก้ forbidden opcode STORE_ATTR ด้วย record.write()](/th/notes/odoo-automated-action-store-attr)
- [Odoo QWeb: วิธีแก้ PDF ตัดหน้า Page Break พร้อมตัวอย่างจริง](/th/notes/odoo-qweb-report-page-break)
- [โน้ต Odoo ทั้งหมด](/th/notes/odoo)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
