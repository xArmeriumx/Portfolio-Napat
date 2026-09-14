# Prisma Transaction ใน Next.js: ใช้ $transaction เมื่อไรให้ Mutation เป็น Atomic

Transaction ใช้เมื่อ business operation หนึ่งมีหลาย database operation ที่ต้อง **สำเร็จทั้งหมดหรือ rollback ทั้งหมด**

ตัวอย่าง:

```text
Create Payment
→ Update Invoice Balance
→ Create Audit Log
```

ถ้า step แรกสำเร็จแต่ step สอง fail แล้วไม่มี transaction ระบบจะอยู่ใน state ที่ไม่สมบูรณ์

Prisma Client v6 รองรับหลาย transaction pattern เช่น nested writes, `$transaction([])` และ interactive transactions

## 1. Nested write

เหมาะเมื่อ records มี relation และสร้าง/แก้พร้อมกันผ่าน Prisma relation API

```ts
const order = await prisma.order.create({
  data: {
    number: 'SO-1001',
    lines: {
      create: [
        {
          productId: 'P1',
          quantity: 2,
        },
      ],
    },
  },
});
```

Prisma จัด related writes ให้เป็น atomic operation

## 2. $transaction([])

ใช้เมื่อมี Prisma queries หลายตัวที่ไม่ต้องส่ง result ของ query ก่อนหน้าเข้า query ถัดไป

```ts
const [payment, invoice] = await prisma.$transaction([
  prisma.payment.create({
    data: {
      invoiceId,
      amount,
    },
  }),

  prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: {
        increment: amount,
      },
    },
  }),
]);
```

ถ้า query ใด fail transaction จะ rollback

## 3. Interactive transaction

ใช้กับ flow แบบ:

```text
Read
→ Validate state
→ Calculate
→ Write
```

ตัวอย่าง:

```ts
const result = await prisma.$transaction(
  async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'POSTED') {
      throw new Error('Invoice is not payable');
    }

    const newPaid =
      Number(invoice.paidAmount) + amount;

    if (newPaid > Number(invoice.netAmount)) {
      throw new Error('Payment exceeds residual amount');
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount,
      },
    });

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaid,
      },
    });

    return payment;
  },
);
```

ทุก query ผ่าน `tx` อยู่ใน transaction เดียวกัน

## อย่าเผลอใช้ prisma แทน tx

ผิด:

```ts
await prisma.$transaction(async (tx) => {
  await tx.payment.create(...);

  await prisma.invoice.update(...);
});
```

query ที่ใช้ `prisma` โดยตรงไม่ได้ใช้ transaction handle เดียวกับ `tx`

ภายใน callback ควรใช้ `tx` สำหรับ database operation ที่ต้อง atomic

## Transaction ควรสั้น

อย่าทำ network request ยาวๆ ภายใน interactive transaction ถ้าเลี่ยงได้

ตัวอย่างที่ควรระวัง:

```text
BEGIN
→ Read DB
→ Call external payment API 8 วินาที
→ Write DB
→ COMMIT
```

transaction เปิดนานเกินไปอาจเพิ่ม contention และ connection usage

แนวทางที่ดีกว่าขึ้นกับ domain เช่น:

- เตรียม intent ก่อน
- call external service นอก DB transaction
- กลับมา finalize ด้วย idempotency key
- ใช้ webhook/outbox architecture เมื่อเหมาะสม

## Transaction ไม่ได้แก้ทุก race condition

สมมติสอง request อ่าน stock = 1 พร้อมกัน

ทั้งคู่คำนวณว่า “ขายได้”

แม้แต่ละ request ใช้ transaction หาก isolation/condition ไม่เหมาะสม ก็ยังต้องคิดเรื่อง concurrency

วิธีหนึ่งคือ conditional update หรือ optimistic concurrency control

อ่านต่อ:

[Prisma Optimistic Concurrency Control](/th/notes/prisma-optimistic-concurrency)

## Server Action + transaction

Pattern ที่ดี:

```text
Server Action
→ Authenticate
→ Authorize
→ Validate input
→ Prisma transaction
→ Audit result
→ Revalidate cache
```

ตัวอย่างโครง:

```ts
'use server';

export async function recordPayment(raw: unknown) {
  const session = await requireSession();
  const input = paymentSchema.parse(raw);

  await requirePermission(
    session,
    'PAYMENT_CREATE',
  );

  const result = await paymentService.record({
    shopId: session.shopId,
    memberId: session.memberId,
    input,
  });

  updateTag('invoices');

  return {
    paymentId: result.id,
  };
}
```

ให้ transaction logic อยู่ service layer แทนการยัดทั้งหมดใน action จะ maintain ง่ายกว่า

## Nested write vs array vs interactive

| Pattern | เหมาะกับ |
|---|---|
| Nested write | related records ใน mutation เดียว |
| `$transaction([])` | independent Prisma operations |
| Interactive transaction | read-modify-write + business logic |

อย่าเลือก interactive transaction เป็น default ทุกกรณี เพราะมันมี cost และ complexity มากกว่า

## Timeout และ retry

production system ควรกำหนด behavior เมื่อ transaction timeout หรือเกิด serialization/deadlock ตาม database ที่ใช้

อย่า retry ทุก error แบบ blind เพราะบาง mutation ไม่ idempotent

ก่อน retry ต้องตอบได้ว่า operation ทำซ้ำแล้วเกิด side effect ซ้ำหรือไม่

## Checklist ก่อนใช้ transaction

- operation มีหลาย writes หรือไม่
- ต้อง all-or-nothing จริงหรือไม่
- ใช้ nested write แทนได้หรือไม่
- queries มี dependency กันหรือไม่
- interactive transaction เปิดนานเกินไปหรือไม่
- มี external API อยู่กลาง transaction หรือไม่
- concurrency conflict จัดการหรือยัง
- retry ปลอดภัยหรือไม่
- tenant scope ถูกบังคับทุก query หรือไม่

## อ่านต่อ

- [Prisma Optimistic Concurrency Control](/th/notes/prisma-optimistic-concurrency)
- [Next.js Server Actions Security](/th/notes/nextjs-server-actions-security)
- [Next.js Revalidation](/th/notes/nextjs-server-actions-revalidation)
- [Prisma Guides](/th/notes/prisma)

## Official reference

- [Prisma ORM v6 Transactions](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions)
