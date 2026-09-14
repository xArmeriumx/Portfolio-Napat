---
title: "Odoo QWeb: fixing PDF page breaks with real examples"
excerpt: "Odoo report tables split mid-row on page breaks. Fix it with page-break-inside avoid, div wrappers around tables, and multi-page header/footer design, with working XML examples."
seo_title: "Fix Odoo QWeb PDF page breaks"
seo_description: "How to fix Odoo QWeb PDFs splitting table rows across pages: page-break-inside, multi-page report structure, and wkhtmltopdf constraints with XML examples."
order: 12
---

# Odoo QWeb: fixing PDF page breaks with real examples

**Short answer:** Tables get sliced mid-row on page breaks because wkhtmltopdf (Odoo's PDF engine) cuts content by page height. Put `page-break-inside: avoid` on rows or groups that must stay intact, wrap tables in `div` elements, and always test with real multi-page data.

## Environment

- Odoo 17 / 18 / 19 (all use wkhtmltopdf)
- QWeb PDF reports (standard A4 `report.paperformat`)
- Edit templates under Settings > Technical > Reports, or inherit them in a custom module

## Symptoms

- Table rows (`tr`) cut in half across pages — top half on one page, bottom half on the next
- Table borders missing on some sides after the break point
- Table headers not repeated on new pages, making them unreadable

## Working example

Recommended structure: let Odoo handle the report header/footer, wrap table content in `div` elements that forbid internal breaks:

```xml
<t t-name="my_module.report_quotation_custom">
  <t t-call="web.html_container">
    <t t-foreach="docs" t-as="doc">
      <t t-call="web.external_layout">
        <div class="page">
          <h2>Quotation <span t-field="doc.name"/></h2>

          <div class="order-lines">
            <table class="table table-sm">
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
                  <td><span t-field="line.product_uom_qty"/></td>
                  <td><span t-field="line.price_subtotal"/></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="totals">
            <p>Total: <span t-field="doc.amount_total"/></p>
          </div>
        </div>
      </t>
    </t>
  </t>
</t>
```

CSS to add to the template (via the report `style` or the module's assets):

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

## Why this works

1. **`page-break-inside: avoid` on `tr`** — tells the engine never to split a row; if a row does not fit, the whole row moves to the next page.
2. **`div` wrappers around content groups** — wkhtmltopdf computes page breaks on block elements far more reliably than on bare tables.
3. **A real `thead`** — not a plain row; the engine tries to repeat it on new pages.
4. **Totals kept as one block** — `.totals` is a unit that must never split.

## Common mistakes

1. **Putting `page-break-inside: avoid` on the whole `table`** — a long table jumps to a new page as one block, leaving blank pages. Apply it to `tr` or small groups instead.
2. **Deeply nested `div` layers** — wkhtmltopdf miscalculates heights. Keep the structure as flat as possible.
3. **Testing with only 2–3 rows** — break problems only appear with large data. Always test with 20+ order lines.
4. **Forgetting about fonts** — font fallback changes line heights, so break positions differ from the preview. Install the needed fonts on the server too.
5. **Editing Odoo's core template directly** — upgrades wipe it out. Inherit the template (`t-inherit`) in your own module.

## Pre-delivery checklist

- Print the PDF from real multi-page data and inspect every break point.
- No row split in half, no missing borders.
- Table headers readable on every page.
- Totals stay together on one page.

## References

- Odoo QWeb Templates: https://www.odoo.com/documentation/master/developer/reference/frontend/qweb.html

## Related notes

- [Odoo QWeb Table Border: controlling PDF table lines on every page](/notes/odoo-qweb-table-border)
- [Odoo Automated Action: Fix forbidden opcode STORE_ATTR with record.write()](/notes/odoo-automated-action-store-attr)
- [All Odoo notes](/notes/odoo)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
