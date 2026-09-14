---
title: "Playwright คืออะไร? เริ่มเขียน E2E Test ด้วย TypeScript แบบใช้งานจริง"
excerpt: "Playwright คือเครื่องมือทดสอบเว็บแบบ end-to-end ที่รันเบราว์เซอร์จริง มาดูวิธีติดตั้ง เขียนเทสแรก ใช้ locator และ assertion พร้อมรันบน CI แบบ production"
seo_title: "Playwright คืออะไร เริ่ม E2E Test ด้วย TypeScript"
seo_description: "Playwright คืออะไร? คู่มือภาษาไทยเริ่มเขียน E2E Test ด้วย TypeScript: ติดตั้ง เทสแรก locator assertion และรันบน CI พร้อมตัวอย่างใช้งานจริง"
order: 15
---

# Playwright คืออะไร? เริ่มเขียน E2E Test ด้วย TypeScript แบบใช้งานจริง

**คำตอบสั้น:** Playwright คือเครื่องมือทดสอบเว็บแบบ end-to-end (E2E) ที่สั่งเบราว์เซอร์จริง (Chromium, Firefox, WebKit) ให้คลิก พิมพ์ และตรวจสอบผลอัตโนมัติ เหมาะกับทีมที่ใช้ TypeScript เพราะเขียนเทสด้วยภาษาเดียวกับแอป รันเร็ว มี Trace Viewer ดูย้อนหลังตอนเทสพัง และต่อ CI ได้ง่าย

## สภาพแวดล้อม

- Node.js 18+
- TypeScript project (ใช้กับ Next.js ได้ทันที)
- Playwright 1.x (`npm init playwright@latest`)

## ติดตั้ง

```bash
npm init playwright@latest
```

ตัวช่วยจะถาม 4 อย่าง แนะนำให้ตอบแบบนี้:

1. TypeScript — Yes
2. โฟลเดอร์เทส — `tests` (ค่าเริ่มต้น)
3. GitHub Actions workflow — Yes (ถ้าใช้ GitHub)
4. ติดตั้งเบราว์เซอร์ — Yes

## เทสแรก: เปิดหน้าเว็บแล้วเช็กหัวข้อ

ไฟล์ `tests/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('หน้าแรกแสดงหัวข้อถูกต้อง', async ({ page }) => {
  await page.goto('https://napatdev.com/th');

  await expect(page).toHaveTitle(/Napat/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

รันเทส:

```bash
npx playwright test
```

ดูรายงานแบบ UI:

```bash
npx playwright show-report
```

## Locator: วิธีจับ element ที่ไม่พังง่าย

กฎเหล็ก: เลือก locator ตามลำดับความเสถียร จากมากไปน้อย

```ts
// 1. ดีสุด — role + ชื่อที่ผู้ใช้เห็น (พังยากสุดเพราะผูกกับ UI จริง)
await page.getByRole('button', { name: 'ส่งข้อความ' }).click();

// 2. ดี — label ของฟอร์ม
await page.getByLabel('อีเมล').fill('test@example.com');

// 3. พอใช้ — placeholder / text
await page.getByPlaceholder('ค้นหาโน้ต').fill('playwright');

// 4. หลีกเลี่ยง — CSS/XPath ลึก ๆ (แตกทุกครั้งที่แก้ layout)
// page.locator('div > div:nth-child(3) > button.btn-primary')
```

`getByRole` ดีสุดเพราะถ้านักพัฒนาลบปุ่มทิ้ง เทสพังอย่างถูกต้อง (เจอบั๊กจริง) แต่ถ้าแค่ย้ายตำแหน่งปุ่ม เทสยังผ่าน

## Assertion ที่ใช้บ่อย

```ts
// ข้อความปรากฏ
await expect(page.getByText('ส่งข้อความสำเร็จ')).toBeVisible();

// ค่าในช่องกรอก
await expect(page.getByLabel('อีเมล')).toHaveValue('test@example.com');

// URL เปลี่ยนหลัง submit
await expect(page).toHaveURL(/\/success/);

// จำนวนรายการ
await expect(page.getByRole('listitem')).toHaveCount(5);
```

Playwright มี auto-retry: `expect` จะรอจนกว่าเงื่อนไขจะเป็นจริง (ถึง timeout) ไม่ต้องเขียน `sleep` เอง — นี่คือสาเหตุหลักที่เทส Playwright เสถียรกว่าเครื่องมือรุ่นเก่า

## ดูย้อนหลังตอนเทสพังด้วย Trace Viewer

เปิด trace ใน config ครั้งเดียว (`playwright.config.ts`):

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    trace: 'on-first-retry',
  },
});
```

พอเทสรอบแรกพังแล้วรอบ retry ผ่าน/พัง จะมีไฟล์ trace ให้เปิดดูแบบ step-by-step ว่าแต่ละจังหวะหน้าตาเป็นอย่างไร คลิกอะไรไป — ดีบั๊กเทสพังบน CI ที่เราไม่เห็นหน้าจอได้

## รันบน CI (GitHub Actions)

ไฟล์ `.github/workflows/playwright.yml` แบบ production:

```yaml
name: E2E
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

ติดตั้งแค่ Chromium บน CI ก็พอ (เร็วสุด) ส่วน Firefox/WebKit รันบนเครื่องนักพัฒนาก่อน merge

## ข้อผิดพลาดที่พบบ่อย

1. **เขียน `sleep` / `waitForTimeout` ดักเวลา** — เปราะบางและช้า ให้ใช้ `expect` ที่ retry อัตโนมัติ
2. **ใช้ selector ลึกผูกกับ layout** — แก้ CSS นิดเดียวเทสพังทั้งชุด ให้ใช้ role/label
3. **เทสผูกกัน (test 2 ต้องรันหลัง test 1)** — แต่ละเทสต้องตั้งต้นเองได้ (isolated) ใช้ `test.beforeEach` เปิดหน้าใหม่เสมอ
4. **ไม่ล็อกเวอร์ชันเบราว์เซอร์บน CI** — `install --with-deps` ใน workflow เดียวกันทุกครั้ง อย่าใช้เบราว์เซอร์ของเครื่อง CI

## ไปต่อ

- [Playwright Page Object Model ภาษาไทย: โครงสร้าง Test ที่ดูแลง่าย](/th/notes/playwright-page-object-model)
- [โน้ต Testing ทั้งหมด](/th/notes/testing)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
