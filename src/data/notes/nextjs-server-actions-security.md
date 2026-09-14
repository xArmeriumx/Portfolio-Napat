# Next.js Server Actions Security: Auth, Authorization และ Validation ที่ต้องมี

ใน Next.js App Router ปัจจุบัน **Server Actions / Server Functions ไม่ควรถูกมองว่าเป็น function ภายใน UI ที่มีแต่ผู้ใช้ที่เห็นปุ่มเท่านั้นเรียกได้**

เอกสาร Next.js ระบุชัดว่า Server Action ทำงานผ่าน request ฝั่ง server และควรถูกปฏิบัติเหมือน **untrusted server entry point**

ดังนั้นทุก action ที่แตะข้อมูลสำคัญควรมี security boundary ของตัวเอง

## ความเข้าใจผิดที่พบบ่อย

ตัวอย่าง UI:

```tsx
{session?.user?.role === 'ADMIN' && (
  <form action={deleteUser}>
    <button>Delete user</button>
  </form>
)}
```

การซ่อนปุ่มจาก non-admin **ไม่ใช่ authorization**

เพราะ attacker ไม่จำเป็นต้องเข้าผ่าน UI เดิม

Server Action ต้องตรวจสิทธิ์อีกครั้งภายใน action

## Pattern ที่ควรใช้

```ts
'use server';

import { z } from 'zod';

const inputSchema = z.object({
  userId: z.string().uuid(),
});

export async function deleteUser(input: unknown) {
  const session = await requireSession();

  if (!session.user) {
    throw new Error('Unauthorized');
  }

  if (!session.user.permissions.includes('USER_DELETE')) {
    throw new Error('Forbidden');
  }

  const parsed = inputSchema.parse(input);

  await db.user.delete({
    where: {
      id: parsed.userId,
    },
  });
}
```

ลำดับควรชัด:

```text
Request
→ Authentication
→ Authorization
→ Validation
→ Trusted read
→ Mutation
→ Revalidation / Response
```

## 1. Authentication ต้องอยู่ใน Action

อย่าคิดว่า page ถูกป้องกันแล้ว action ปลอดภัยอัตโนมัติ

```ts
const session = await auth();

if (!session?.user) {
  throw new Error('Unauthorized');
}
```

ถ้าใช้ auth library อื่น principle ก็เหมือนกัน

## 2. Authorization ต้องตรวจ resource จริง

มี user แล้วไม่ได้แปลว่ามีสิทธิ์แก้ทุก record

ตัวอย่าง multi-tenant:

```ts
const order = await db.order.findFirst({
  where: {
    id: parsed.orderId,
    shopId: session.shopId,
  },
});

if (!order) {
  throw new Error('Not found');
}
```

query ควรผูก tenant boundary ตั้งแต่ database read

ไม่ควร:

```ts
const order = await db.order.findUnique({
  where: { id: parsed.orderId },
});

// เช็ก shop ทีหลัง
```

ถ้าสามารถบังคับ scope ใน query เดียวได้ จะลดโอกาสลืม tenant check

## 3. Input จาก client ต้องถือว่า untrusted

แม้ TypeScript ฝั่ง client จะระบุ type:

```ts
type Input = {
  amount: number;
};
```

runtime request ยังส่งค่าอะไรก็ได้

จึงควร validate:

```ts
const schema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
});

const input = schema.parse(rawInput);
```

## 4. อย่าเชื่อ ownership ที่ client ส่งมา

ตัวอย่างไม่ดี:

```ts
await db.order.update({
  where: {
    id: input.orderId,
    shopId: input.shopId,
  },
  data: input.data,
});
```

ถ้า `shopId` มาจาก browser ผู้ใช้สามารถเปลี่ยนได้

ให้ derive จาก trusted session:

```ts
const shopId = session.shopId;
```

แล้วใช้ค่า trusted นี้เป็น boundary

## 5. จำกัด field ที่ update

ไม่ควรส่ง object ทั้งก้อนจาก form เข้า Prisma:

```ts
await db.user.update({
  where: { id },
  data: input,
});
```

เพราะ input อาจมี field ที่เราไม่ตั้งใจให้แก้

ให้สร้าง allowlist:

```ts
await db.user.update({
  where: { id },
  data: {
    displayName: parsed.displayName,
    phone: parsed.phone,
  },
});
```

## 6. จำกัดข้อมูลที่ return

Next.js เตือนว่า return value ของ Server Action ถูก serialize กลับ client

ดังนั้นไม่ควร:

```ts
return userRecord;
```

ถ้า record มี field ภายใน เช่น permission metadata, secret flags หรือข้อมูลส่วนตัว

ให้ shape response:

```ts
return {
  id: user.id,
  displayName: user.displayName,
};
```

## 7. Framework CSRF protection ไม่แทน application security

Next.js มี framework-level protections เช่นการตรวจ Origin กับ Host สำหรับ Server Actions

แต่ protection นี้ไม่ได้แทน:

- authentication
- authorization
- input validation
- tenant isolation
- business rule validation

ต้องมีครบที่ application layer

## 8. Mutation สำคัญควรตรวจ state ปัจจุบัน

ตัวอย่าง cancel invoice:

```ts
const invoice = await db.invoice.findFirst({
  where: {
    id: parsed.id,
    shopId,
  },
});

if (!invoice) {
  throw new Error('Invoice not found');
}

if (invoice.status !== 'DRAFT') {
  throw new Error('Only draft invoices can be cancelled');
}
```

Authorization บอกว่า “ใครทำได้”

Business validation บอกว่า “สถานะนี้ทำได้หรือไม่”

สองอย่างนี้ไม่ใช่เรื่องเดียวกัน

## 9. ใช้ transaction เมื่อ mutation มีหลาย write

ถ้า action ต้อง:

```text
Create Payment
→ Update Invoice
→ Write Audit Log
```

ถ้าทั้งสามต้องสำเร็จพร้อมกัน ควรออกแบบ transaction

อ่านต่อ:

[Prisma Transaction ใน Next.js](/th/notes/prisma-transaction-nextjs)

## 10. Revalidation หลัง mutation

หลัง write สำเร็จต้องพิจารณาว่า cached UI ไหนต้อง update

อ่านต่อ:

[Next.js Revalidation หลัง Server Actions](/th/notes/nextjs-server-actions-revalidation)

## Production checklist

Server Action ที่เขียนเสร็จควรตอบได้ว่า:

- ใครเรียกได้
- ตรวจ session ที่ไหน
- ตรวจ permission ที่ไหน
- resource อยู่ tenant ไหน
- input validate ด้วยอะไร
- field ไหนแก้ได้
- state transition ถูกต้องหรือไม่
- mutation atomic หรือไม่
- return data มีเฉพาะที่ UI ต้องใช้หรือไม่
- cache invalidate ตรง scope หรือไม่
- error ถูก log โดยไม่รั่ว sensitive data หรือไม่

## อ่านต่อ

- [Next.js Guides](/th/notes/nextjs)
- [Next.js Server Actions Revalidation](/th/notes/nextjs-server-actions-revalidation)
- [Prisma Transaction ใน Next.js](/th/notes/prisma-transaction-nextjs)

## Official references

- [Next.js Server Actions and Mutations](https://nextjs.org/docs/app/guides/server-actions)
- [Next.js Data Security](https://nextjs.org/docs/app/guides/data-security)
- [Next.js Forms with Server Actions](https://nextjs.org/docs/app/guides/forms)
