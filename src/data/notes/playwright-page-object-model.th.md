---
title: "Playwright Page Object Model ภาษาไทย: โครงสร้าง Test ที่ดูแลง่าย"
excerpt: "เทส Playwright เริ่มพังบ่อยตอนมี 50+ เคสเพราะ selector กระจายทุกไฟล์ แก้ด้วย Page Object Model: รวมวิธีจับ element ไว้ที่ class เดียว พร้อมโครงโปรเจกต์และตัวอย่างจริง"
seo_title: "Playwright Page Object Model ภาษาไทย"
seo_description: "Playwright Page Object Model ภาษาไทย: จัดโครงสร้าง E2E Test ให้ดูแลง่าย รวม locator ไว้ที่ page object พร้อมตัวอย่างโค้ดและโครงโปรเจกต์จริง"
order: 16
---

# Playwright Page Object Model ภาษาไทย: โครงสร้าง Test ที่ดูแลง่าย

**คำตอบสั้น:** เมื่อเทสเยอะขึ้น selector จะกระจายอยู่ทุกไฟล์ แก้ UI จุดเดียวต้องไล่แก้เป็นสิบที่ Page Object Model (POM) แก้ปัญหานี้ด้วยการรวมวิธีจับ element และการกระทำของแต่ละหน้าไว้ใน class เดียว เทสไฟล์เรียกใช้ผ่าน method ที่อ่านเป็นภาษาคน

## สภาพแวดล้อม

- Playwright 1.x + TypeScript
- อ่าน [Playwright คืออะไร? เริ่มเขียน E2E Test](/th/notes/playwright-thai-guide) มาก่อนจะเข้าใจเร็วขึ้น

## ปัญหาที่ POM มาแก้

เทสแบบไม่มีโครงสร้าง (แก้ 1 จุด พัง 10 ไฟล์):

```ts
// tests/contact-a.spec.ts
await page.getByLabel('อีเมล').fill('a@example.com');
await page.getByRole('button', { name: 'ส่งข้อความ' }).click();

// tests/contact-b.spec.ts — selector ชุดเดิม ก๊อปวางซ้ำ
await page.getByLabel('อีเมล').fill('b@example.com');
await page.getByRole('button', { name: 'ส่งข้อความ' }).click();
```

พอเปลี่ยน label ช่องอีเมล ต้องไล่แก้ทุกไฟล์ที่ก๊อปไป POM รวมไว้ที่เดียว แก้ครั้งเดียวจบ

## โครงโปรเจกต์ที่แนะนำ

```text
tests/
  pages/
    contact.page.ts      # page object ต่อ 1 หน้า
    notes.page.ts
  fixtures/
    test.ts              # ขยาย base test ให้เสียบ page object
  contact.spec.ts        # เทสไฟล์เรียกใช้ผ่าน fixture
  notes.spec.ts
```

## ตัวอย่างจริง: หน้าติดต่อ

`tests/pages/contact.page.ts`:

```ts
import { type Locator, type Page } from '@playwright/test';

export class ContactPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('อีเมล');
    this.messageInput = page.getByLabel('ข้อความ');
    this.sendButton = page.getByRole('button', { name: 'ส่งข้อความ' });
    this.successMessage = page.getByText('ส่งข้อความสำเร็จ');
  }

  async goto() {
    await this.page.goto('/th/contact');
  }

  async submit(email: string, message: string) {
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
    await this.sendButton.click();
  }
}
```

`tests/fixtures/test.ts` — เสียบ page object เข้า test context:

```ts
import { test as base } from '@playwright/test';
import { ContactPage } from '../pages/contact.page';

type Fixtures = {
  contactPage: ContactPage;
};

export const test = base.extend<Fixtures>({
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
});
export { expect } from '@playwright/test';
```

`tests/contact.spec.ts` — เทสไฟล์อ่านเป็นภาษาคน:

```ts
import { test, expect } from './fixtures/test';

test('ส่งข้อความติดต่อสำเร็จ', async ({ contactPage }) => {
  await contactPage.goto();
  await contactPage.submit('test@example.com', 'สวัสดีครับ');

  await expect(contactPage.successMessage).toBeVisible();
});
```

## กฎ 3 ข้อของ POM ที่ดี

1. **locator อยู่ใน page object เท่านั้น** — เทสไฟล์ห้ามมี `getBy*` โดยตรง ถ้าเจอแปลว่ารั่ว
2. **method ตั้งชื่อตามสิ่งที่ผู้ใช้ทำ** — `submit()`, `searchFor()` ไม่ใช่ `clickButton()` เพราะถ้า UI เปลี่ยนจากปุ่มเป็นลิงก์ เทสไฟล์ไม่ต้องแก้
3. **page object ห้ามมี `expect`** — การตรวจสอบอยู่ในเทสไฟล์เท่านั้น page object มีหน้าที่กระทำ ไม่ใช่ตัดสิน

## ข้อผิดพลาดที่พบบ่อย

1. **page object ใหญ่เป็น God class** — หน้าไหนมีหลายส่วน ให้แยกเป็น component (เช่น `SearchBar`, `Pagination`) แล้ว compose เข้าด้วยกัน
2. **เก็บ state ข้ามเทสใน page object** — page object สร้างใหม่ทุกเทสผ่าน fixture อย่า cache ข้อมูลระหว่างเทส
3. **ทำ POM ตั้งแต่วันแรกที่มี 3 เทส** — over-engineering ให้เริ่มเขียนตรง ๆ ก่อน พอ selector เริ่มซ้ำไฟล์ที่ 3 ค่อยสกัดเป็น page object
4. **test data ปนกับ locator** — อีเมลทดสอบ ข้อความทดสอบ ควรเป็น parameter ของ method ไม่ใช่ค่าคงที่ใน class

## อ้างอิง

- Playwright documentation: https://playwright.dev/docs/api/class-test

## บทความที่เกี่ยวข้อง

- [Playwright คืออะไร? เริ่มเขียน E2E Test ด้วย TypeScript แบบใช้งานจริง](/th/notes/playwright-thai-guide)
- [โน้ต Testing ทั้งหมด](/th/notes/testing)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
