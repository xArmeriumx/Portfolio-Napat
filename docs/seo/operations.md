# CMS, migration และ release runbook

## แยก environment ก่อนทำงาน

Production ใช้ `portfolio_cms_prod`, Preview ใช้ `portfolio_cms_preview`, Development ใช้ `portfolio_cms_dev` ตรวจ schema ใน URL และ database จริงก่อนเขียน ห้าม reset schema ที่แชร์ หรือใช้ข้อมูลทดสอบใน Production

Published data และ build fixtures เคยใช้ slug ต่างกัน: ให้ยึด document.slug ใน CMS เป็นแหล่งจริงของการ migration ไม่เปลี่ยน slug เพื่อให้ตรงกับ fixtures เก็บ mapping ก่อน-หลังไว้ หากภายหลังต้องเปลี่ยน ให้ผ่าน Publish flow ที่สร้าง redirect และตรวจ alias เดิมทุกตัว

## เตรียม localization โดยไม่แก้ published revision ย้อนหลัง

1. สำรองฐานข้อมูลด้วย `scripts/backup-portfolio.mjs` ตาม target safeguards เดิม และทดสอบ restore ในฐานข้อมูลแยก ต้องมี pg_dump/pg_restore ก่อน ขั้นตอนนี้ยังไม่ถูกรันในงานนี้
2. ส่งออก snapshot ของ Notes ที่ต้องย้ายเป็น array ของ `{id, revisionId, payload}` ลง `artifacts/` ซึ่งไม่ tracked ไม่รวม auth records/secrets
3. รัน `prepare-note-localization.mjs` ด้วย manifest ว่าง `[]` เพื่อได้ inventory และ SHA-256 ของ body เดิม
4. ผู้ตรวจอ่าน body จริงและกำหนดภาษา ห้ามใช้ตัวตรวจ Unicode ตัดสินอัตโนมัติ คำเทคนิคหรือหัวข้ออังกฤษในบทความไทยไม่แปลว่าบทความเป็นอังกฤษ
5. สร้าง reviewed manifest เป็น array ของ `{id, bodySha256, translations: {th: "…", en: "…"}}` ระบุเฉพาะภาษาที่ตรวจแล้ว ห้ามใส่ body เดียวกันในทั้งสองช่องเพื่อให้สถานะครบ
6. รัน offline preparation:

```sh
node scripts/prepare-note-localization.mjs artifacts/notes-snapshot.json artifacts/reviewed-locales.json artifacts/localization-drafts.json
```

เครื่องมือไม่เขียนฐานข้อมูลและไม่ overwrite output เดิม ปฏิเสธ body hash ที่เปลี่ยนไป Output มี `expectedRevisionId`; ก่อน apply ต้องอ่าน revision ปัจจุบันเทียบอีกครั้งและหยุดหากมี Draft ของเจ้าของเว็บที่ยังไม่ได้รวม

7. ใน Preview ให้บันทึกแต่ละ `payload` ผ่าน authenticated `POST /api/admin/notes/{id}/draft` ตาม API เดิม ตรวจ validation และ Preview EN/TH ของ saved revision ทั้งสองหน้า จากนั้น Publish
8. ตรวจ sitemap, body, schema, canonical, alternates, unknown slug และ old redirects; ทดลอง Archive → Restore as Draft → Preview → Publish โดยไม่ใช้ content ที่แชร์กับ Production
9. เมื่อ Preview ผ่านและมี backup/restore evidence แล้ว จึงทำขั้นตอนเดียวกันบน Production ภายใต้ CMS workflow เดิม พร้อมตรวจว่า published pointers และ revision history ไม่ถูกแก้ย้อนหลัง

ถ้ายังไม่แปล EN ให้เผยแพร่ TH ที่ตรวจแล้วเพียงภาษาเดียว EN fallback จะยังอ่านได้แต่ noindex จุดนี้เป็นการเปลี่ยน indexing ที่ต้องระบุใน release report ไม่ถือว่าการแปล EN เสร็จแล้ว

## ใช้ editor

ช่อง Body Markdown เดิมเป็นต้นฉบับสำหรับ compatibility ใส่ฉบับแปลใน Body EN/Body TH และตรวจ Title แต่ละภาษา Save Draft ก่อนกด Preview EN/TH ทั้งสองปุ่มเปิด saved revision เดียวกัน Publish เฉพาะหลังตรวจ body และ metadata แล้ว Restore สร้าง Draft ใหม่เสมอ

บทความใหม่ใน `content/*.json` ใช้เฉพาะ `payload` ส่ง Create Draft endpoint (`POST /api/admin/notes`) ตาม authentication/CSRF เดิม Wrapper status/evidence ไม่ใช่ API payload ตรวจอ้างอิงและคำแปลก่อน Publish

## Rollback

- โค้ด: redeploy last known good deployment ผ่านระบบเดิม ตรวจ public routes หลังย้อนกลับ
- เนื้อหา: Restore revision เก่าเป็น Draft แล้ว Preview/Publish โดยใช้รุ่นที่ยังรองรับ optional locale fields อย่านำ backup ไปทับ shared database เพื่อแก้เพียงบทความ
- หาก rollback ไปโค้ดเก่าที่ไม่รู้จักฟิลด์ localized: หยุดแก้/Publish Notes จนกลับมารุ่นที่รองรับ เพื่อป้องกัน parser ของโค้ดเก่าตัด optional fields ใน Draft ใหม่
- หลัง rollback ตรวจทั้ง EN/TH, sitemap และ alias ที่คืน slug

## Search Console

เจ้าของบัญชีเปิด Search Console → Add property → Domain → `napatdev.com` แล้วใช้ TXT verification value ที่ Google สร้างจริงใน DNS zone ห้ามสร้างค่า verification เอง หลัง verify ส่ง `https://napatdev.com/sitemap.xml`

ตรวจ URL Inspection ของ Home, About, case study และ Note ทั้งสองภาษา: Live Test, fetch, selected canonical, indexing eligibility และ indexed state เป็นคนละเรื่อง เก็บวันที่และผลแยกกัน ดู Page indexing และ Search performance แยก query/page/country/device

ยังไม่มีบัญชีที่เข้าถึงได้ในการทำงานนี้ ขั้นตอนนี้เป็น pending owner action ไม่ใช่งานที่ยืนยันสำเร็จ

## GA4

สร้าง GA4 property/web stream สำหรับเว็บนี้ หากมีอยู่แล้วให้ใช้ของเดิม คัดลอก Measurement ID `G-…` ไป `NEXT_PUBLIC_GA_MEASUREMENT_ID` ใน environment ที่ต้องการ แล้ว build/deploy ใหม่ ไม่ใส่รหัสใน Git

ปิด Enhanced Measurement ของ stream รวม history page changes, outbound clicks และ file downloads เพราะระบบส่ง manual events และไม่ส่ง query/hash เอง ตรวจการตั้งค่าการเก็บข้อมูลเพิ่มเติมในบัญชีไม่ให้เติม form data/user-provided data/Google Signals

ไม่มี Google request ก่อน opt-in และต้องไม่มี request บน admin/preview ที่เปิดตรง ผู้ใช้เปิด/ปิดได้จาก Analytics preferences ด้านล่างหน้า เมื่อถอนความยินยอม reload เพื่อนำ runtime ออก

ตรวจ DebugView หลัง opt-in: 1 page_view ต่อ pathname ที่เปลี่ยน; query/hash อย่างเดียวไม่เพิ่ม view; contact_click เมื่อคลิก mailto/tel; resume_download สำหรับลิงก์ CV/resume ที่มีจริง; project_outbound_click จากหน้ารายละเอียดโครงการ ไม่มีการส่ง destination URL, email, token หรือ form values

Contact click เป็น contact intent ไม่ใช่ job offer หากเพิ่ม contact form ภายหลัง ต้องส่ง contact_submit_success หลัง server ยืนยันเท่านั้น รุ่นนี้ยังไม่มี event ดังกล่าวเพราะไม่มี submit flow ที่ตรวจพบ

## Production verification ที่ยังต้องทำ

- Migration และ restore rehearsal ผ่านก่อน deploy
- Preview ไม่มี deployment protection ขวางผู้ตรวจที่ได้รับสิทธิ์ ไม่ปิด protection ของ Production โดยคาดเดา
- Crawl ทุก canonical URL ใน sitemap และตรวจ redirect chain, fallback และ 404
- Schema Markup Validator และ Rich Results Test สำหรับชนิดที่รองรับ; CreativeWork valid ไม่รับประกัน rich result
- Mobile/Desktop lab samples ด้วยเงื่อนไขเดียวกันก่อนเทียบ; ค่า localhost/dev เทียบตรงกับ Production เพื่ออ้าง improvement ไม่ได้
- ตรวจ Search Console และเก็บ field CWV หลังมีข้อมูลเพียงพอ ไม่ใช้ lab sample ประกาศ field PASS

## Profile ไทยที่ต้องแก้ใน CMS

Fixture/import adapter รองรับฟิลด์ไทยแล้ว แต่ไม่ควร import fixtures ทับ Production เพื่อเปลี่ยนเพียง profile ให้แก้ Draft ของ profile เดิมเฉพาะช่องต่อไปนี้ และตรวจ Preview:

- identity.name.th: ณภัทร ภมรสูตร
- identity.headline.th: นักพัฒนาเว็บ | นักทดสอบซอฟต์แวร์
- identity.tagline.th: พัฒนาเว็บแอปพลิเคชันโดยให้ความสำคัญกับคุณภาพและการทดสอบ เปลี่ยนความต้องการให้เป็นระบบที่ใช้งานได้และตรวจสอบได้
- contact.location.th: กรุงเทพฯ ประเทศไทย

ชื่อ/ตำแหน่ง/ที่อยู่ที่แปลข้างต้นอ้างจากข้อมูลพอร์ตเดิม ไม่เพิ่มประสบการณ์หรือคุณสมบัติใหม่
