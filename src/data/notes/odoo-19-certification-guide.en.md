---
title: "Odoo 19 Certification study guide: exam structure and reading plan"
excerpt: "The Odoo 19 Functional Certification has 120 questions, 90 minutes, and a 70% pass mark. Here is the module scope, frequent traps, a 4-week reading plan, and practice questions."
seo_title: "Odoo 19 Certification study guide"
seo_description: "Odoo 19 Functional Certification study guide: 120-question structure, 70% pass mark, module scope, exam traps, and a 4-week plan with practice questions."
order: 14
---

# Odoo 19 Certification study guide: exam structure and reading plan

**Short answer:** The Odoo 19 Functional Certification has 120 questions, 90 minutes, and a 70% pass mark across Website, eCommerce, CRM, Sales, Purchases, Project, Accounting, Inventory, MRP, HR, POS and Studio. The most reliable way to pass is hands-on clicking through a trial database in every module — not reading alone.

## Official exam structure

From Odoo's certification page:

- Questions: 120 (multiple choice)
- Time: 1.5 hours (about 45 seconds per question — you must be fluent, not figuring things out)
- Pass mark: 70%
- Format: online exam

Module scope: Website, eCommerce, Survey, Marketing, AI, CRM, Sales, Purchases, Project, Timesheet, Accounting, Inventory, MRP, HR, Spreadsheet, Knowledge, POS and Studio.

Reference: https://www.odoo.com/slides/odoo-19-functional-certification-502

## Frequent traps (from functional-exam patterns)

1. **Similar-looking flows** — e.g. where Quotation becomes Sales Order, when an RFQ becomes a Purchase Order. Exams love status-transition points.
2. **Permissions and settings** — a feature is missing because developer mode is off or a setting is unticked. Memorize which menu enables each capability.
3. **Inventory double-entry** — every stock move has a source and destination. Asked constantly for Receipts, Deliveries, Internal Transfers.
4. **Accounting basics** — Invoice, Bill, Payment, Reconciliation always appear. Developers tend to lose the most marks here.
5. **Studio vs custom modules** — what Studio alone can do versus what needs code.

## 4-week reading plan

**Week 1 — Sales flow:** CRM > Quotation > Sales Order > Delivery > Invoice. Create real documents end to end, then cancel and return things to see what happens.

**Week 2 — Purchase + Inventory:** RFQ > Purchase Order > Receipt > Bill, plus Internal Transfers, Landed Costs and Inventory Adjustments.

**Week 3 — Accounting + Project:** Invoice/Bill/Payment/Reconciliation alongside Project > Task > Timesheet > Invoicing.

**Week 4 — The rest + drills:** Website, eCommerce, POS, HR, Marketing, Survey, Knowledge, Spreadsheet, AI features and Studio. Build a simple Automated Action yourself (see [fixing STORE_ATTR](/notes/odoo-automated-action-store-attr) and [fixing IMPORT_NAME](/notes/odoo-automated-action-import-name)).

## Practice questions (originally written for drilling)

**Q1:** When does a Quotation become a Sales Order?

- A. When the quotation is created
- B. When the customer confirms it
- C. When the invoice is issued
- D. When delivery is complete

Answer: B. Confirmation is the official status change.

**Q2:** To show discounts as a separate column on Sales Orders, you should…

- A. Enable Discount in Sales settings and fill the Discount column
- B. Edit the PDF directly
- C. Only create a new pricelist
- D. It cannot be done

Answer: A. It is a standard Sales setting.

**Q3:** An Internal Transfer must specify…

- A. Product and quantity only
- B. Source Location, Destination Location, product and quantity
- C. Vendor and price
- D. Customer and delivery address

Answer: B. Every stock move always has a source and destination.

## Exam-day tactics

- Skip any question taking over a minute; return at the end (you average 45 seconds each).
- Functional questions often include an answer that "works but is not best practice" — pick Odoo's standard way first.
- When torn between two options, ask "where would a real user click?" Hands-on experience answers this directly.

## References

- Odoo 19 Functional Certification: https://www.odoo.com/slides/odoo-19-functional-certification-502
- Odoo 19 Automated Actions docs: https://www.odoo.com/documentation/19.0/applications/studio/automated_actions.html

## Related notes

- [Odoo Automated Action: Fix forbidden opcode STORE_ATTR with record.write()](/notes/odoo-automated-action-store-attr)
- [Odoo Automated Action: why imports fail and how to fix IMPORT_NAME](/notes/odoo-automated-action-import-name)
- [Odoo QWeb: fixing PDF page breaks with real examples](/notes/odoo-qweb-report-page-break)
- [All Odoo notes](/notes/odoo)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
