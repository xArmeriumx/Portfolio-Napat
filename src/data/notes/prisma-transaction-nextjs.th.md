---
title: "Next.js Server Actions + Prisma Transaction: ทำ Mutation ให้ Atomic"
excerpt: "สร้าง order พร้อม order lines หลายแถวแล้วต้องสำเร็จทั้งหมดหรือล้มทั้งหมด ใช้ Prisma $transaction ทำ multi-write ให้ atomic พร้อมเช็กสิทธิ์ shopId ใน transaction เดียวกัน"
seo_title: "Next.js Prisma Transaction ทำ Mutation ให้ Atomic"
seo_description: "วิธีใช้ Prisma $transaction ใน Next.js Server Actions ให้ multi-write สำเร็จทั้งหมดหรือล้มทั้งหมด พร้อมตรวจสิทธิ์ multi-tenant และตัวอย่างสร้าง order"
order: 19
---

# Next.js Server Actions + Prisma Transaction: ทำ Mutation ให้ Atomic

**คำตอบสั้น:** ถ้า mutation หนึ่งครั้งเขียนหลายตาราง (เช่น สร้าง order + order lines + ตัดสต็อก) แล้วขั้นตอนกลางล้ม ข้อมูลจะค้างครึ่ง ๆ วิธีแก้คือห่อทุก write ไว้ใน `prisma.$transaction` เดียวกัน — สำเร็จทั้งหมดหรือ rollback ทั้งหมด ไม่มีสถานะครึ่ง ๆ

## สภาพแวดล้อม

- Next.js 14+ App Router + Server Actions
- Prisma 5/6 + PostgreSQL
- อ่าน [Server Actions คืออะไร](/th/notes/nextjs-server-actions) และ [Security checklist](/th/notes/nextjs-server-actions-security) มาก่อน

## ปัญหา: เขียนทีละขั้นโดยไม่มี transaction

```ts
// แบบผิด: ถ้าบรรทัดที่ 3 โยน error จะได้ order เปล่าที่ไม่มี lines
const order = await prisma.order.create({ data: { shopId, total } });
for (const line of lines) {
  await prisma.orderLine.create({ data: { orderId: order.id, ...line } });
}
await prisma.stock.update({ where: { id: stockId }, data: { qty: { decrement: 1 } } });
```

ล้มตรงไหนก็ค้างตรงนั้น แถม request ซ้ำ (user กดปุ่มสองครั้ง / retry) อาจสร้าง order ซ้ำ

## วิธีแก้: interactive transaction

```ts
'use server';

import { z } from 'zod';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';

const lineSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive().max(999),
});

const createOrderSchema = z.object({
  shopId: z.string().min(1),
  lines: z.array(lineSchema).min(1).max(50),
});

export async function createOrder(input: unknown) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'กรุณาเข้าสู่ระบบ' };

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'ข้อมูลไม่ถูกต้อง' };

  const { shopId, lines } = parsed.data;

  // ด่าน authorization: user ต้องเป็นสมาชิกของ shop นี้
  const membership = await prisma.shopMember.findUnique({
    where: { shopId_userId: { shopId, userId: session.user.id } },
  });
  if (!membership) return { ok: false, error: 'ไม่พบข้อมูล' };

  try {
    const order = await prisma.$transaction(async (tx) => {
      // อ่านและเช็กสิทธิ์ซ้ำ *ใน* transaction กันข้อมูลเปลี่ยนระหว่างทาง
      const shop = await tx.shop.findUnique({ where: { id: shopId } });
      if (!shop) throw new Error('SHOP_NOT_FOUND');

      const created = await tx.order.create({
        data: { shopId, createdById: session.user.id, total: 0 },
      });

      let total = 0;
      for (const line of lines) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
        });
        if (!product || product.shopId !== shopId) throw new Error('BAD_PRODUCT');
        await tx.orderLine.create({
          data: {
            orderId: created.id,
            productId: product.id,
            qty: line.qty,
            price: product.price,
          },
        });
        total += product.price * line.qty;
      }

      return tx.order.update({
        where: { id: created.id },
        data: { total },
      });
    });

    return { ok: true, orderId: order.id };
  } catch {
    console.error('createOrder failed', { shopId });
    return { ok: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
  }
}
```

## ทำไมต้องแบบนี้

1. **Atomic** — ทุก write ใน callback สำเร็จพร้อมกันหรือ rollback พร้อมกัน ไม่มี order เปล่า ไม่มี line กำพร้า
2. **เช็กสิทธิ์ใน transaction** — อ่าน `shop`/`product` ผ่าน `tx` (ไม่ใช่ `prisma` ตรง) เพื่อให้เห็น snapshot เดียวกัน และตรวจ `product.shopId !== shopId` กันข้ามร้าน (multi-tenant isolation)
3. **ราคาเอาจาก DB ไม่ใช่ client** — `price` มาจาก `product.price` ที่อ่านเอง ถ้ารับราคาจาก client ผู้ใช้จะตั้งราคาเองได้
4. **error ภายในโยนแล้วจับข้างนอก** — ข้อความเทคนิค (`SHOP_NOT_FOUND`) ไม่หลุดถึง client มีแค่ log ฝั่ง server

## ทางเลือก: sequential `$transaction([...])` กับ interactive ต่างกันอย่างไร

```ts
// แบบ array: เร็ว เหมาะกับ write อิสระที่ไม่ต้องอ่านผลขั้นกลาง
await prisma.$transaction([
  prisma.order.update({ where: { id }, data: { total } }),
  prisma.auditLog.create({ data: { orderId: id, action: 'CONFIRMED' } }),
]);
```

- แบบ array — query อิสระต่อกัน รันพร้อมกันได้ โค้ดสั้น
- แบบ callback (interactive) — ขั้นต่อไปต้องใช้ผลขั้นก่อน (อ่าน product แล้วค่อยสร้าง line) และต้องการ logic/branching

งานสร้าง order ที่ต้องอ่านก่อนเขียน ใช้แบบ callback เท่านั้น

## ข้อผิดพลาดที่พบบ่อย

1. **ผสม `prisma` กับ `tx` ใน callback** — query ที่ใช้ `prisma` ตรงจะไม่เข้าร่วม transaction ให้ใช้ `tx` ทุกตัวข้างใน
2. **transaction ยาวเกิน** — อย่ายิง API ภายนอกหรือทำงานช้าใน callback เพราะครอง connection นาน ทำ I/O ภายนอกก่อนเข้า transaction
3. **รับราคาหรือยอดรวมจาก client** — คำนวณใหม่จากข้อมูลใน DB เสมอ
4. **ลืม `max` ใน array schema** — `lines` ไม่จำกัดจำนวนคือช่องให้ยิง request หนักถล่ม DB ใส่ `.max(50)` ไว้เสมอ
5. **ไม่ handle ปุ่มกดซ้ำ** — เพิ่ม idempotency key (เช่น `clientMutationId` unique) ถ้า action นี้ห้ามเกิดซ้ำ

## อ้างอิง

- Prisma + Next.js: https://docs.prisma.io/docs/guides/v8/frameworks/nextjs
- Next.js Server Actions / Updating Data: https://nextjs.org/docs/app/getting-started/updating-data

## บทความที่เกี่ยวข้อง

- [Next.js Server Actions Security: Validation, Authorization และ CSRF ที่ต้องระวัง](/th/notes/nextjs-server-actions-security)
- [Next.js Server Actions คืออะไร? ใช้เมื่อไร และต่างจาก Route Handler อย่างไร](/th/notes/nextjs-server-actions)
- [โน้ต Next.js ทั้งหมด](/th/notes/nextjs)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
