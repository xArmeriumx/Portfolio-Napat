---
title: "Odoo Automated Action: Fix forbidden opcode STORE_ATTR with record.write()"
excerpt: "ValueError forbidden opcode STORE_ATTR in an Odoo Automated Action means safe_eval blocked a direct record.field = value assignment. Replace it with record.write() using this tested pattern."
seo_title: "Fix Odoo STORE_ATTR with record.write()"
seo_description: "How to fix ValueError forbidden opcode STORE_ATTR in Odoo Automated Actions: understand the safe_eval restriction and switch field assignments to record.write() with examples and common mistakes."
order: 10
---

# Odoo Automated Action: Fix forbidden opcode STORE_ATTR with record.write()

**Short answer:** `ValueError: forbidden opcode(s) in "...": STORE_ATTR` means your Python code assigns a field directly, like `record.stage_id = 5`, which Odoo's `safe_eval` forbids. Replace it with `record.write({'stage_id': 5})` and the error goes away.

## Environment

- Odoo 17 / 18 / 19 (`safe_eval` behaves the same in all three)
- Settings > Technical > Automation > Automated Actions
- Action To Do set to Execute Python Code

## Reproducer (do not do this)

Say you want approved quotations to move stage automatically. This crashes immediately:

```python
for record in records:
    record.x_stage = 'approved'
```

The resulting error:

```text
ValueError: forbidden opcode(s) in "<string>": STORE_ATTR
```

## Why it happens

Automated Actions do not run plain Python. They run through `safe_eval`, a restricted evaluator where Odoo removes risky opcodes — including `STORE_ATTR`, i.e. setting an attribute on an object directly.

The reason is security: action code lives in the database and can be edited from the UI, so Odoo forces all writes through the ORM API (`write`, `create`, `unlink`), which enforces access rights on top.

## The correct fix

Use `record.write()` instead of direct assignment:

```python
for record in records:
    record.write({'x_stage': 'approved'})
```

To update several fields at once, pass a single dict:

```python
for record in records:
    record.write({
        'x_stage': 'approved',
        'x_approved_by': user.id,
        'x_approved_date': datetime.date.today(),
    })
```

Filter before writing so you do not touch records unnecessarily:

```python
for record in records:
    if record.x_stage != 'approved' and record.amount_total > 0:
        record.write({'x_stage': 'approved'})
```

## Common mistakes

1. **Using `record.field = value` in a loop** — always fails with `STORE_ATTR`, no exceptions.
2. **Calling `records.write(...)` on the whole set without filtering** — works but overwrites records it should not touch. Loop and check conditions first.
3. **Wrong field name** — writing to a non-existent field raises `ValueError: Invalid field`. Verify the technical name under Settings > Technical > Database Structure > Fields first.
4. **Assuming a single record** — `records` can hold many. Do not write code that assumes one record; use `record` (available when triggered from a form) or handle the set explicitly.
5. **Trying to fix it with `sudo()`** — `STORE_ATTR` is not about access rights. Direct assignment still fails under `sudo()`.

## Variables available in Execute Python Code

- `records` — the recordset that triggered the action
- `record` — a single record (when available)
- `env` — the environment, e.g. `env['res.partner']` for other models
- `user` — the current user
- `datetime`, `dateutil`, `time` — date handling without imports

If you need to `import` a library yourself you will hit a different error, covered in [Odoo Automated Action: why imports fail and how to fix IMPORT_NAME](/notes/odoo-automated-action-import-name).

## References

- Odoo 19 Automated Actions docs: https://www.odoo.com/documentation/19.0/applications/studio/automated_actions.html
- Odoo developer reference: https://www.odoo.com/documentation/master/developer/reference/frontend/qweb.html

## Related notes

- [Odoo Automated Action: why imports fail and how to fix IMPORT_NAME](/notes/odoo-automated-action-import-name)
- [Odoo QWeb: fixing PDF page breaks with real examples](/notes/odoo-qweb-report-page-break)
- [All Odoo notes](/notes/odoo)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
