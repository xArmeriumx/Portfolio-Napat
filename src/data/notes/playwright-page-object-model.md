# Playwright Page Object Model: จัดโครง Test ให้ดูแลง่ายโดยไม่ Over-abstract

**Page Object Model (POM)** เป็น pattern ที่รวม locator และ operation ของหน้าไว้ใน object เดียว เพื่อลด code ซ้ำและทำให้ test อ่านง่ายขึ้นเมื่อระบบมีหลาย flow

Playwright documentation อธิบายว่า page object ช่วยสร้าง API ระดับสูงสำหรับ application และรวม selector ไว้ในที่เดียว

ปัญหาคือ POM สามารถกลายเป็น abstraction ขนาดใหญ่เกินจำเป็นได้ถ้าเอาทุกอย่างใส่ class

## เริ่มจาก test ที่ยังไม่มี POM

```ts
test('user can sign in', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('qa@example.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible();
});
```

ถ้ามีหลาย test ทำ flow เดียวกัน การรวม locator เริ่มมีประโยชน์

## สร้าง LoginPage

```ts
import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Sign in' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  async expectLoaded() {
    await expect(this.submit).toBeVisible();
  }
}
```

Test จะเหลือ intent หลัก:

```ts
test('user can sign in', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('qa@example.com', 'secret');

  await expect(
    page.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible();
});
```

## สิ่งที่ควรอยู่ใน Page Object

เหมาะกับ:

- locator ที่ใช้ซ้ำ
- navigation ของหน้า
- action ที่มีความหมายเชิงผู้ใช้
- helper สำหรับ state ของหน้า

ตัวอย่างชื่อที่ดี:

```ts
await checkoutPage.fillShippingAddress(data);
await checkoutPage.selectPaymentMethod('card');
await checkoutPage.placeOrder();
```

ชื่อเหล่านี้อธิบาย business action

## สิ่งที่ไม่ควรซ่อนมากเกินไป

ตัวอย่างที่ abstraction สูงเกิน:

```ts
await app.doEverythingForCheckout();
```

test reader จะไม่รู้ว่าเกิดอะไรขึ้น

POM ที่ดีควรทำให้ test อ่านง่ายขึ้น ไม่ใช่ทำให้ test กลายเป็น black box

## อย่าใส่ assertion ทุกอย่างไว้ใน class

บาง assertion เหมาะกับ page object เช่น:

```ts
async expectLoaded() {
  await expect(this.heading).toBeVisible();
}
```

แต่ assertion ที่เป็น business expectation ของ test ควรอยู่ใน test เพื่อให้ intent ชัด

ตัวอย่าง:

```ts
await checkoutPage.placeOrder();

await expect(
  page.getByText('Order #SO-1001'),
).toBeVisible();
```

## ใช้ Locator ไม่ใช่ ElementHandle

locator ของ Playwright ถูกออกแบบให้ resolve element ปัจจุบันเมื่อ action ทำงาน และมี auto-waiting/retry behavior

ดังนั้นใน POM ควรเก็บ:

```ts
readonly saveButton: Locator;
```

มากกว่าการ cache DOM element ที่อาจ stale หลัง React re-render

## Component Object ใช้ได้เมื่อ UI ซ้ำข้ามหลายหน้า

ไม่จำเป็นต้องมีแต่ Page Object

ถ้า component เช่น navigation, modal หรือ data table ถูกใช้หลายหน้า สามารถแยก object ตาม component:

```ts
export class ConfirmDialog {
  constructor(private readonly page: Page) {}

  get confirmButton() {
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  async confirm() {
    await this.confirmButton.click();
  }
}
```

โครงสร้างจะตรงกับ UI architecture มากกว่าการยัดทุกอย่างไว้ใน page class

## POM กับ fixture

เมื่อ page object ถูกใช้ทุก test สามารถสร้าง fixture:

```ts
import { test as base } from '@playwright/test';

type Fixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

แล้ว test:

```ts
test('login screen loads', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.expectLoaded();
});
```

ใช้ fixture เมื่อมันลด boilerplate จริง ไม่ใช่เพียงเพื่อให้ architecture ดูซับซ้อน

## Anti-pattern ที่เจอบ่อย

### 1. BasePage ขนาดใหญ่

```text
BasePage
├── click()
├── fill()
├── wait()
├── screenshot()
├── api()
├── login()
└── database()
```

สุดท้ายทุก page สืบทอด utility ที่ไม่เกี่ยวข้อง

Playwright มี API เหล่านี้อยู่แล้ว ไม่จำเป็นต้อง wrap ทุก method

### 2. Selector อยู่ในหลายที่

ถ้า Page Object มี locator แต่ test ยังใช้ CSS selector ซ้ำเอง แปลว่า abstraction ไม่มี boundary ชัด

### 3. POM ผูกกับ nth()

```ts
page.locator('button').nth(4)
```

ควรเลือก locator ที่สะท้อน user-facing behavior ก่อน

## เมื่อไรไม่ควรใช้ POM

ถ้ามี test 3–5 ตัวและหน้าไม่ซับซ้อน POM อาจเพิ่มไฟล์มากกว่าประโยชน์

เริ่มจาก test ที่อ่านง่ายก่อน แล้ว extract duplication ที่เกิดจริง

## Checklist POM ที่ maintain ได้

- class มี responsibility เดียว
- action มีชื่อเชิง business
- locator ใช้ role/label/test id ที่เหมาะสม
- ไม่ wrap Playwright API ทุกตัว
- assertion ของ business case ยังอ่านได้จาก test
- component ซ้ำแยกเป็น component object
- fixture ใช้เมื่อช่วยลด setup ซ้ำ

## อ่านต่อ

- [Playwright คืออะไร?](/th/notes/playwright-thai-guide)
- [Playwright Locators](/th/notes/playwright-locators-best-practices)
- [Playwright Authentication](/th/notes/playwright-authentication)
- [Software Testing Guides](/th/notes/testing)

## Official reference

- [Playwright Page Object Models](https://playwright.dev/docs/pom)
