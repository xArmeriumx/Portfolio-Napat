# Case studies — editorial drafts EN/TH

Status: ready for owner fact review, not published. Evidence: current `src/data/projects.js` at baseline 996e2ed. Descriptions below use recorded responsibilities; source repositories and live business outcomes have not been independently audited. No numeric impact claims are added. Update existing project drafts; preserve slugs, media and other fields.

## /projects/shop-inventory-management

### EN — Building inventory and sales workflows with testable business logic

An inventory and sales application has to keep stock movements, access permissions and financial calculations consistent. In this project, my recorded role was Fullstack Developer, covering database design, authentication/RBAC, inventory and financial logic, and deployment configuration.

The implementation used Next.js, TypeScript, Prisma and PostgreSQL. The work separated services into domain modules and used pure functions for calculation logic so that business rules could be tested independently. TypeScript and Zod supported the boundaries between inputs and application logic.

The testing work included unit tests against business requirements. This case study should be read as a description of the implementation approach, not a claim that all current production workflows have been independently verified. Before publication, attach one representative calculation test and a current CI run, and verify the author's exact role and delivery dates.

Explore the [repository](https://github.com/xArmeriumx/Shop-inventory) and [project](https://napatdev.com/projects/shop-inventory-management). For development and QA opportunities, [contact Napat](https://napatdev.com/contact).

### TH — ออกแบบงานสต็อกและการขายให้ทดสอบกฎธุรกิจได้

ระบบสต็อกและการขายต้องรักษาความสอดคล้องของการเคลื่อนไหวสินค้า สิทธิ์ผู้ใช้ และการคำนวณทางการเงิน บทบาทที่บันทึกไว้ของผมคือ Fullstack Developer รับผิดชอบการออกแบบฐานข้อมูล ระบบยืนยันตัวตนและ RBAC ตรรกะสต็อกและการเงิน รวมถึงการตั้งค่า deploy

งานนี้ใช้ Next.js, TypeScript, Prisma และ PostgreSQL โดยแยกบริการตามโดเมน และใช้ pure functions สำหรับการคำนวณ เพื่อให้ทดสอบกฎธุรกิจได้โดยไม่ผูกกับหน้าเว็บ TypeScript และ Zod ช่วยตรวจข้อมูลระหว่างชั้นระบบ

งานทดสอบประกอบด้วย unit tests ตามข้อกำหนดธุรกิจ กรณีศึกษานี้อธิบายแนวทางที่บันทึกไว้ ยังไม่ใช่ผลยืนยันว่าทุก workflow ใน Production ปัจจุบันผ่านการทดสอบ ก่อนเผยแพร่ต้องแนบตัวอย่าง calculation test, CI run ล่าสุด และยืนยันบทบาทกับช่วงเวลาของงาน

[ดูผลงาน](https://napatdev.com/th/projects/shop-inventory-management) · [ติดต่อเรื่องงาน](https://napatdev.com/th/contact)

## /projects/automate-test-pipeline

### EN — Connecting API, UI and end-to-end tests to reviewable reports

The testing project for Clean Water Monitoring brought API tests, admin UI checks and end-to-end flows into a repeatable pipeline. My recorded role was Automation Tester. Responsibilities included Page Object Model design, Playwright configuration, execution orchestration, CSV/JSON exports and Google Sheets integration.

The useful boundary is between running tests and presenting evidence: a successful script execution alone does not establish that every business requirement passed. Reports need to retain failed cases, environment information and a link to the corresponding run. The portfolio records Node.js scripts for orchestration and reporting, with GitHub Actions for CI.

Before publication, verify one current pipeline run, one exported report and the repository version. No time-saving or coverage percentage is claimed here.

[Repository](https://github.com/xArmeriumx/-Automate-Test-with-Playwright-Clean-Water-Monitoring-) · [Project](https://napatdev.com/projects/automate-test-pipeline) · [Contact](https://napatdev.com/contact)

### TH — เชื่อม API, UI และ E2E tests กับรายงานที่ตรวจสอบได้

งานทดสอบของ Clean Water Monitoring รวม API tests, หน้า Admin และ E2E flows ไว้ใน pipeline ที่เรียกซ้ำได้ บทบาทที่บันทึกไว้คือ Automation Tester ครอบคลุมการออกแบบ Page Object Model, ตั้งค่า Playwright, จัดลำดับการรันทดสอบ, ส่งออก CSV/JSON และเชื่อม Google Sheets

การรันสคริปต์สำเร็จต้องแยกจากการมีหลักฐานว่าข้อกำหนดธุรกิจผ่าน รายงานควรเก็บรายการที่ไม่ผ่าน สภาพแวดล้อม และลิงก์กลับไปยัง run งานในพอร์ตระบุการใช้ Node.js สำหรับ orchestration และ reporting และ GitHub Actions สำหรับ CI

ก่อนเผยแพร่ต้องตรวจ pipeline run ปัจจุบัน รายงานตัวอย่าง และเวอร์ชัน repository โดยไม่เพิ่มตัวเลข coverage หรือเวลาที่ประหยัดได้หากไม่มีหลักฐาน

[ดูผลงาน](https://napatdev.com/th/projects/automate-test-pipeline) · [ติดต่อ](https://napatdev.com/th/contact)

## /projects/uat-testkit

### EN — Making acceptance criteria and bug reports easier to act on

This project is a reusable UAT, test-case and bug-report template set. My recorded roles were System Analyst and Software Tester, with responsibility for UAT structure, acceptance criteria and reusable test templates.

The template connects a scenario to its expected outcome and records the actual result. Bug reports include reproduction steps and expected versus actual behavior, while the regression checklist helps identify what must be checked again before release. The value is a shared record that developers, testers and business reviewers can discuss.

Before publication, attach a sanitized filled-in example and verify where the templates were used. Do not identify customers, expose project data, or claim fewer defects without supporting evidence.

[Project](https://napatdev.com/projects/uat-testkit) · [Contact](https://napatdev.com/contact)

### TH — ทำ Acceptance Criteria และ Bug Report ให้ทีมลงมือแก้ได้

งานนี้เป็นชุดแม่แบบ UAT, test case และ bug report ที่นำกลับมาใช้ได้ บทบาทที่บันทึกไว้คือ System Analyst และ Software Tester รับผิดชอบโครงสร้าง UAT, acceptance criteria และการทำแม่แบบทดสอบ

แม่แบบเชื่อมสถานการณ์ทดสอบกับผลที่ควรเกิดและผลที่พบจริง Bug report ระบุขั้นตอนทำซ้ำและ expected/actual behavior ส่วน regression checklist ช่วยกำหนดรายการที่ต้องตรวจอีกครั้งก่อน release ทีมพัฒนา ผู้ทดสอบ และผู้ตรวจรับจึงอ้างอิงบันทึกชุดเดียวกันได้

ก่อนเผยแพร่ต้องแนบตัวอย่างที่กรอกแล้วและลบข้อมูลส่วนตัว พร้อมยืนยันบริบทที่นำไปใช้ ไม่เพิ่มชื่อลูกค้าหรืออ้างว่าลด defect หากไม่มีข้อมูลรองรับ

[ดูผลงาน](https://napatdev.com/th/projects/uat-testkit) · [ติดต่อเรื่องงาน](https://napatdev.com/th/contact)
