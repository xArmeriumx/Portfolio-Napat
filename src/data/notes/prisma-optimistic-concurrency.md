# Prisma Optimistic Concurrency Control: ป้องกัน Lost Update ด้วย version field

เมื่อผู้ใช้หรือ request หลายตัวแก้ record เดียวกันพร้อมกัน ปัญหาหนึ่งที่เกิดได้คือ **lost update**

ตัวอย่าง:

```text
Request A อ่าน version 5
Request B อ่าน version 5

A update สำเร็จ → version 6
B ยังเขียนค่าจาก state เก่า → ข้อมูล A ถูกทับ
```

Optimistic Concurrency Control หรือ OCC แก้ปัญหาโดยไม่ล็อก record ยาวๆ

แนวคิดคือ:

```text
Read current version
→ Update only if version ยังเท่าเดิม
→ Increment version
→ ถ้าไม่ match = conflict
```

## เพิ่ม version field

ตัวอย่าง Prisma schema:

```prisma
model Order {
  id        String   @id @default(cuid())
  status    String
  version   Int      @default(0)
  updatedAt DateTime @updatedAt
}
```

`version` ทำหน้าที่เป็น concurrency token

## อ่าน record พร้อม version

```ts
const order = await prisma.order.findUnique({
  where: { id: orderId },
  select: {
    id: true,
    status: true,
    version: true,
  },
});
```

client หรือ service ที่เริ่ม edit จะรู้ว่า state ที่เห็นมาจาก version ไหน

## Conditional update

แนวทางที่อ่านง่ายคือใช้ condition ทั้ง `id` และ `version`

```ts
const result = await prisma.order.updateMany({
  where: {
    id: orderId,
    version: expectedVersion,
  },
  data: {
    status: 'CONFIRMED',
    version: {
      increment: 1,
    },
  },
});

if (result.count !== 1) {
  throw new Error(
    'Order was changed by another request',
  );
}
```

ถ้ามี request อื่น update ก่อน version จะไม่ตรงและ `count` เป็น 0

ระบบจะไม่เขียนทับข้อมูลเงียบๆ

## ทำไมไม่ใช้ updatedAt อย่างเดียว

timestamp ใช้เป็น concurrency token ได้ในบางระบบ แต่ `version Int` มัก reasoning ง่ายกว่า:

- increment deterministic
- compare ชัด
- ไม่ขึ้นกับ timestamp precision
- test ง่าย

## เหมาะกับ use case แบบไหน

OCC เหมาะเมื่อ:

- มี concurrent requests
- conflict มีโอกาสเกิดแต่ไม่ได้เกิดตลอดเวลา
- ไม่อยาก hold lock ระหว่าง user interaction
- ต้อง detect ว่าข้อมูลถูกแก้หลังจากที่ user เปิดหน้า

ตัวอย่าง:

- booking slot
- approval workflow
- stock reservation
- invoice editing
- settings
- document status transition

## ตัวอย่าง approval

Admin A และ B เปิด document เดียวกัน version 8

A approve ก่อน:

```text
version 8
→ APPROVED
→ version 9
```

B กด Reject จากหน้าที่เปิดค้างไว้

request ของ B ส่ง expectedVersion = 8

conditional update ไม่ match จึง reject operation

UI ควรแจ้ง:

> ข้อมูลถูกเปลี่ยนโดยผู้ใช้อื่น กรุณาโหลดข้อมูลล่าสุดก่อนดำเนินการอีกครั้ง

ดีกว่าปล่อยให้ B เขียนทับ approval ของ A

## Server Action validation

อย่ารับ version แล้ว update โดยไม่เช็ก tenant/resource

```ts
const schema = z.object({
  orderId: z.string(),
  version: z.number().int().nonnegative(),
});

const input = schema.parse(raw);

const result = await prisma.order.updateMany({
  where: {
    id: input.orderId,
    shopId: session.shopId,
    version: input.version,
  },
  data: {
    status: 'CONFIRMED',
    version: {
      increment: 1,
    },
  },
});
```

tenant boundary และ concurrency boundary ควรอยู่ query เดียวกัน

## OCC กับ transaction ใช้ร่วมกันได้

ถ้าการเปลี่ยน order มีหลาย write:

```text
Update Order version
Create Reservation
Create Audit Log
```

สามารถทำ conditional update ภายใน transaction:

```ts
await prisma.$transaction(async (tx) => {
  const updated = await tx.order.updateMany({
    where: {
      id: orderId,
      version: expectedVersion,
    },
    data: {
      status: 'CONFIRMED',
      version: {
        increment: 1,
      },
    },
  });

  if (updated.count !== 1) {
    throw new Error('Concurrent update');
  }

  await tx.auditLog.create({
    data: {
      entityId: orderId,
      action: 'CONFIRM',
    },
  });
});
```

ถ้า version conflict transaction จะ throw และไม่สร้าง audit log

## Retry อย่างระวัง

Conflict ไม่ได้แปลว่าควร retry อัตโนมัติเสมอ

ถ้า user กำลังแก้ document แล้วอีกคนแก้ก่อน การ retry ด้วย input เก่าอาจยังไม่ถูก business intent

บางกรณีควร:

1. โหลด state ใหม่
2. แสดง conflict
3. ให้ user ตัดสินใจอีกครั้ง

automatic retry เหมาะเมื่อ operation สามารถ recompute จาก latest state ได้และ idempotent

## OCC ไม่ใช่ replacement ของ unique constraint

ตัวอย่าง booking slot:

ถ้ากฎคือหนึ่ง slot มี booking active ได้เพียงหนึ่งรายการ ควรใช้ database constraint ที่เหมาะสมด้วยถ้าทำได้

OCC ช่วย detect stale state แต่ database constraint ช่วยปกป้อง invariant อีกชั้น

## Checklist

- มี version field
- client/service ส่ง expected version
- update มี version condition
- success ต้อง count = 1
- conflict มี error type ที่ UI เข้าใจ
- tenant scope อยู่ query เดียวกัน
- multi-write ใช้ transaction
- retry เฉพาะ operation ที่ปลอดภัย
- critical invariant มี database constraint เมื่อเหมาะสม

## อ่านต่อ

- [Prisma Transaction ใน Next.js](/th/notes/prisma-transaction-nextjs)
- [Next.js Server Actions Security](/th/notes/nextjs-server-actions-security)
- [Prisma Guides](/th/notes/prisma)

## Official references

- [Prisma ORM v6 Transactions and OCC](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions)
- [Prisma Client API — Optimistic Concurrency](https://www.prisma.io/docs/orm/v6/reference/prisma-client-reference)
