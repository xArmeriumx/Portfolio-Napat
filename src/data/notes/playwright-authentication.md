# Playwright Authentication: ใช้ storageState ให้ Test เร็วและปลอดภัย

E2E test จำนวนมากเสียเวลาไปกับการ login ซ้ำทุก test ทั้งที่จุดประสงค์ของ test ไม่ได้เกี่ยวกับหน้า login

Playwright รองรับการบันทึก authenticated browser state แล้ว reuse ใน tests ผ่าน `storageState`

แนวคิดคือ:

```text
Auth setup
→ Login 1 ครั้ง
→ Save storageState
→ Tests เริ่มจาก authenticated context
```

## สิ่งสำคัญที่สุด: อย่า commit auth state

Playwright documentation เตือนว่า storage state อาจมี cookies และ headers ที่สามารถใช้ impersonate test account ได้

ดังนั้นควรสร้าง directory:

```text
playwright/.auth/
```

แล้วเพิ่ม:

```gitignore
playwright/.auth
```

อย่าเก็บไฟล์ auth state ใน Git แม้ repository จะเป็น private ถ้าไม่จำเป็น

## สร้าง auth setup

```ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(
  __dirname,
  '../playwright/.auth/user.json',
);

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(
    process.env.E2E_USER_EMAIL!,
  );

  await page.getByLabel('Password').fill(
    process.env.E2E_USER_PASSWORD!,
  );

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible();

  await page.context().storageState({
    path: authFile,
  });
});
```

credential ควรมาจาก environment/secret management ของ CI

## Config setup project

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

หลัง setup สำเร็จ project `chromium` จะเริ่มด้วย authenticated state

## ใช้ account เดียวได้เมื่อไร

Playwright แนะนำ shared account เมื่อ tests สามารถรันพร้อมกันโดยไม่กระทบ server-side state ของกันและกัน

ตัวอย่างที่เหมาะ:

- เปิดหน้า dashboard
- อ่าน profile
- ตรวจ navigation
- ดูข้อมูล read-only

## เมื่อไร shared account ไม่เหมาะ

ถ้า tests แก้ข้อมูลบน server พร้อมกัน เช่น:

- test หนึ่งเปลี่ยนชื่อผู้ใช้
- test หนึ่งลบ order
- test หนึ่งเปลี่ยน permission
- test หนึ่งแก้ setting ของ account เดียวกัน

tests อาจ race กัน

ในกรณีนี้ควรใช้ account แยกต่อ worker หรือสร้าง test data/account เฉพาะ test ตาม architecture ของระบบ

## Multi-role testing

ระบบ ERP/backoffice มักมีหลาย role เช่น:

```text
ADMIN
MANAGER
STAFF
VIEWER
```

ไม่ควรใช้ storageState เดียวแล้วเปลี่ยน role ภายใน test ไปมา

แนวทางชัดกว่าคือสร้าง auth state ต่อ role:

```text
playwright/.auth/admin.json
playwright/.auth/manager.json
playwright/.auth/staff.json
```

แล้วแยก project:

```ts
{
  name: 'admin',
  use: {
    storageState: 'playwright/.auth/admin.json',
  },
},
{
  name: 'staff',
  use: {
    storageState: 'playwright/.auth/staff.json',
  },
}
```

ช่วยให้ permission test อ่านง่ายและแยก state ชัด

## Session expiration

ถ้า auth state มีอายุสั้น setup project จะสร้าง state ใหม่ก่อน test run อยู่แล้ว

อย่าคัดลอก auth file เก่าจากเครื่องหนึ่งไปใช้ระยะยาวบน CI

## ถ้า login มี OTP หรือ external IdP

อาจต้องออกแบบ test authentication strategy แยกจาก production login flow เช่น:

- dedicated test tenant
- dedicated test identity
- backend state seeding ที่ควบคุมสิทธิ์ชัดเจน

ไม่ควรปิด security production เพื่อให้ E2E ง่ายขึ้น

## ทดสอบ login เองยังจำเป็นไหม

จำเป็น

เพียงแต่แยกเป็น tests ของ authentication flow โดยตรง

ตัวอย่าง:

```text
auth.spec.ts
- valid login
- invalid password
- locked account
- logout
- expired session
```

ส่วน business tests อื่น reuse authenticated state

## Debug เมื่อ storageState ใช้ไม่ได้

ตรวจ:

1. setup project รันก่อนหรือไม่
2. path ถูกหรือไม่
3. application ใช้ cookie/localStorage แบบใด
4. cookie domain ตรงกับ baseURL หรือไม่
5. session หมดอายุหรือไม่
6. login redirect เสร็จก่อน save state หรือไม่

## Checklist

- auth file อยู่ใน `.gitignore`
- credential มาจาก secrets
- shared account ใช้เฉพาะ test ที่ไม่ชน state
- multi-role แยก state
- login flow มี dedicated tests
- setup รอ authenticated UI ก่อน save
- CI ไม่ cache auth state ข้าม run โดยไม่จำเป็น

## อ่านต่อ

- [Playwright คืออะไร?](/th/notes/playwright-thai-guide)
- [Playwright Page Object Model](/th/notes/playwright-page-object-model)
- [Playwright Locators](/th/notes/playwright-locators-best-practices)

## Official reference

- [Playwright Authentication](https://playwright.dev/docs/auth)
