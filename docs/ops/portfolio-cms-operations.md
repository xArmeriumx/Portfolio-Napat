# Portfolio CMS operations

สถานะนี้แยก “โค้ดพร้อมตรวจ” ออกจาก “หลักฐานที่ต้องใช้ credential/ระบบจริง” เสมอ

## Schema และ target guard

แอปใช้ PostgreSQL schema ที่ allow-list เท่านั้น:

- `portfolio_cms_dev`
- `portfolio_cms_preview`
- `portfolio_cms_prod`

ตั้ง `PORTFOLIO_CMS_SCHEMA` และ `DATABASE_URL` ที่มี `?schema=` ค่าเดียวกันก่อนเรียก migration/import ทุกครั้ง

```bash
PORTFOLIO_CMS_SCHEMA=portfolio_cms_dev \
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=portfolio_cms_dev' \
npm run cms:migrate

PORTFOLIO_CMS_SCHEMA=portfolio_cms_dev \
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=portfolio_cms_dev' \
npm run cms:import
```

คำสั่งตรวจ inventory เป็น read-only และ output เฉพาะชื่อ schema/table/bucket/policy กับจำนวนแถว ไม่แสดง URL password, service key, session, หรือ payload ส่วนตัว:

```bash
PORTFOLIO_CMS_SCHEMA=portfolio_cms_preview \
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=portfolio_cms_preview' \
PORTFOLIO_INVENTORY_OUTPUT=artifacts/portfolio-supabase-inventory.json \
node scripts/inventory-portfolio.mjs
```

## Release contract for database-backed content

Production and Preview runtime both use PostgreSQL as the content SSOT. A successful
application build alone is therefore not sufficient evidence that public content exists.

Vercel Production releases now run a guarded baseline content preparation step before `next build`:

1. Require `VERCEL_ENV=production`.
2. Require `portfolio_cms_prod` and the matching `DATABASE_URL?schema=portfolio_cms_prod`.
3. Run the create-only baseline importer.
4. Verify every source-controlled Note has a Published document/revision.
5. Fail the deployment if a baseline Note is missing or not Published.

Preview deployments stay read-only by default and do not mutate any database during PR builds.
A Preview database sync must be explicitly opted in with `PORTFOLIO_CMS_AUTO_IMPORT=true`
and a Preview-scoped `portfolio_cms_preview` connection.

The importer remains non-destructive: an existing CMS document is not overwritten.
Legacy Note slugs are resolved before insert so the rollout does not create duplicate
canonical/legacy documents.

Published-content cache keys are deployment-scoped using the Vercel commit/deployment
identity and have a five-minute safety TTL. A new deployment therefore cannot reuse a
stale empty Notes cache from the previous release.

Outside Vercel, an operator can run the same guarded preparation explicitly:

```bash
PORTFOLIO_CMS_AUTO_IMPORT=true \
CONTENT_STORAGE=database \
PORTFOLIO_CMS_SCHEMA=portfolio_cms_preview \
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=portfolio_cms_preview' \
npm run cms:prepare-release
```

## SEO Notes rollout

ไฟล์ Markdown ใต้ `src/data/notes` เป็น source-controlled baseline แต่ Production runtime ใช้
`CONTENT_STORAGE=database` เป็น SSOT ดังนั้นการเพิ่มบทความ SEO ใหม่ต้อง import เข้าสู่
target schema ก่อนจึงจะปรากฏบน public runtime

metadata ของ note ที่ถูกจัดการใน `src/data/note-catalog.js` ระบุ source locale อย่างชัดเจน
เพื่อป้องกันการสร้าง hreflang/canonical ให้กับภาษาที่ยังไม่มี translation จริง:

- source locale ที่มีเนื้อหาจริง: indexable + อยู่ใน sitemap
- locale ที่ยังไม่มี translation: อ่าน fallback ได้เมื่อเข้าตรง แต่เป็น `noindex`
- เมื่อมี translation ที่ผ่าน editorial review ให้ publish `bodyMarkdownByLocale` ของภาษานั้นผ่าน CMS

หลัง merge ชุดบทความใหม่ ให้ import แบบ idempotent ตาม target:

```bash
PORTFOLIO_CMS_SCHEMA=portfolio_cms_prod \
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=portfolio_cms_prod' \
npm run cms:import
```

Importer จะ skip document ที่มีอยู่แล้วและสร้างเฉพาะ baseline document ที่ยังไม่มี
จึงไม่ overwrite revision ที่ถูกแก้ผ่าน CMS อยู่ก่อนแล้ว หลัง import ให้ตรวจ
`/sitemap.xml`, topic hubs และ canonical/noindex ของทั้ง `/th/notes/*` และ `/notes/*`.

## Portfolio Storage namespace

ตรวจ inventory ก่อนเสมอ แล้วตรวจหรือสร้างเฉพาะ bucket `portfolio-cms` ด้วย
service role ที่เก็บใน secret manager เท่านั้น คำสั่งจะไม่แตะ bucket อื่น และจะ
สร้าง bucket ก็ต่อเมื่อมี confirmation ที่ระบุชัดเจน:

```bash
SUPABASE_URL='https://PROJECT_REF.supabase.co' \
SUPABASE_SERVICE_ROLE_KEY='ใช้ค่าจาก secret manager เท่านั้น' \
PORTFOLIO_STORAGE_BUCKET=portfolio-cms \
node scripts/ensure-storage.mjs

SUPABASE_URL='https://PROJECT_REF.supabase.co' \
SUPABASE_SERVICE_ROLE_KEY='ใช้ค่าจาก secret manager เท่านั้น' \
PORTFOLIO_STORAGE_BUCKET=portfolio-cms \
PORTFOLIO_STORAGE_CONFIRM=CREATE_PORTFOLIO_CMS_BUCKET \
node scripts/ensure-storage.mjs
```

bucket ต้องเป็น public-read เพราะแอปใช้ public media URL แต่การเขียน/ลบทำผ่าน
server-only service role และทุก object อยู่ใต้ `projects/{projectId}/...`
จึงไม่ให้ Portfolio route แตะ namespace ของแอปอื่น

## Backup ก่อน migration/cutover

ใช้ custom-format dump ที่จำกัดด้วย `--schema` และไม่ใช้ `prisma migrate reset`:

```bash
PORTFOLIO_CMS_SCHEMA=portfolio_cms_preview \
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=portfolio_cms_preview' \
node scripts/backup-portfolio.mjs
```

Production ต้องตั้ง `PORTFOLIO_BACKUP_CONFIRM=BACKUP_PORTFOLIO_PRODUCTION` โดยตั้งผ่าน secret manager เท่านั้น ห้ามใส่ใน source/log

## Safe restore demonstration

Restore อนุญาตเฉพาะ dev/preview และต้องชี้ไฟล์ใต้ `artifacts/backups`:

```bash
PORTFOLIO_CMS_SCHEMA=portfolio_cms_preview \
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?schema=portfolio_cms_preview' \
PORTFOLIO_BACKUP_FILE=artifacts/backups/portfolio-portfolio_cms_preview-YYYY-MM-DD.dump \
PORTFOLIO_RESTORE_CONFIRM=RESTORE_PORTFOLIO_CMS_NONPROD \
node scripts/restore-portfolio.mjs
```

สคริปต์ restore ใช้ `pg_restore --schema ... --clean --if-exists --single-transaction` ใน schema non-production ที่ระบุเท่านั้น และไม่สามารถรับ `portfolio_cms_prod` ได้

## Rollback

1. Application: เลือก deployment ก่อนหน้าใน Vercel แล้ว promote/rollback ตามสิทธิ์ของ project
2. Content: ใช้ revision history → Restore as Draft → Preview exact → Publish เพื่อ rollback เนื้อหาแบบตรวจสอบได้
3. Database: หยุด rollout, เก็บ log แบบไม่เปิดเผย secret, และแก้ด้วย forward migration/restore ที่ได้รับอนุมัติเท่านั้น; ห้าม reset shared database
4. Storage: ห้ามลบ asset ที่มี Published/Draft reference; ตรวจ reference ก่อนลบทุกครั้ง

## Auth และ preview runtime guards

- Production ต้องตั้ง `BETTER_AUTH_URL` เป็น absolute HTTPS URL ของ target และ `BETTER_AUTH_TRUSTED_ORIGINS` เป็น HTTPS origins ของ target; ระบบไม่ใช้ localhost fallback
- Production ต้องตั้ง `PREVIEW_SIGNING_SECRET` แยกจาก `BETTER_AUTH_SECRET`; preview token เป็น HMAC อายุสั้นและ scope ตาม revision

## Current evidence boundary

Local code มี target allow-list, exact schema-qualified migration/import/backup/restore checks, transactional content lifecycle และ no-secret output policy แล้ว การรันกับ Supabase จริงต้องแนบ inventory, backup artifact hash, restore result, Vercel environment audit และ smoke evidence ของ environment นั้นก่อนเรียก Preview/Production ว่า ready
