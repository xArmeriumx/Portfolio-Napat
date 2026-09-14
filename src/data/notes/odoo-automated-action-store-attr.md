# Odoo Automated Action: แก้ forbidden opcode STORE_ATTR ด้วย record.write()

เวลาเขียน **Automated Action > Execute Code** ใน Odoo แล้วเจอ error ประเภท `forbidden opcode STORE_ATTR` ปัญหามักไม่ได้อยู่ที่ชื่อฟิลด์ แต่เกิดจากข้อจำกัดของ Python code ที่ถูกประมวลผลภายใต้ sandbox ของ Odoo

แนวทางที่เสถียรกว่าคือ **หลีกเลี่ยงการ assign ค่าเข้า field โดยตรง** และใช้ ORM method อย่าง `record.write({...})` แทน

> หมายเหตุ: รายละเอียด opcode ที่ถูกอนุญาตอาจต่างกันตาม Odoo version และ deployment แต่หลักสำคัญคือ Automated Action ไม่ใช่ Python runtime แบบ unrestricted

## ตัวอย่างที่มักมีปัญหา

ในบาง environment โค้ดลักษณะนี้อาจถูกปฏิเสธ:

```python
record.x_status = "done"
```

เพราะการ assign attribute ทำให้ Python bytecode ใช้ opcode สำหรับการเขียน attribute

สำหรับ Automated Action ให้เขียนเป็น:

```python
if record:
    record.write({
        "x_status": "done",
    })
```

ถ้า action ทำงานแบบหลาย record:

```python
if records:
    records.write({
        "x_status": "done",
    })
```

วิธีนี้ใช้ Odoo ORM โดยตรงและอ่านเจตนาของ business logic ได้ชัดกว่า

## ทำไม record.write() เหมาะกว่าใน Automated Action

`write()` เป็น ORM method มาตรฐานของ Odoo และทำงานผ่าน model layer แทนการเปลี่ยน attribute แบบ raw Python

ประโยชน์หลักคือ:

1. โค้ดสอดคล้องกับรูปแบบ ORM ของ Odoo
2. สามารถอัปเดตหลาย field ในครั้งเดียว
3. รองรับ recordset ได้
4. อ่านง่ายเมื่อกลับมา maintain action ภายหลัง
5. ลดการพึ่งพา Python opcode ที่ sandbox อาจไม่อนุญาต

ตัวอย่างหลาย field:

```python
if record:
    values = {
        "x_status": "approved",
        "x_is_checked": True,
    }
    record.write(values)
```

## record กับ records ต่างกันอย่างไร

Odoo ระบุว่า Execute Code มีตัวแปรสำคัญ เช่น `env`, `model`, `record` และ `records`

- `record` คือ record ปัจจุบันที่ trigger action
- `records` คือ recordset สำหรับกรณีทำงานหลาย record
- `env` ใช้เข้าถึง model อื่นผ่าน Odoo environment

ดังนั้นก่อนใช้ควรคิดก่อนว่า action ถูกเรียกทีละ record หรือ batch

ตัวอย่าง batch-safe:

```python
if records:
    records.write({"x_follow_up": True})
elif record:
    record.write({"x_follow_up": True})
```

## อย่าใช้ return ใน Execute Code โดยไม่จำเป็น

Automated Action ไม่ได้ทำงานเหมือน function ปกติที่ต้อง `return` ค่าออกมาเสมอ

ถ้าต้องการคืน client action Odoo รองรับรูปแบบตัวแปร `action = {...}` ใน Execute Code แต่สำหรับการอัปเดต field ทั่วไปให้จบด้วย ORM operation ได้เลย

## ระวัง recursion ของ Automated Action

ตัวอย่างเช่น action trigger เมื่อ `x_status` เปลี่ยน แล้วใน action เขียน:

```python
record.write({"x_status": "done"})
```

ถ้า trigger condition ไม่รัดกุม action อาจถูกเรียกซ้ำ

แนวทางป้องกันคือกำหนด condition ให้ชัด หรือเช็กค่าปัจจุบันก่อน:

```python
if record and record.x_status != "done":
    record.write({"x_status": "done"})
```

## ถ้าต้องอัปเดต relational field

สำหรับ Many2many และ One2many ควรใช้ command ที่ Odoo รองรับ แทนการพยายามแก้ list ด้วย Python ตรงๆ

ใน Odoo 19 Execute Code มี `Command` อยู่ใน evaluation context ตาม documentation

ตัวอย่างแนวคิด:

```python
if record and target_id:
    record.write({
        "x_tag_ids": [Command.link(target_id)],
    })
```

ต้องตรวจสอบชื่อ field และ model ให้ตรงกับฐานข้อมูลจริงก่อนใช้งาน

## Checklist เวลาเจอ STORE_ATTR

- ตรวจว่า error เกิดใน Automated Action / Server Action หรือ Python module จริง
- ถ้าเป็น Execute Code ให้เปลี่ยน direct assignment เป็น `record.write({...})`
- ตรวจว่า field มีอยู่บน model จริง
- เช็ก trigger เพื่อป้องกัน action recursion
- ถ้าทำหลาย record ให้พิจารณา `records.write()`
- อย่าเพิ่ม `sudo()` เพียงเพื่อให้ error หาย ถ้ายังไม่ได้วิเคราะห์ access rights
- ทดสอบในฐานข้อมูล staging ก่อนใช้กับ production

## เรื่อง security ของ safe_eval

Odoo อธิบายในเอกสาร Security ว่า `safe_eval` แม้จะ sandboxed กว่า `eval` แต่ยังมีความสามารถสูง และควรถูกใช้เฉพาะกับผู้ใช้ที่เชื่อถือได้และมีสิทธิ์เหมาะสม

ดังนั้น Automated Action ไม่ควรถูกมองเป็นพื้นที่สำหรับรัน Python อะไรก็ได้ การเขียนผ่าน ORM และจำกัด logic ให้ชัดเจนจะ maintain ได้ง่ายกว่า

## อ่านต่อ

- [Odoo Automated Action: แก้ forbidden opcode IMPORT_NAME](/th/notes/odoo-automated-action-import-name)
- [คู่มือ Odoo QWeb Page Break](/th/notes/odoo-qweb-page-break)
- [Odoo Technical Guides](/th/notes/odoo)

## Official references

- [Odoo 19 Automation Rules — Execute Code](https://www.odoo.com/documentation/19.0/applications/studio/automated_actions.html)
- [Odoo 19 Security — Evaluating content](https://www.odoo.com/documentation/19.0/developer/reference/backend/security.html)
