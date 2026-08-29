# Portfolio CMS migration policy

The initial migration is a schema-qualified template because the same
Portfolio-only objects must be installed independently in
`portfolio_cms_dev`, `portfolio_cms_preview`, and `portfolio_cms_prod`.

Run `npm run cms:migrate` only after setting both:

- `PORTFOLIO_CMS_SCHEMA` to one of the three allow-listed schemas.
- `DATABASE_URL` with the same `?schema=` value.

The script verifies the connected database/search path, creates only a
Portfolio-owned migration history table, applies the template transactionally,
and never resets or drops existing objects. It does not print connection or
secret values. Re-running an applied migration is a non-destructive no-op.
