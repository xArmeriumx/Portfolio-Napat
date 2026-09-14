---
title: "Odoo QWeb Table Border: ทำเส้นตาราง PDF ให้คุมได้ทุกหน้า"
excerpt: "เส้นตาราง Odoo PDF หายบางด้านหลังจุดตัดหน้า แก้ด้วยการกำหนด border ที่ td/th ชัด ๆ ใช้ border-collapse และเลี่ยง style ที่ wkhtmltopdf ไม่รองรับ"
seo_title: "Odoo QWeb Table Border คุมเส้นตาราง PDF"
seo_description: "วิธีคุมเส้นตารางใน Odoo QWeb PDF Report: กำหนด border ที่ cell ชัดเจน ใช้ border-collapse และจัดการเส้นขอบหลังจุดตัดหน้าพร้อมตัวอย่าง"
order: 13
---

# Odoo QWeb Table Border: ทำเส้นตาราง PDF ให้คุมได้ทุกหน้า

**คำตอบสั้น:** เส้นตารางหายหลังจุดตัดหน้าเพราะ style ไปอยู่ที่ `table` หรือ `tr` ซึ่ง wkhtmltopdf วาดใหม่ไม่ครบหลังตัดหน้า ให้กำหนด `border` ที่ `td`/`th` ทุก cell โดยตรง ใช้ `border-collapse: collapse` และทดสอบกับข้อมูลหลายหน้าจริง

## สภาพแวดล้อม

- Odoo 17 / 18 / 19, QWeb PDF, wkhtmltopdf
- ปัญหาเกิดชัดสุดกับตารางที่มีหลายหน้า (ดูวิธีแก้ตัดหน้าคู่กันที่ [Odoo QWeb: วิธีแก้ PDF ตัดหน้า Page Break](/th/notes/odoo-qweb-report-page-break))

## อาการ

- หน้าแรกเส้นตารางครบ แต่หน้าถัดไปขอบบนของตารางหาย
- เส้นแนวตั้งขาดเป็นช่วง ๆ หลังจุดตัดหน้า
- ใน preview (HTML) สวย แต่พอเป็น PDF เส้นหาย

สาเหตุ: preview เป็นเบราว์เซอร์จริง ส่วน PDF render ด้วย wkhtmltopdf ที่วาด border ของ table/row ใหม่หลังตัดหน้าได้ไม่สมบูรณ์ ส่วน border ของ cell วาดใหม่ได้ถูกต้องกว่า

## ตัวอย่างที่ใช้ได้จริง

```xml
<div class="order-lines">
  <table class="report-table">
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
        <td class="text-right"><span t-field="line.product_uom_qty"/></td>
        <td class="text-right"><span t-field="line.price_subtotal"/></td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.report-table {
  width: 100%;
  border-collapse: collapse;
}
.report-table th,
.report-table td {
  border: 1px solid #333;
  padding: 4px 8px;
}
.report-table tr {
  page-break-inside: avoid;
}
.text-right {
  text-align: right;
}
```

หลักสำคัญมีแค่ 3 ข้อ:

1. `border` อยู่ที่ `th`/`td` เท่านั้น ไม่อยู่ที่ `table`/`tr`
2. `border-collapse: collapse` เสมอ เพื่อให้เส้นชนกันพอดี
3. สีเส้นใช้สีทึบ (`#333`) อย่าใช้สีจางมากเพราะตอนพิมพ์จริงเส้นจะหาย

## เทคนิคเพิ่มเติม

**ตารางไม่มีเส้นแต่ต้องการแนวอ่านง่าย** ใช้แถบสีสลับแทนเส้น:

```css
.report-table.clean td,
.report-table.clean th {
  border: none;
  border-bottom: 1px solid #ccc;
}
.report-table.clean tbody tr:nth-child(even) td {
  background-color: #f5f5f5;
}
```

**คอลัมน์ตัวเลขชิดขวา** ใส่ class ที่ `td` อย่างตัวอย่างข้างบน อย่าจัดด้วย spacebar หรือ `t-esc` เติมช่องว่าง

**ตารางกว้างเกินหน้า** ลด `padding` และขนาดฟอนต์ของตารางก่อน อย่าย่อทั้งหน้าด้วย zoom เพราะฟอนต์ส่วนอื่นจะเล็กตามไปด้วย:

```css
.report-table {
  font-size: 12px;
}
.report-table th,
.report-table td {
  padding: 3px 6px;
}
```

## ข้อผิดพลาดที่พบบ่อย

1. **กำหนด border ที่ `table` อย่างเดียว** — หน้าแรกสวย หน้าต่อไปเส้นหาย
2. **ใช้ `border-style: double` หรือเส้นประซับซ้อน** — wkhtmltopdf รองรับไม่ครบ ใช้ `solid` ปลอดภัยสุด
3. **ลืม `border-collapse`** — เส้นซ้อนกันเป็นสองเส้น หนาไม่เท่ากัน
4. **ใช้สีเส้นอ่อนเกิน (`#eee`)** — บนจอสวยแต่พิมพ์แล้วหาย ใช้ `#999` ขึ้นไป
5. **ไม่ทดสอบพิมพ์จริง** — preview กับ PDF ไม่เหมือนกัน ต้องเปิดไฟล์ PDF ดูทุกครั้ง

## อ้างอิง

- Odoo QWeb Templates: https://www.odoo.com/documentation/master/developer/reference/frontend/qweb.html

## บทความที่เกี่ยวข้อง

- [Odoo QWeb: วิธีแก้ PDF ตัดหน้า Page Break พร้อมตัวอย่างจริง](/th/notes/odoo-qweb-report-page-break)
- [Odoo Automated Action: แก้ forbidden opcode STORE_ATTR ด้วย record.write()](/th/notes/odoo-automated-action-store-attr)
- [โน้ต Odoo ทั้งหมด](/th/notes/odoo)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
