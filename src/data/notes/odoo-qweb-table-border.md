# Odoo QWeb Table Border: ทำเส้นตาราง PDF ไม่หายตอนตัดหน้า

ปัญหาเส้นตารางหาย เส้นซ้อน หรือเส้นไม่ต่อกันใน **Odoo QWeb PDF** มักเกิดจากการพึ่ง border ของ `table` หรือ `tr` มากเกินไป รวมกับ behavior ของ wkhtmltopdf ตอนแบ่งหน้า

สำหรับ report ที่ต้องการเส้นคมและ predictable แนวทางที่ใช้งานได้ดีคือ **กำหนด border ระดับ cell อย่างตั้งใจ** และรักษาโครงสร้าง table ให้ valid

## Baseline CSS

```xml
<style>
    .report-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }

    .report-table th,
    .report-table td {
        border: 1px solid #000;
        padding: 4px 6px;
        vertical-align: top;
    }
</style>
```

`border-collapse: collapse` ช่วยลดเส้นคู่ระหว่าง cell และทำให้ grid อ่านง่าย

## ทำไม per-cell border มักเสถียรกว่า

ถ้าใส่ border เฉพาะ:

```css
tr {
  border-bottom: 1px solid #000;
}
```

ตอน renderer แบ่งหน้า border ของ row อาจไม่ตรงกับ layout ที่คาด

การให้แต่ละ `td` รับผิดชอบเส้นของตัวเองทำให้ control ได้ละเอียดกว่า โดยเฉพาะ report ที่มี:

- header
- body หลายหน้า
- subtotal
- discount
- VAT/WHT
- signature block

## อย่าซ้อน border โดยไม่ตั้งใจ

ถ้าใช้ `border-collapse: separate` แล้วทุก cell มี border รอบด้าน อาจเห็นเส้นกลางหนากว่าส่วนอื่น

สำหรับ grid ปกติให้เริ่มจาก:

```css
border-collapse: collapse;
```

แล้วค่อย override เฉพาะจุด

## Pattern สำหรับ body ที่ไม่ต้องการเส้นแนวนอนทุกแถว

บางเอกสารต้องการเส้นแนวตั้งตลอด body แต่ไม่มีเส้นคั่นแต่ละ item

ตัวอย่าง:

```xml
<td style="border-left: 1px solid #000; border-right: 1px solid #000; border-top: 0; border-bottom: 0;">
    <span t-esc="line.name"/>
</td>
```

จากนั้นแถวสุดท้ายของ section ค่อยปิดด้วย `border-bottom`

ข้อดีคือสามารถทำ layout แบบ commercial document ได้โดยไม่ต้องให้ทุก row เป็นกล่องเต็ม

## ปิดเส้นก่อนตัดหน้า

ถ้าแบ่งข้อมูลเป็น page chunk ควรให้แถวสุดท้ายของแต่ละหน้ามีเส้นปิดชัดเจน แล้วเปิด table ใหม่ในหน้าถัดไป

ตัวอย่างแนวคิด:

```xml
<tr t-att-class="'last-row' if is_last_on_page else ''">
    ...
</tr>
```

แล้วกำหนด style เฉพาะ `last-row`

อย่าพยายามวาง `div` page-break ไว้กลาง `tbody`

## Header row ควรมี border ครบ

หัวตารางควรเป็น reference grid ของทุกหน้า:

```xml
<thead>
    <tr>
        <th style="border: 1px solid #000;">No.</th>
        <th style="border: 1px solid #000;">Description</th>
        <th style="border: 1px solid #000;">Qty</th>
        <th style="border: 1px solid #000;">Amount</th>
    </tr>
</thead>
```

ถ้า body ตั้งใจตัด top/bottom border บางส่วน header ยิ่งควรมีเส้นครบเพื่อให้โครงเอกสารชัด

## Summary block ควรแยก responsibility

แทนที่จะพยายามใช้ CSS ชุดเดียวกับ item rows ให้ summary มี class ของตัวเอง

```css
.summary-label {
    border-left: 1px solid #000;
    border-top: 1px solid #000;
}

.summary-amount {
    border-left: 1px solid #000;
    border-right: 1px solid #000;
    border-top: 1px solid #000;
}
```

แล้วกำหนดเส้นเฉพาะ subtotal, discount, after discount, VAT และ net total ตามแบบเอกสารจริง

## Width ของ column มีผลต่อ border ทางอ้อม

ถ้าความกว้างรวมเกิน paper width wkhtmltopdf อาจ shrink layout ทำให้เส้นและตัวอักษรดูไม่เท่ากัน

ใช้:

```css
table-layout: fixed;
width: 100%;
```

และกำหนด width ของ column เป็นสัดส่วนที่รวมกันสมเหตุผล

ตัวอย่าง:

```xml
<colgroup>
    <col style="width: 8%;"/>
    <col style="width: 52%;"/>
    <col style="width: 15%;"/>
    <col style="width: 25%;"/>
</colgroup>
```

## หลีกเลี่ยง CSS ที่ซับซ้อนเกินจำเป็น

PDF renderer ไม่ใช่ browser รุ่นล่าสุดเต็มรูปแบบ ควรให้ report CSS เรียบและ deterministic:

- table
- padding
- border
- width
- text alignment
- page break

ถ้า layout สำคัญเชิงเอกสาร ควรให้ correctness มาก่อน animation หรือ modern layout feature ที่ไม่จำเป็นกับ PDF

## Test matrix ที่ควรใช้

ก่อนถือว่า report เสร็จ ควรทดสอบอย่างน้อย:

| Case | สิ่งที่ตรวจ |
|---|---|
| 1 item | เส้นบน/ล่างครบ |
| เต็ม 1 หน้า | เส้นปิดท้ายหน้า |
| เกิน 1 หน้า | header + vertical grid ต่อเนื่อง |
| Description ยาว | row ไม่ชน column |
| มี discount/VAT | summary border ถูก |
| ไม่มี discount | เส้นไม่เหลือช่องว่าง |
| หลายหน้า + signature | signature ไม่ถูกตัดครึ่ง |

## อ่านต่อ

- [Odoo QWeb Page Break](/th/notes/odoo-qweb-page-break)
- [Odoo Technical Guides](/th/notes/odoo)

## Official references

- [Odoo 19 QWeb Reports](https://www.odoo.com/documentation/19.0/developer/reference/backend/reports.html)
- [Odoo 19 QWeb Templates](https://www.odoo.com/documentation/19.0/developer/reference/frontend/qweb.html)
