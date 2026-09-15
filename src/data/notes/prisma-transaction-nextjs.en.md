---
title: "Next.js Server Actions + Prisma Transaction: atomic mutations"
excerpt: "Creating an order with lines must fully succeed or fully fail. Wrap multi-writes in one Prisma $transaction for atomicity, with shopId authorization inside the same transaction."
seo_title: "Next.js Prisma Transaction for atomic mutations"
seo_description: "How to use Prisma $transaction in Next.js Server Actions so multi-writes are atomic, with multi-tenant checks and an order-creation example."
order: 19
---

# Next.js Server Actions + Prisma Transaction: atomic mutations

**Short answer:** When one mutation writes several tables (create order + order lines + decrement stock) and a middle step fails, data is left half-written. Wrap every write in a single `prisma.$transaction` — all succeed or all roll back, never half states.

## Environment

- Next.js 14+ App Router + Server Actions
- Prisma 5/6 + PostgreSQL
- Read [Server Actions explained](/notes/nextjs-server-actions) and the [Security checklist](/notes/nextjs-server-actions-security) first

## The problem: sequential writes with no transaction

```ts
// Wrong: if line 3 throws, you keep an empty order with no lines
const order = await prisma.order.create({ data: { shopId, total } });
for (const line of lines) {
  await prisma.orderLine.create({ data: { orderId: order.id, ...line } });
}
await prisma.stock.update({ where: { id: stockId }, data: { qty: { decrement: 1 } } });
```

Whatever step fails leaves its partial state behind — and a retried request (double-clicked button) can create a duplicate order.

## The fix: interactive transaction

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
  if (!session?.user) return { ok: false, error: 'Please sign in' };

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const { shopId, lines } = parsed.data;

  // Authorization gate: user must belong to this shop
  const membership = await prisma.shopMember.findUnique({
    where: { shopId_userId: { shopId, userId: session.user.id } },
  });
  if (!membership) return { ok: false, error: 'Not found' };

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Re-read and re-check *inside* the transaction against one snapshot
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
    return { ok: false, error: 'Something went wrong, please retry' };
  }
}
```

## Why this shape

1. **Atomic** — every write in the callback commits together or rolls back together. No empty orders, no orphan lines.
2. **Authorization inside the transaction** — reads go through `tx` (not bare `prisma`) for a single snapshot, and `product.shopId !== shopId` blocks cross-shop writes (multi-tenant isolation).
3. **Prices from the DB, never the client** — `price` comes from the re-read `product.price`. Accepting prices from the client lets users price their own orders.
4. **Internal errors thrown, caught outside** — technical codes (`SHOP_NOT_FOUND`) stay in server logs, never reaching the client.

## Array `$transaction([...])` vs interactive: when each fits

```ts
// Array form: fast, for independent writes with no mid-reads
await prisma.$transaction([
  prisma.order.update({ where: { id }, data: { total } }),
  prisma.auditLog.create({ data: { orderId: id, action: 'CONFIRMED' } }),
]);
```

- Array form — independent queries, shorter code.
- Callback (interactive) form — later steps need earlier results (read product, then create line), with logic and branching.

Order creation that reads before writing needs the callback form.

## Common mistakes

1. **Mixing `prisma` and `tx` in the callback** — queries on bare `prisma` do not join the transaction. Use `tx` for everything inside.
2. **Overlong transactions** — never call external APIs or do slow work in the callback; it holds a connection. Do outside I/O before entering.
3. **Accepting prices or totals from the client** — always recompute from DB data.
4. **Unbounded array schemas** — unlimited `lines` is a heavy-request vector; always set `.max(50)`.
5. **No double-submit handling** — add an idempotency key (e.g. unique `clientMutationId`) when the action must not run twice.

## References

- Prisma + Next.js: https://docs.prisma.io/docs/guides/v8/frameworks/nextjs
- Next.js Server Actions / Updating Data: https://nextjs.org/docs/app/getting-started/updating-data

## Related notes

- [Next.js Server Actions Security: validation, authorization and CSRF](/notes/nextjs-server-actions-security)
- [Next.js Server Actions explained: when to use them vs Route Handlers](/notes/nextjs-server-actions)
- [All Next.js notes](/notes/nextjs)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
