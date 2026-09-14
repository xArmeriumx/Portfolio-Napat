# Odoo Automated Action: แก้ forbidden opcode IMPORT_NAME และข้อจำกัด import

ถ้าเขียน Python ใน **Odoo Automated Action > Execute Code** แล้วเจอ `forbidden opcode IMPORT_NAME` สิ่งแรกที่ควรเข้าใจคือ code block นี้ทำงานใน environment ที่ถูกจำกัด ไม่ใช่ Python module ปกติ

ในหลายกรณีเราไม่จำเป็นต้อง `import` module เอง เพราะ Odoo เตรียมตัวแปรและ utility หลายตัวไว้ใน evaluation context อยู่แล้ว

## ตัวอย่างที่อาจถูกบล็อก

```python
import datetime
record.write({
    "x_checked_date": datetime.datetime.now(),
})
```

ถ้า environment ปฏิเสธ import opcode โค้ดจะหยุดก่อนทำงานจริง

Odoo 19 documentation ระบุว่า Execute Code มีตัวแปรที่เตรียมไว้ เช่น:

- `env`
- `model`
- `record`
- `records`
- `time`
- `datetime`
- `dateutil`
- `timezone`
- `float_compare`
- `log()`
- `_logger`
- `UserError`
- `Command`

ดังนั้น logic จำนวนมากเขียนได้โดยไม่ต้อง import เพิ่ม

## ตัวอย่างใช้ datetime ที่มีอยู่แล้ว

```python
if record:
    record.write({
        "x_checked_date": datetime.datetime.now(),
    })
```

แต่ก่อนใช้กับ Date/Datetime field จริง ควรตรวจชนิด field และ timezone behavior ของ business flow ให้ถูกต้อง

## ใช้ env แทนการ import Odoo model

เราไม่ต้อง import model class เพื่อค้นข้อมูล

ตัวอย่าง:

```python
partners = env["res.partner"].search([
    ("customer_rank", ">", 0),
], limit=10)
```

หรืออัปเดต record ที่เกี่ยวข้อง:

```python
if record.partner_id:
    record.partner_id.write({
        "x_follow_up": True,
    })
```

## อย่าพยายาม bypass sandbox

เมื่อเจอ IMPORT_NAME ไม่ควรแก้ด้วยการหาวิธีเปิด opcode หรือทำให้ safe_eval รัน unrestricted code จาก Automated Action

เหตุผลคือ:

1. เพิ่ม attack surface
2. ทำให้ upgrade ยาก
3. logic กระจายออกจาก ORM contract
4. debugging ยากเมื่อ deployment เปลี่ยน
5. อาจสร้าง security issue ถ้าผู้ใช้ที่ไม่ควรมีสิทธิ์แก้ action เข้าถึง code

ถ้า logic ซับซ้อนจนต้องพึ่ง library ภายนอกจริงๆ การออกแบบเป็น custom module ที่ผ่าน code review มักเหมาะกว่า แต่ต้องพิจารณาตามข้อจำกัดของ environment ที่ใช้งาน

## Pattern ที่เหมาะกับ Execute Code

Automated Action เหมาะกับ logic ที่สั้นและผูกกับ record ชัดเจน เช่น:

```python
if record and record.state == "draft":
    record.write({
        "x_review_status": "waiting",
    })
```

หรือ validation:

```python
if record and record.amount_total < 0:
    raise UserError("Amount cannot be negative.")
```

ตัวอย่างข้างบนใช้ `UserError` จาก context โดยตรง ไม่ต้อง import

## Logging สำหรับ debug

Odoo เตรียม `log()` ให้ใช้ใน Execute Code

```python
if record:
    log("Automated Action triggered for record %s" % record.id)
```

ควร log เฉพาะข้อมูลที่จำเป็นและหลีกเลี่ยง credential หรือข้อมูลส่วนบุคคลที่ไม่ควรถูกบันทึก

## Checklist เวลาเจอ IMPORT_NAME

- ลบ `import ...` ออกก่อน
- เปิด Help ของ Execute Code เพื่อดู available variables
- ใช้ `env` สำหรับเข้าถึง model
- ใช้ utility ที่ Odoo expose มาให้
- ใช้ `record.write()` แทน direct field assignment เมื่ออยู่ใน sandbox ที่จำกัด
- ถ้า logic ใหญ่เกินไป ให้พิจารณาย้ายไป architecture ที่เหมาะสมกว่า
- อย่าแก้ security configuration เพียงเพื่อให้ snippet รันผ่าน

## STORE_ATTR กับ IMPORT_NAME ต่างกันอย่างไร

`IMPORT_NAME` เกี่ยวกับการ import module ส่วน `STORE_ATTR` เกี่ยวกับการ assign attribute

จึงเป็นคนละปัญหา แม้ทั้งสองมักเกิดจากข้อจำกัดของ evaluation sandbox เดียวกัน

อ่านวิธีแก้ STORE_ATTR ได้ที่:

[Odoo Automated Action: แก้ STORE_ATTR ด้วย record.write()](/th/notes/odoo-automated-action-store-attr)

## อ่านต่อ

- [Odoo Technical Guides](/th/notes/odoo)
- [Odoo QWeb Table Border](/th/notes/odoo-qweb-table-border)

## Official references

- [Odoo 19 Automation Rules](https://www.odoo.com/documentation/19.0/applications/studio/automated_actions.html)
- [Odoo 19 Security](https://www.odoo.com/documentation/19.0/developer/reference/backend/security.html)
