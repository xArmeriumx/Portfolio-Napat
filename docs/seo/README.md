# SEO upgrade — napatdev.com

เป้าหมาย: Recruiter และทีมวิศวกรรมค้นพบ Napat Pamornsut / ณภัทร ภมรสูตร ในบทบาท Developer + QA โดยให้ EN/TH สำคัญเท่ากัน

## สถานะและข้อจำกัด

งานนี้เปลี่ยนระบบใน repository พร้อม tests และเตรียมเนื้อหาเป็น Draft ยังไม่ใช่รายงานว่า Production ใช้โค้ดนี้แล้ว หรืออันดับค้นหาเพิ่มขึ้น

- Baseline source: `996e2ed` ก่อนเปลี่ยนโค้ด
- [Production HTTP baseline](evidence/production-before.json): sitemap 200, ตรวจ 51 URLs; พบความไม่ตรงกันของ slug และจำนวน H1 ใน SQL notes; ลิงก์ `/cdn-cgi/l/email-protection` ที่ crawler พบเป็น Cloudflare-generated URL ต้องแยกจาก authored route defects
- [Optimized build + Production DB read-only crawl](evidence/production-build-readonly-after.json): ตรวจ build ในเครื่องที่อ่าน Published CMS จริง ไม่ใช่ deployment บน napatdev.com
- [Local HTTP after](evidence/local-after.json): ตรวจจาก static development adapter ไม่ใช่ฐานข้อมูล Production
- [Production performance baseline](evidence/production-performance-before.json) และ [Local performance sample](evidence/local-performance-after.json): เป็น single-sample Chromium lab data ไม่มี CPU/network throttle ไม่ใช่ Lighthouse, CrUX หรือผล INP; network ของเครื่องขาดระหว่าง production run จึงมีผลวัดไม่ครบ; [การตรวจ Production ซ้ำ](evidence/production-performance-recheck.json) ได้ครบ 24 samples และตอบ 200 ทั้งหมด ยังไม่ใช่ field CWV
- Production DB ถูกตรวจแบบอ่านอย่างเดียว พบ Notes 4 รายการยังไม่มี `bodyMarkdownByLocale` และใช้ slug เก่า (`NEXTJS_ARCHITECTURE`, `TYPESCRIPT_REFERENCE`, `sql_basics_with_examples_easy`, `sql_code_and_response_tables`)
- Lifecycle integration ผ่าน PostgreSQL development schema จริงและ rollback ข้อมูลทุกแถวของ test; ไม่ใช่ Production mutation
- ยังไม่มี Search Console access หรือ GA4 Measurement ID ที่ยืนยันแล้ว ไม่มีการสร้างบัญชี ตั้ง DNS หรือส่ง sitemap แทนเจ้าของบัญชี
- ยังไม่ได้ตรวจ external Schema Markup Validator / Rich Results Test และ authenticated browser CMS E2E บน Preview

**Release gate:** ห้ามนำรุ่นนี้ขึ้น Production ก่อนเตรียมและตรวจ locale bodies ของ Notes เดิม เพราะ legacy ที่ยังไม่จัดภาษาจะอ่านได้ แต่ถูก noindex และอยู่นอก sitemap ตาม policy ใหม่ ต้องทำ migration rehearsal, ตรวจ published CMS content และ Preview deployment ก่อน merge/deploy

## การเปลี่ยนแปลง

- Notes รองรับ `bodyMarkdownByLocale?: { en?: string; th?: string }` โดยคง `bodyMarkdown` เดิม Validation ใช้ Markdown safety ทุกภาษา
- Locale พร้อมเมื่อมี body และ title ภาษานั้น; global language navigation เป็นลิงก์จริงและเปิด listing ของภาษาปลายทางเมื่อหน้านั้นยังไม่มีคำแปล; fallback มีข้อความแจ้ง ไม่ประกาศเป็น translated page, ไม่อยู่ใน hreflang/sitemap และไม่ปล่อย Article schema ที่อ้างภาษาผิด
- Metadata, sitemap, Notes schema และ article language navigation ใช้ availability ชุดเดียวกัน Sitemap ใช้ publish timestamp ของ revision ทั้ง EN/TH และไม่แสดง topic ว่าง
- ภาษา URL เป็นแหล่งจริงของ UI ไม่เปลี่ยนตาม localStorage หน้า Home ไทยมีข้อความและลิงก์หลักภาษาไทย
- About ไม่ใช้ title override ของ Home; page schemas ใช้ URL ตาม locale, publisher เป็น Person ที่ยืนยันจากพอร์ต และ case study ใช้ CreativeWork
- Public dates ใช้ published revision แทน document.updatedAt เพื่อไม่ให้ Draft เปลี่ยนวันที่สาธารณะ
- Runtime อ่านข้อมูลที่ Publish จริงผ่าน cache ของ repository ไม่เสิร์ฟ static fixtures จาก build; Publish/Archive หมดอายุ tag ทันทีและ invalidate locale layouts กับ sitemap
- Restore ยังคงสร้าง Draft และแก้ outgoing redirect ของ slug ที่นำกลับมา Publish เพื่อป้องกัน loop
- Sidebar/previous-next ของ Notes เป็นลิงก์จริง ปรับ Markdown ให้มี document H1 เดียวโดยไม่เปลี่ยน code fences
- ไม่ซ่อนเนื้อหารอ animation และถอด loading boundary ระดับหน้าที่ทำให้ no-JavaScript browser เห็นแต่ skeleton
- LiveRunner/Monaco โหลดเมื่อใช้งาน แทนการรวมในเส้นทางโหลดแรกของบทความ
- Analytics เป็น opt-in และปิดเมื่อไม่มี ID ติดตามเฉพาะ public routes ไม่ส่ง URL query/hash หรือข้อมูลจากฟอร์ม ต้องปิด Enhanced Measurement ใน GA4 ก่อนเปิดใช้เพื่อไม่ซ้ำกับ manual events

## ผลตรวจโค้ดชุดนี้

Typecheck และ build ผ่าน; lint ไม่มี error (31 warnings เดิม); tests 81 ผ่านรวม real PostgreSQL integration; browser E2E 7 ผ่านและ 1 skipped สำหรับ authenticated admin flow ที่ไม่มี credentials ส่วน Analytics ใช้ fake ID และ intercept Google runtime เพื่อไม่ส่งข้อมูลออกจริง ดู [verification](evidence/verification.json)

## ตรวจซ้ำ

```sh
npm run typecheck
npm run test
npm run lint
npm run build
npm run dev -- --port 3100
```

เปิดอีก terminal:

```sh
CMS_E2E_BASE_URL=http://localhost:3100 npm run test:e2e -- e2e/seo.spec.ts
node scripts/seo-audit.mjs http://localhost:3100 artifacts/seo-local.json
node scripts/seo-performance.mjs http://localhost:3100 artifacts/seo-performance.json
```

Integration test ใช้ `SEO_TEST_DATABASE_URL` ที่ระบุ schema `portfolio_cms_dev` เท่านั้น สร้างข้อมูลเฉพาะ run ภายใน transaction และ rollback ทั้งหมด ตรวจว่า user ทดสอบไม่หลงเหลือ ไม่มีการเขียน Production:

```sh
npm run test -- src/content/lifecycle.integration.test.ts
```

ต้องกำหนด environment URL ผ่านระบบ secrets ของเครื่องก่อนรัน คำสั่งปกติที่ไม่มี URL จะ skip integration test อย่างชัดเจน การทดสอบนี้ตรวจ service + database จริง แต่ไม่ได้แทน authenticated browser E2E หรือ backup restore rehearsal

## เนื้อหาและคู่มือ

- [Keyword map และแผน 90 วัน](growth-plan.md)
- [Case studies 3 เรื่อง EN/TH พร้อมช่องว่างหลักฐาน](content/case-studies.md)
- `content/*.json`: บทความ 4 เรื่องพร้อม payload EN/TH สำหรับ Create Draft API เดิม ไม่เผยแพร่อัตโนมัติ
- [Migration, CMS, rollback และ Search Console/GA4](operations.md)

## แหล่งอ้างอิง

- [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions): reciprocal alternates และ URL ของภาษาที่มีจริง
- [Google helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): เนื้อหาที่ช่วยผู้อ่านและตรวจข้อเท็จจริงได้
- [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals): เป้าหมาย field p75 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1
- [GA4 SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications): ตรวจ page views และการเปลี่ยนหน้าใน DebugView
- [Consent mode](https://developers.google.com/tag-platform/security/guides/consent): permission แยก analytics จาก ads
