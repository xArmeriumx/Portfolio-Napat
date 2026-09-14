# Playwright คืออะไร? คู่มือ E2E Testing ด้วย TypeScript แบบใช้งานจริง

**Playwright** คือเครื่องมือสำหรับ browser automation และ end-to-end testing ที่รองรับ Chromium, Firefox และ WebKit โดยมี Playwright Test เป็น test runner สำหรับงานทดสอบเว็บแบบครบวงจร

จุดเด่นที่ทำให้ Playwright เหมาะกับ E2E คือแนวคิดเรื่อง **auto-waiting**, **web-first assertions**, browser context isolation และ locator ที่ออกแบบให้ทนต่อการเปลี่ยน DOM มากกว่าการใช้ CSS selector ยาวๆ

## เริ่มต้นติดตั้ง

```bash
npm init playwright@latest
```

ถ้าเป็นโปรเจกต์ TypeScript อยู่แล้ว Playwright รองรับ TypeScript โดยตรง แต่เอกสารทางการระบุว่า Playwright ไม่ได้ทำ full type checking ให้ระหว่างรัน test ดังนั้นใน CI ควรรัน TypeScript compiler แยกด้วย

ตัวอย่าง:

```bash
npx tsc --noEmit
npx playwright test
```

## Test แรก

```ts
import { test, expect } from '@playwright/test';

test('user can open the login page', async ({ page }) => {
  await page.goto('https://example.com/login');

  await expect(
    page.getByRole('heading', { name: 'Sign in' }),
  ).toBeVisible();
});
```

สิ่งที่ควรสังเกตคือเราใช้ `getByRole()` แทน selector อย่าง `.login-page > div:nth-child(2)`

เหตุผลคือ locator แบบ user-facing สะท้อนสิ่งที่ผู้ใช้มองเห็นและมักทนต่อการ refactor UI ได้ดีกว่า

## Locator ที่ควรให้ความสำคัญ

Playwright แนะนำ locator built-in เช่น:

- `getByRole()`
- `getByLabel()`
- `getByText()`
- `getByPlaceholder()`
- `getByAltText()`
- `getByTestId()`

ตัวอย่าง form:

```ts
await page.getByLabel('Email').fill('qa@example.com');
await page.getByLabel('Password').fill('secret');
await page.getByRole('button', { name: 'Sign in' }).click();

await expect(
  page.getByRole('heading', { name: 'Dashboard' }),
).toBeVisible();
```

อ่านรายละเอียดเพิ่มเติมได้ที่ [Playwright Locators ภาษาไทย](/th/notes/playwright-locators-best-practices)

## Test isolation สำคัญกว่าการรัน test ให้เร็วอย่างเดียว

Playwright แยก test ด้วย browser context

แนวคิดคือ test หนึ่งไม่ควรพึ่ง state ของ test ก่อนหน้า เช่น:

```text
Test A สร้างข้อมูล
↓
Test B สมมติว่า Test A รันสำเร็จ
↓
Test C ใช้ session ของ Test B
```

โครงแบบนี้ทำให้ test suite เปราะ

ควรออกแบบให้แต่ละ test setup state ของตัวเอง หรือใช้ fixture/setup ที่มี contract ชัดเจน

## Web-first assertions

อย่าเขียน assertion ด้วยการอ่านค่าทันทีแล้วค่อยเทียบถ้า UI เป็น asynchronous

แทนที่จะทำ:

```ts
const text = await page.locator('.status').textContent();
expect(text).toBe('Completed');
```

ให้ใช้:

```ts
await expect(
  page.getByText('Completed', { exact: true }),
).toBeVisible();
```

Playwright assertion จะ retry ภายใน timeout ตาม behavior ของ framework

## โครงสร้างโปรเจกต์ที่เริ่มได้ง่าย

```text
tests/
├── auth.setup.ts
├── login.spec.ts
├── checkout.spec.ts
├── orders.spec.ts
└── pages/
    ├── LoginPage.ts
    └── CheckoutPage.ts
```

เมื่อ suite โตขึ้นค่อยเพิ่ม Page Object Model เฉพาะส่วนที่มี locator/action ซ้ำจริง

ไม่ควรสร้าง class ครอบทุกหน้าเพียงเพราะเป็น convention

อ่านต่อ: [Playwright Page Object Model](/th/notes/playwright-page-object-model)

## Authentication ไม่ควร login ซ้ำทุก test

ถ้า tests สามารถใช้ account เดียวโดยไม่ชน server-side state สามารถทำ auth setup ครั้งเดียวแล้ว reuse `storageState`

แต่ไฟล์ auth state อาจมี cookie/header ที่ใช้ impersonate account ได้ จึงไม่ควร commit เข้า Git

อ่านต่อ: [Playwright Authentication และ storageState](/th/notes/playwright-authentication)

## ตัวอย่าง playwright.config.ts

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

ค่า config ควรปรับตามระบบจริง ไม่ควรเปิด retry สูงๆ เพื่อซ่อน flaky test

## Flaky test มักเกิดจากอะไร

สาเหตุที่พบบ่อย:

- ใช้ `waitForTimeout()` เป็นหลัก
- selector ผูกกับ DOM structure
- test แชร์ data/state
- API/backend ไม่ deterministic
- assertion ไม่รอ UI state ที่ถูกต้อง
- account เดียวถูก tests หลายตัวแก้ข้อมูลพร้อมกัน

แทนที่จะเพิ่ม sleep:

```ts
await page.waitForTimeout(3000);
```

ควรรอสิ่งที่มีความหมาย:

```ts
await expect(
  page.getByRole('button', { name: 'Confirm' }),
).toBeEnabled();
```

## Roadmap สำหรับคนเริ่ม Playwright

1. เข้าใจ `test`, `expect`, `page`
2. ฝึก locator แบบ role/label/text
3. ทำ test isolation
4. ใช้ storageState สำหรับ auth
5. แยก Page Object เฉพาะจุดที่ซ้ำ
6. เพิ่ม trace/screenshot เมื่อ test fail
7. รัน typecheck + Playwright ใน CI
8. วิเคราะห์ flaky test แทนการเพิ่ม sleep

## อ่านต่อ

- [Playwright Locators Best Practices](/th/notes/playwright-locators-best-practices)
- [Playwright Page Object Model](/th/notes/playwright-page-object-model)
- [Playwright Authentication](/th/notes/playwright-authentication)
- [Software Testing Guides](/th/notes/testing)

## Official references

- [Playwright TypeScript](https://playwright.dev/docs/test-typescript)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Locators](https://playwright.dev/docs/locators)
