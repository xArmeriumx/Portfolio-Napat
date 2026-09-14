---
title: "Odoo QWeb Table Border: controlling PDF table lines on every page"
excerpt: "Odoo PDF table borders vanish after page breaks. Fix it by styling borders on td/th directly, using border-collapse, and avoiding styles wkhtmltopdf cannot render."
seo_title: "Control Odoo QWeb PDF table borders"
seo_description: "How to control table borders in Odoo QWeb PDF reports: style borders on cells directly, use border-collapse, and handle borders after page breaks with examples."
order: 13
---

# Odoo QWeb Table Border: controlling PDF table lines on every page

**Short answer:** Borders disappear after page breaks because the styles sit on `table` or `tr`, which wkhtmltopdf fails to repaint fully after a break. Put `border` on every `td`/`th` directly, use `border-collapse: collapse`, and test with real multi-page data.

## Environment

- Odoo 17 / 18 / 19, QWeb PDF, wkhtmltopdf
- Most visible on multi-page tables (pair with [Odoo QWeb: fixing PDF page breaks](/notes/odoo-qweb-page-break))

## Symptoms

- First page borders complete, but top borders missing on following pages
- Vertical lines broken into segments after the break point
- HTML preview looks perfect, PDF loses lines

Cause: the preview is a real browser, while the PDF is rendered by wkhtmltopdf, which repaints table/row borders incompletely after breaks. Cell borders repaint correctly.

## Working example

```xml
<div class="order-lines">
  <table class="report-table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Price</th>
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

Three rules cover most cases:

1. `border` lives on `th`/`td` only — never just on `table`/`tr`.
2. Always `border-collapse: collapse` so lines meet exactly.
3. Use solid, dark-enough colors (`#333`); faint lines vanish in print.

## Extra techniques

**Borderless tables with readable rows** — alternate row shading instead of lines:

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

**Right-aligned numeric columns** — use a class on `td` as above, never pad with spaces.

**Overflowing tables** — shrink the table's `padding` and font size first, not the whole page zoom:

```css
.report-table {
  font-size: 12px;
}
.report-table th,
.report-table td {
  padding: 3px 6px;
}
```

## Common mistakes

1. **Borders only on `table`** — first page fine, later pages broken.
2. **Exotic `border-style` values like double or complex dashes** — wkhtmltopdf support is incomplete; `solid` is safest.
3. **Missing `border-collapse`** — doubled, uneven lines.
4. **Too-faint colors (`#eee`)** — fine on screen, gone on paper; use `#999` or darker.
5. **Skipping the real print test** — preview and PDF differ; always open the PDF file.

## References

- Odoo QWeb Templates: https://www.odoo.com/documentation/master/developer/reference/frontend/qweb.html

## Related notes

- [Odoo QWeb: fixing PDF page breaks with real examples](/notes/odoo-qweb-page-break)
- [Odoo Automated Action: Fix forbidden opcode STORE_ATTR with record.write()](/notes/odoo-automated-action-store-attr)
- [All Odoo notes](/notes/odoo)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
