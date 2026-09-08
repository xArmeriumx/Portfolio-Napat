# Keyword map และแผนเนื้อหา 90 วัน

ไม่มี search volume, ranking หรือ conversion baseline ที่ยืนยันแล้ว คำด้านล่างเป็น intent hypotheses สำหรับเริ่มวัดผล ไม่ใช่ตัวเลขตลาดที่ได้จากเครื่องมือ

## Keyword-to-page map

| หน้าคู่ EN/TH | Intent | English | ไทย | สิ่งที่ผู้อ่านควรพบ |
|---|---|---|---|---|
| `/`, `/th` | Branded discovery | Napat Pamornsut, Napatdev | ณภัทร ภมรสูตร, นภัทร developer (ตรวจจาก query จริงก่อนเพิ่มเป็น alternate name) | ตัวตน Developer + QA และทางไปผลงาน |
| `/about`, `/th/about` | Evaluate candidate | Napat Pamornsut developer tester, web developer Bangkok | ประวัติ ณภัทร ภมรสูตร, นักพัฒนาเว็บและนักทดสอบซอฟต์แวร์ | ประสบการณ์ ทักษะ การศึกษาและ CV ที่มีจริง |
| `/projects`, `/th/projects` | Portfolio evidence | developer QA portfolio, TypeScript portfolio | ผลงานพัฒนาเว็บ, ผลงาน QA Automation | รายการผลงานที่อธิบายบทบาทได้ |
| `/projects/shop-inventory-management` + TH | Fullstack case study | inventory system Next.js case study | กรณีศึกษาระบบสต็อก Next.js | กฎธุรกิจ วิธีพัฒนาและหลักฐานทดสอบ |
| `/projects/automate-test-pipeline` + TH | QA case study | Playwright API UI testing portfolio | ผลงาน Playwright Automation Testing | ขอบเขตทดสอบ pipeline และรายงานจริง |
| `/projects/uat-testkit` + TH | Acceptance evidence | UAT test case bug report template | ตัวอย่าง UAT test case bug report | แม่แบบที่ใช้ได้และตัวอย่างลบข้อมูลส่วนตัวแล้ว |
| `/notes/nextjs` + TH | Technical research | Next.js published content SEO | Next.js SEO สองภาษา | Hub เชื่อมบทความที่มีเนื้อหาจริง |
| `/notes/typescript` + TH | Technical research | TypeScript localized content contract | TypeScript ข้อมูลหลายภาษา | Type/validation และ compatibility |
| `/notes/sql` + TH | Technical research | CMS published revision SQL | SQL revision วันที่เผยแพร่ | ตัวอย่างอ่านข้อมูลที่สัมพันธ์กับงาน |
| `/notes/testing` + TH | Technical research | Playwright SEO testing | ทดสอบ SEO ด้วย Playwright | วิธีตรวจ HTTP, browser และ lifecycle |
| `/contact`, `/th/contact` | Career contact | contact Napat Pamornsut | ติดต่อ ณภัทร ภมรสูตร | ช่องทางติดต่อเรื่องงานที่ใช้งานได้ |

ไม่สร้างหน้ารายจังหวัด/บริการซ้ำ ๆ เพื่อจับ keyword และไม่ทำให้ Home กับ About แย่ง intent เดียวกัน คำค้นบริการรับจ้างยังไม่ใช่เป้าหมายหลัก

## แผน 90 วันหลัง Production release

| ช่วง | งาน | เงื่อนไขเสร็จ |
|---|---|---|
| วัน 1–7 | ตรวจ migration, deploy, sitemap และ Search Console | มีหลักฐาน live URL ไม่ใช่แค่ build ผ่าน |
| วัน 8–14 | ตรวจและ Publish case studies 3 เรื่อง EN/TH | บทบาทและหลักฐานถูกต้อง ไม่มีตัวเลขที่แต่งเพิ่ม |
| วัน 15–30 | ตรวจและ Publish บทความชุดแรก 4 เรื่อง EN/TH; ตรวจ GA4 | มีภาษาจริงและ internal links; consent/event ไม่ซ้ำ |
| วัน 31–45 | ดู queries และ landing pages แยกภาษา | แยก branded/non-branded; ระบุ sample ที่ยังน้อย |
| วัน 46–60 | ปรับ title/description และบทนำจาก intent ที่เห็น | ไม่เปลี่ยน slug; บันทึกวันเปลี่ยนเพื่อเทียบผล |
| วัน 61–75 | ปรับบทความที่มี impressions แต่ตอบคำถามไม่ครบ | เพิ่มตัวอย่างจากงานจริง ไม่เพิ่มบทความบางเพื่อปริมาณ |
| วัน 76–90 | ทบทวน indexing, field CWV และ contact quality | รายงานช่องว่างและงานรอบต่อไปพร้อมหลักฐาน |

ไม่ตั้ง automation ในรอบนี้ เนื่องจากวัน Production release และบัญชีวัดผลยังไม่พร้อม ตารางนี้เริ่มนับหลัง release จริง

## รายงานทุก 28 วัน

เทียบช่วงยาวเท่ากัน แยก EN/TH และ device: impressions, clicks, CTR, average position เป็นบริบท, landing pages, branded/non-branded queries, sitemap eligibility เทียบ indexed pages, field CWV และ contact events แยกจากข้อเสนองานที่เจ้าของเว็บยืนยันเอง

หากมีข้อมูลไม่ครบ 28 วัน ให้รายงานค่าปัจจุบันโดยไม่คำนวณ growth ที่ทำให้เข้าใจผิด การไม่ปรากฏใน rich result ไม่เท่ากับ schema ผิด และการเพิ่ม impressions ไม่เท่ากับได้งานมากขึ้น

## Profile distribution drafts

**GitHub / LinkedIn EN:** Web Developer & Software Tester based in Bangkok. I build web applications and work on testable business logic, API/UI automation and clear acceptance criteria. Explore my projects and development notes at https://napatdev.com.

**GitHub / LinkedIn TH:** นักพัฒนาเว็บและนักทดสอบซอฟต์แวร์ในกรุงเทพฯ สนใจการพัฒนาเว็บ กฎธุรกิจที่ทดสอบได้ การทดสอบ API/UI และ acceptance criteria ที่ชัดเจน ดูผลงานและโน้ตการทำงานได้ที่ https://napatdev.com/th

ส่งเป็น draft เท่านั้น ตรวจความถูกต้องกับประวัติจริงก่อนใช้ ไม่มีการแก้โปรไฟล์ภายนอกหรือส่ง outreach แทนเจ้าของบัญชี
