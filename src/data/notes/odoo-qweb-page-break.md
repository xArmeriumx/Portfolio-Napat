# Odoo QWeb Page Break: วิธีแบ่งหน้า PDF ให้ควบคุมได้

Odoo QWeb Report เขียนด้วย HTML/QWeb และเมื่อพิมพ์เป็น PDF ระบบใช้ **wkhtmltopdf** เป็นตัว render ดังนั้นปัญหา page break ไม่ได้ขึ้นกับ XML อย่างเดียว แต่เกี่ยวกับโครงสร้าง HTML, CSS และข้อจำกัดของ PDF renderer ด้วย

เป้าหมายที่ดีไม่ใช่ “บังคับทุกอย่างไม่ให้ตัดหน้า” แต่คือออกแบบ report ให้รู้ว่าจุดไหนตัดได้และจุดไหนต้องอยู่ด้วยกัน

## โครงสร้างพื้นฐานของ QWeb report

ตัวอย่างจากแนวทางมาตรฐานของ Odoo:

```xml
<t t-call="web.html_container">
    <t t-foreach="docs" t-as="o">
        <t t-call="web.external_layout">
            <div class="page">
                <h2>Report title</h2>
            </div>
        </t>
    </t>
</t>
```

`div.page` เป็นโครงสำคัญของ printable page ใน QWeb report

## วิธีบังคับขึ้นหน้าใหม่

กรณีต้องการจบ section แล้วเริ่มหน้าถัดไป:

```xml
<div style="page-break-after: always;"></div>
```

หรือกำหนดกับ section:

```xml
<div style="page-break-before: always;">
    <h2>Terms and Conditions</h2>
</div>
```

ควรใช้เฉพาะจุดที่มีเหตุผลทาง layout ไม่ควรแทรก page break ทุกจำนวนแถวแบบสุ่มโดยไม่คำนึงถึงความสูงจริง

## ป้องกัน block เล็กๆ ถูกแยกหน้า

สำหรับ summary หรือ signature block:

```xml
<div style="page-break-inside: avoid;">
    <h3>Summary</h3>
    <p>Total: ...</p>
</div>
```

อย่างไรก็ตาม wkhtmltopdf อาจมีข้อจำกัดกับ layout บางชนิด โดยเฉพาะ table ขนาดใหญ่ ดังนั้นต้องทดสอบกับข้อมูลจริงหลายขนาด

## ตารางหลายหน้า: อย่าพยายามครอบทั้ง table ด้วย avoid

สิ่งที่มักสร้างปัญหาคือ:

```css
table {
  page-break-inside: avoid;
}
```

ถ้าตารางสูงเกินหนึ่งหน้า renderer ไม่มีทางเก็บทั้งตารางไว้หน้าเดียวได้

แนวทางที่เหมาะกว่าคือ:

- ให้ body table แตกหน้าได้
- ใช้ `thead` สำหรับหัวตาราง
- แยก summary/signature ออกจาก body
- ใช้ `page-break-inside: avoid` เฉพาะ block ที่มีขนาดจำกัด
- ถ้าต้องการจำนวนแถวต่อหน้าคงที่ ให้แบ่งข้อมูลเป็น page chunk ก่อน render

## Pattern แบบแบ่งข้อมูลเป็นหน้า

ตัวอย่างแนวคิด:

```xml
<t t-set="page_size" t-value="15"/>
<t t-foreach="range(0, len(o.line_ids), page_size)" t-as="start">
    <div class="page">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <t t-foreach="o.line_ids[start:start + page_size]" t-as="line">
                    <tr>
                        <td><span t-esc="line.product_id.display_name"/></td>
                        <td><span t-esc="line.name"/></td>
                        <td><span t-esc="line.price_subtotal"/></td>
                    </tr>
                </t>
            </tbody>
        </table>
    </div>
</t>
```

แนวคิดนี้ให้ control สูง แต่ต้องพิจารณาว่าแต่ละ row อาจมีความสูงไม่เท่ากัน ถ้า description ยาวหรือมีรูปภาพ จำนวน 15 แถวอาจไม่เท่ากับหนึ่งหน้าจริงเสมอไป

## ทำหัวตารางให้มีโอกาสซ้ำเมื่อขึ้นหน้าใหม่

ใช้ semantic table:

```xml
<table>
    <thead>
        ...
    </thead>
    <tbody>
        ...
    </tbody>
</table>
```

และหลีกเลี่ยงการสร้าง table ที่ markup ไม่สมบูรณ์ เช่นเปิด table ใน block หนึ่งแล้วปิดในอีก condition หนึ่ง เพราะ wkhtmltopdf อาจ render ไม่แน่นอน

## ปิดตารางก่อน page break

ถ้าต้องการตัดหน้าแบบ deterministic วิธีที่เสถียรกว่าคือจบ `</tbody></table>` ให้เรียบร้อยก่อน แล้วค่อยขึ้น `div.page` หรือ page-break จากนั้นเปิด table ใหม่ในหน้าถัดไป

อย่าแทรก `<div>` ตรงกลาง `<tbody>` เพราะ HTML invalid และ PDF renderer อาจจัด DOM ใหม่เอง

## Signature ควรอยู่ท้ายหน้าสุดท้าย

Pattern ที่พบได้บ่อย:

1. render line table เป็นหลายหน้า
2. render subtotal/discount/tax ในหน้าสุดท้าย
3. ถ้าพื้นที่ไม่พอ ให้เริ่ม summary block หน้าใหม่
4. signature ใช้ `page-break-inside: avoid`

วิธีนี้มัก predictable กว่าการพยายามบังคับ signature ให้อยู่ท้ายกระดาษด้วย absolute position โดยไม่รู้ความสูงของ content

## Debug QWeb page break อย่างเป็นระบบ

เมื่อ PDF ตัดหน้าไม่ตรง:

1. ลด template ให้เหลือ table + sample data
2. ตรวจ HTML structure ว่าถูกต้อง
3. เอา CSS ที่เกี่ยวกับ float/position ออกชั่วคราว
4. ทดสอบข้อมูลสั้น กลาง และยาว
5. ตรวจว่ามี row ที่ description ยาวผิดปกติหรือไม่
6. ตรวจรูปภาพที่ทำให้ row สูงขึ้น
7. ค่อยเพิ่ม summary/footer/signature กลับทีละส่วน

## อ่านต่อ

- [Odoo QWeb Table Border: ทำเส้น PDF ไม่หายตอนตัดหน้า](/th/notes/odoo-qweb-table-border)
- [Odoo Technical Guides](/th/notes/odoo)

## Official references

- [Odoo 19 QWeb Reports](https://www.odoo.com/documentation/19.0/developer/reference/backend/reports.html)
- [Odoo 19 QWeb Templates](https://www.odoo.com/documentation/19.0/developer/reference/frontend/qweb.html)
