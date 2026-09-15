---
title: "Odoo Automated Action: why imports fail and how to fix IMPORT_NAME"
excerpt: "Forbidden opcode IMPORT_NAME in an Odoo Automated Action means safe_eval blocked an import statement. Drop the import and use the preloaded env, datetime, dateutil and time instead."
seo_title: "Fix Odoo IMPORT_NAME without imports"
seo_description: "How to fix forbidden opcode IMPORT_NAME in Odoo Automated Actions: use the preloaded env, datetime, dateutil and time instead of import statements, with working examples."
order: 11
---

# Odoo Automated Action: why imports fail and how to fix IMPORT_NAME

**Short answer:** `ValueError: forbidden opcode(s) in "...": IMPORT_NAME` means your code contains an `import` statement, which Odoo's `safe_eval` forbids. Delete the `import` line and use what Odoo already preloads: `env`, `datetime`, `dateutil`, `time`, `user`.

## Environment

- Odoo 17 / 18 / 19
- Settings > Technical > Automation > Automated Actions > Execute Python Code

## Reproducer

```python
import datetime

for record in records:
    record.write({'x_reminder_date': datetime.date.today()})
```

Produces:

```text
ValueError: forbidden opcode(s) in "<string>": IMPORT_NAME
```

## Why Odoo forbids imports

`safe_eval` only allows names Odoo puts into the execution context. An `import` would pull in arbitrary external modules outside Odoo's control, so it is removed at opcode level — together with `STORE_ATTR` and other risky opcodes.

The good news: everything commonly needed is already preloaded, so no import is required.

## Names available without importing

| Name | Used for | Example |
|---|---|---|
| `env` | Accessing other models | `env['res.partner'].search([])` |
| `records` / `record` | Triggering records | `for record in records:` |
| `user` | Current user | `user.id`, `user.company_id` |
| `datetime` | Dates and times | `datetime.date.today()` |
| `dateutil` | Relative date math | `dateutil.relativedelta.relativedelta(days=7)` |
| `time` | Time formatting | `time.strftime('%Y-%m-%d')` |

## The fix: rewrite without imports

The example above is fixed by simply deleting the import line:

```python
for record in records:
    record.write({'x_reminder_date': datetime.date.today()})
```

A deadline 7 days out:

```python
for record in records:
    deadline = datetime.date.today() + dateutil.relativedelta.relativedelta(days=7)
    record.write({'x_deadline': deadline})
```

Looking up a partner and linking it:

```python
for record in records:
    partner = env['res.partner'].search([('email', '=', record.x_contact_email)], limit=1)
    if partner:
        record.write({'partner_id': partner.id})
```

## Common mistakes

1. **`from datetime import date`** — still `IMPORT_NAME`. Every form of import is blocked.
2. **`import json` for data conversion** — find another way, e.g. pass strings through `Char`/`Text` fields directly. If you genuinely need it, move the logic into a custom addon module.
3. **External libraries like `requests`** — impossible inside Automated Actions. Use Odoo's webhook action or a custom module for external API calls.
4. **Confusing it with `STORE_ATTR`** — if fixing the import reveals `STORE_ATTR`, your code still assigns fields directly. Switch to `record.write()` as shown in [Fix forbidden opcode STORE_ATTR with record.write()](/notes/odoo-automated-action-store-attr).

## When to stop using Automated Actions and write a module instead

- You need external libraries (`requests`, `pandas`, others).
- Logic exceeds roughly 30–40 lines and becomes hard to read.
- You need real unit tests or version control.

Automated Actions fit short if-then-write jobs. Beyond that, a custom addon is cheaper long-term.

## References

- Odoo 19 Automated Actions docs: https://www.odoo.com/documentation/19.0/applications/studio/automated_actions.html

## Related notes

- [Odoo Automated Action: Fix forbidden opcode STORE_ATTR with record.write()](/notes/odoo-automated-action-store-attr)
- [Odoo QWeb: fixing PDF page breaks with real examples](/notes/odoo-qweb-page-break)
- [All Odoo notes](/notes/odoo)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
