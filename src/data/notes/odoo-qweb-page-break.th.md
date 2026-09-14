---
title: "Odoo QWeb: วิธีแก้ PDF ตัดหน้า Page Break พร้อมตัวอย่างจริง"
excerpt: "รายงาน Odoo ตัดกลางแถวตารางตอนขึ้นหน้าใหม่ แก้ด้วย page-break-inside avoid, คลุมตารางด้วย div และออกแบบ header/footer ให้รองรับหลายหน้า พร้อมตัวอย่าง XML ที่ใช้ได้จริง"
seo_title: "Odoo QWeb แก้ PDF ตัดหน้า Page Break"
seo_description: "วิธีแก้ Odoo QWeb PDF ตัดกลางตารางตอนขึ้นหน้าใหม่: ใช้ page-break-inside, จัดโครง report หลายหน้า และเข้าใจข้อจำกัด wkhtmltopdf พร้อมตัวอย่าง XML"
order: 12
---

# Odoo QWeb: วิธีแก้ PDF ตัดหน้า Page Break พร้อมตัวอย่างจริง

**คำตอบสั้น:** ตารางใน PDF ถูกตัดกลางแถวตอนขึ้นหน้าใหม่เพราะ wkhtmltopdf (engine ที่ Odoo ใช้ render PDF) ตัดเนื้อหาตามความสูงหน้า ให้ใส่ `page-break-inside: avoid` ที่แถวหรือกลุ่มที่ห้ามตัด คลุมตารางด้วย `div` และทดสอบกับข้อมูลจริงที่มีหลายหน้าทุกครั้ง

## สภาพแวดล้อม

- Odoo 17 / 18 / 19 (ใช้ wkhtmltopdf เหมือนกัน)
- Report แบบ QWeb PDF (`report.paperformat` มาตรฐาน A4)
- แก้ template ที่ Settings > Technical > Reports หรือสืบทอด template ใน custom module

## อาการ

- แถวตาราง (`tr`) ถูกผ่าครึ่งตอนขึ้นหน้าใหม่ ครึ่งบนอยู่หน้าหนึ่ง ครึ่งล่างอยู่อีกหน้า
- เส้นขอบตารางหายบางด้านหลังจุดตัดหน้า
- header ของตารางไม่ซ้ำในหน้าใหม่ อ่านไม่รู้เรื่อง

## ตัวอย่างที่ใช้ได้จริง

โครงที่แนะนำ: header/footer ของ report ให้ Odoo จัดการ ส่วนเนื้อหาตารางให้คลุมด้วย `div` ที่สั่งห้ามตัดข้างใน:

```xml
<t t-name="my_module.report_quotation_custom">
  <t t-call="web.html_container">
    <t t-foreach="docs" t-as="doc">
      <t t-call="web.external_layout">
        <div class="page">
          <h2>ใบเสนอราคา <span t-field="doc.name"/></h2>

          <div class="order-lines">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th>จำนวน</th>
                  <th>ราคา</th>
                </tr>
              </thead>
              <tbody>
                <tr t-foreach="doc.order_line" t-as="line">
                  <td><span t-field="line.name"/></td>
                  <td><span t-field="line.product_uom_qty"/></td>
                  <td><span t-field="line.price_subtotal"/></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="totals">
            <p>ยอดรวม: <span t-field="doc.amount_total"/></p>
          </div>
        </div>
      </t>
    </t>
  </t>
</t>
```

CSS ที่ควรเพิ่มใน template (ผ่าน `style` ของ report หรือ asset ของ module):

```css
.order-lines table {
  width: 100%;
  border-collapse: collapse;
}
.order-lines tr {
  page-break-inside: avoid;
}
.totals {
  page-break-inside: avoid;
}
```

## ทำไมวิธีนี้ได้ผล

1. **`page-break-inside: avoid` ที่ `tr`** — บอก engine ว่าอย่าผ่าแถว ถ้าแถวไม่พอให้ยกทั้งแถวไปหน้าใหม่
2. **`div` คลุมกลุ่มเนื้อหา** — wkhtmltopdf จัดการ page break กับ block element ได้ดีกว่า table เปลือย ๆ
3. **`thead`** — ใช้ `thead` จริง (ไม่ใช่แถวธรรมดา) engine จะพยายามซ้ำ header ให้ในหน้าใหม่
4. **กลุ่มยอดรวมห้ามตัด** — `.totals` เป็นก้อนเดียวที่ต้องอยู่ด้วยกันเสมอ

## ข้อผิดพลาดที่พบบ่อย

1. **ใส่ `page-break-inside: avoid` ที่ `table` ทั้งก้อน** — ตารางยาวทั้งหน้ายกไปหน้าใหม่ทั้งก้อน เกิดหน้าว่าง ให้ใส่ที่ `tr` หรือกลุ่มย่อยแทน
2. **ใช้ `div` ซ้อนกันหลายชั้นเกินไป** — wkhtmltopdf คำนวณความสูงพลาด ให้โครงเรียบที่สุด
3. **ทดสอบแค่ข้อมูล 2–3 แถว** — ปัญหาตัดหน้าเกิดเฉพาะข้อมูลเยอะ ให้ทดสอบกับ order ที่มี 20+ แถวทุกครั้ง
4. **ลืมเรื่องฟอนต์ไทย** — ฟอนต์ตก (fallback) ทำให้ความสูงบรรทัดเพี้ยน ตำแหน่งตัดหน้าจะไม่ตรงกับที่เห็นใน preview ให้ติดตั้งฟอนต์ไทยบน server ด้วย
5. **แก้ template หลักของ Odoo ตรง ๆ** — อัปเกรดแล้วหาย ให้สืบทอด template (`t-inherit`) ใน module ของตัวเอง

## เช็กลิสต์ก่อนส่งงาน

- พิมพ์ PDF จากข้อมูลจริงที่มีหลายหน้า แล้วเปิดดูทุกจุดตัดหน้า
- ไม่มีแถวถูกผ่าครึ่ง ไม่มีเส้นขอบหาย
- header ตารางอ่านรู้เรื่องทุกหน้า
- ยอดรวมอยู่ก้อนเดียวไม่แยกหน้า

## อ้างอิง

- Odoo QWeb Templates: https://www.odoo.com/documentation/master/developer/reference/frontend/qweb.html
- Odoo 19 Landed Costs (ตัวอย่าง report หลายหน้า): https://www.odoo.com/documentation/19.0/th/applications/inventory_and_mrp/inventory/inventory_valuation/landed_costs.html

## บทความที่เกี่ยวข้อง

- [Odoo QWeb Table Border: ทำเส้นตาราง PDF ให้คุมได้ทุกหน้า](/th/notes/odoo-qweb-table-border)
- [Odoo Automated Action: แก้ forbidden opcode STORE_ATTR ด้วย record.write()](/th/notes/odoo-automated-action-store-attr)
- [โน้ต Odoo ทั้งหมด](/th/notes/odoo)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
