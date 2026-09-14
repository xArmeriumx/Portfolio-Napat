# Playwright Locators ภาษาไทย: ลด Flaky Test ด้วย Selector ที่ดี

Locator เป็นหนึ่งในส่วนที่สำคัญที่สุดของ Playwright เพราะเป็น contract ระหว่าง test กับ UI

ถ้า selector ผูกกับ DOM structure มากเกินไป test จะพังทุกครั้งที่ refactor layout แม้ behavior สำหรับผู้ใช้ยังเหมือนเดิม

Playwright จึงแนะนำให้เลือก locator จาก **user-facing attributes** และ explicit testing contracts

## ลำดับความคิดเวลาเลือก locator

เริ่มจากคำถามว่า:

> ผู้ใช้รู้จัก element นี้จากอะไร?

ถ้าเป็นปุ่ม:

```ts
page.getByRole('button', { name: 'Save' })
```

ถ้าเป็น input:

```ts
page.getByLabel('Email')
```

ถ้าเป็นข้อความ:

```ts
page.getByText('Payment completed')
```

ถ้าไม่มี semantic locator ที่ดีและต้องการ contract เฉพาะ:

```ts
page.getByTestId('order-status')
```

## getByRole ควรเป็นตัวเลือกแรกสำหรับ interactive element

```ts
await page
  .getByRole('button', { name: 'Confirm order' })
  .click();
```

ข้อดีคือ test สื่อว่า user กำลังคลิกอะไร ไม่ได้สื่อว่า DOM มี class อะไร

## getByLabel สำหรับ form

```ts
await page.getByLabel('Customer name').fill('Acme');
```

ถ้า locator นี้หา field ไม่เจอ อาจสะท้อน accessibility issue ของ form ด้วย

## getByText ใช้กับ content มากกว่า control

```ts
await expect(
  page.getByText('Invoice posted', { exact: true }),
).toBeVisible();
```

สำหรับ button/link ควรใช้ role ถ้าเป็นไปได้

## Test ID ไม่ใช่ของเสีย

บางทีมุมมองหนึ่งบอกว่า test id ไม่ semantic แต่ในระบบ enterprise ที่ UI text เปลี่ยนตามภาษา หรือ component ซับซ้อน test id เป็น explicit contract ที่ดีได้

ตัวอย่าง:

```tsx
<div data-testid="invoice-status">
  Posted
</div>
```

Test:

```ts
await expect(
  page.getByTestId('invoice-status'),
).toHaveText('Posted');
```

ใช้เมื่อ role/text ไม่เหมาะ แต่ไม่ควรใส่ test id ให้ทุก element โดยไม่จำเป็น

## ทำไม CSS chain ยาวๆ เปราะ

ตัวอย่างที่ควรหลีกเลี่ยง:

```ts
page.locator(
  '#app > div:nth-child(2) > div > button.primary'
)
```

UI designer เปลี่ยน wrapper แค่หนึ่งชั้น test ก็พัง

XPath ยาวก็มีปัญหาเดียวกัน

## Chaining และ filtering

กรณีรายการหลายแถว:

```ts
const row = page
  .getByRole('row')
  .filter({ hasText: 'INV-2026-001' });

await row
  .getByRole('button', { name: 'Open' })
  .click();
```

นี่อ่านได้ว่า:

1. หา row ของ invoice
2. ภายใน row นั้นกด Open

ดีกว่า `nth(7)` มาก

## Strictness ช่วยจับ selector ที่คลุมเครือ

Locator action ของ Playwright เป็น strict

ถ้า:

```ts
await page.getByRole('button').click();
```

แล้วมีหลาย button Playwright จะไม่เดาให้ว่าเราหมายถึงตัวไหน

ควรแก้ locator:

```ts
await page
  .getByRole('button', { name: 'Save' })
  .click();
```

ไม่ควรแก้ด้วย `.first()` โดยอัตโนมัติถ้าไม่ได้ตั้งใจเลือกตัวแรกจริง

## nth() ใช้ได้ แต่ต้องมีเหตุผล

```ts
page.getByRole('listitem').nth(2)
```

เหมาะเมื่อ “ลำดับ” เป็นส่วนหนึ่งของ requirement จริง

ถ้าใช้เพียงเพราะ locator อื่นหาไม่เจอ test จะเปราะเมื่อ sorting เปลี่ยน

## ตัวอย่าง refactor selector

### ก่อน

```ts
await page.locator(
  '.modal .footer button:nth-child(2)'
).click();
```

### หลัง

```ts
const dialog = page.getByRole('dialog', {
  name: 'Delete invoice',
});

await dialog
  .getByRole('button', { name: 'Delete' })
  .click();
```

เวอร์ชันหลังผูกกับ user-visible behavior มากกว่า DOM

## อย่าแก้ flaky test ด้วย waitForTimeout

Selector ที่ไม่ stable + sleep ยาวขึ้น ไม่ได้ทำให้ test ถูกต้องขึ้น

หลีกเลี่ยง:

```ts
await page.waitForTimeout(5000);
await page.locator('.save-button').click();
```

ใช้ locator + state:

```ts
const save = page.getByRole('button', {
  name: 'Save',
});

await expect(save).toBeEnabled();
await save.click();
```

## Localization กับ locator

ถ้าเว็บรองรับหลายภาษา การใช้ text locator อาจต้องแยก expectation ต่อ locale

อีกทางคือ:

- ใช้ accessible role + localized name ใน test data
- ใช้ test id สำหรับ element ที่ identity ไม่ควรขึ้นกับภาษา

อย่าเปลี่ยนทุกอย่างเป็น CSS เพียงเพราะเว็บมีหลายภาษา

## Checklist เลือก locator

1. Role + accessible name ใช้ได้ไหม
2. Label ใช้ได้ไหม
3. Text/placeholder/alt/title เหมาะไหม
4. มี explicit test id หรือควรเพิ่มไหม
5. Locator unique หรือยัง
6. เรากำลังใช้ nth() เพราะ requirement หรือเพราะหา selector ไม่ได้
7. Selector อิงสิ่งที่ผู้ใช้รับรู้หรืออิง implementation detail

## อ่านต่อ

- [Playwright คืออะไร?](/th/notes/playwright-thai-guide)
- [Playwright Page Object Model](/th/notes/playwright-page-object-model)
- [Playwright Authentication](/th/notes/playwright-authentication)
- [Software Testing Guides](/th/notes/testing)

## Official references

- [Playwright Locators](https://playwright.dev/docs/locators)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
