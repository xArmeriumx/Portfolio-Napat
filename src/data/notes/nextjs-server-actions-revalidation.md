# Next.js Revalidation หลัง Server Actions: updateTag, revalidatePath, revalidateTag และ refresh ต่างกันอย่างไร

หลัง Server Action แก้ข้อมูลในฐานข้อมูลแล้ว UI อาจยังแสดงข้อมูลเก่า ถ้าข้อมูลนั้นมาจาก cache

ใน Next.js 16 การเลือก invalidation primitive ให้ถูกสำคัญกว่าการเรียก `router.refresh()` ทุกครั้งแบบเดาสุ่ม

แนวคิดคือ:

```text
Mutation สำเร็จ
→ ข้อมูลไหน stale
→ cache ถูกผูกด้วย path หรือ tag
→ ต้องการ fresh ทันทีหรือ stale-while-revalidate
→ เลือก primitive
```

## สรุปสั้น

| API | ใช้เมื่อ |
|---|---|
| `updateTag()` | Server Action ต้องเห็นข้อมูลใหม่ทันทีแบบ read-your-own-writes |
| `revalidateTag()` | ต้องการ refresh ตาม tag และยอม stale-while-revalidate ได้ |
| `revalidatePath()` | รู้ชัดว่า route ไหนได้รับผลกระทบ |
| `refresh()` | ต้อง refresh current route payload โดยไม่ invalidate cached data |

## updateTag()

เหมาะเมื่อ mutation แล้วหน้าเดียวกันต้องเห็นผลใหม่ทันที

```ts
'use server';

import { updateTag } from 'next/cache';

export async function createOrder(input: Input) {
  await db.order.create({
    data: input,
  });

  updateTag('orders');
}
```

ตาม Next.js 16 docs `updateTag()` ใช้ใน Server Actions และทำให้ read ถัดไปรอ fresh data

เหมาะกับ UX แบบ:

```text
User กด Save
→ DB update
→ UI ต้องเห็นข้อมูลใหม่ใน response เดียวกัน
```

## revalidateTag()

ใช้เมื่อข้อมูลหลาย route share tag เดียว

ตัวอย่างแนวคิด:

```ts
import { revalidateTag } from 'next/cache';

revalidateTag('products', 'max');
```

การใช้ profile แบบ stale-while-revalidate เหมาะกับข้อมูลที่ไม่จำเป็นต้อง fresh ทันทีใน mutation response

เช่น:

- public product catalog
- content feed
- dashboard summary ที่ยอม stale ชั่วคราวได้

## revalidatePath()

ถ้า mutation กระทบ route ชัดเจน:

```ts
import { revalidatePath } from 'next/cache';

export async function updateProfile(input: Input) {
  await db.profile.update({
    where: { id: input.id },
    data: {
      displayName: input.displayName,
    },
  });

  revalidatePath('/settings/profile');
}
```

ข้อดีคือเข้าใจง่าย

ข้อเสียคือถ้าข้อมูลเดียวถูกใช้หลาย route ต้องตาม invalidate หลาย path

## refresh()

Next.js มี `refresh()` ฝั่ง Server Action สำหรับขอ RSC payload ใหม่ของ current route

แต่ `refresh()` ไม่ได้มีหน้าที่ invalidate cached data

ดังนั้นถ้า data source ยัง cached อยู่ refresh แล้วก็อาจได้ค่าเดิม

นี่เป็นเหตุผลว่าทำไมต้องแยก:

```text
Refresh UI
≠
Invalidate cache
```

## แล้ว router.refresh() ล่ะ

`router.refresh()` ฝั่ง client ขอ Server Component payload ใหม่

แต่ถ้า server-side data ยัง cache อยู่ payload ใหม่ก็สามารถมีข้อมูลเก่าได้

ดังนั้นอย่าใช้:

```ts
router.refresh();
```

เป็น universal fix หลัง mutation

ให้แก้ invalidation ที่ server action ซึ่งรู้ว่าข้อมูลอะไรเพิ่งเปลี่ยน

## Pattern: update + updateTag

```ts
'use server';

import { updateTag } from 'next/cache';

export async function renameProject(
  projectId: string,
  name: string,
) {
  await db.project.update({
    where: { id: projectId },
    data: { name },
  });

  updateTag(`project:${projectId}`);
  updateTag('projects');
}
```

แยก tag:

- `project:{id}` สำหรับ detail
- `projects` สำหรับ list

ช่วย invalidate เฉพาะ scope ที่เกี่ยวข้อง

## Pattern: route-specific mutation

```ts
'use server';

import { revalidatePath } from 'next/cache';

export async function updateSettings(input: Input) {
  await saveSettings(input);

  revalidatePath('/settings');
}
```

เหมาะเมื่อ data ไม่ได้ถูก reuse หลาย route

## อย่า invalidate ทั้งเว็บโดยไม่จำเป็น

ตัวอย่าง anti-pattern:

```ts
revalidatePath('/', 'layout');
```

ถ้า mutation เปลี่ยนแค่ invoice เดียว การ invalidate กว้างมากจะทำให้ cache efficiency แย่ลงและ reasoning ยากขึ้น

เลือก granularity ให้สอดคล้อง domain

## แยก read model กับ write model

ระบบใหญ่ควรรู้ว่า page อ่านข้อมูลผ่าน key/tag อะไร

ตัวอย่าง:

```text
Order List
tag: orders

Order Detail
tag: order:123

Dashboard
tag: dashboard:sales
```

เมื่อ confirm order:

```text
updateTag(order:123)
updateTag(orders)
updateTag(dashboard:sales)
```

นี่ maintain ง่ายกว่าการสุ่ม revalidate route หลายจุด

## Revalidation ไม่แทน transaction

Cache invalidation เกิดหลัง database mutation

ถ้ามีหลาย write:

```text
Create payment
Update invoice
Write audit log
```

ต้องทำให้ database state ถูกต้องก่อน แล้วค่อย invalidate cache

อ่าน:

[Prisma Transaction ใน Next.js](/th/notes/prisma-transaction-nextjs)

## Security ยังต้องอยู่ก่อน mutation

ก่อนคิดเรื่อง revalidation ต้อง:

1. authenticate
2. authorize
3. validate input
4. execute mutation
5. invalidate

อ่าน:

[Next.js Server Actions Security](/th/notes/nextjs-server-actions-security)

## Checklist เวลา UI ไม่อัปเดตหลัง Save

- data source ถูก cache หรือไม่
- cache ใช้ tag อะไร
- mutation invalidate tag/path ถูกตัวหรือไม่
- ต้อง fresh ทันทีหรือ SWR ได้
- ใช้ `router.refresh()` แก้ปลายเหตุหรือไม่
- mutation สำเร็จจริงก่อน invalidation หรือไม่
- route อ่านข้อมูลจาก source เดียวกับที่เพิ่ง update หรือไม่

## อ่านต่อ

- [Next.js Guides](/th/notes/nextjs)
- [Next.js Server Actions Security](/th/notes/nextjs-server-actions-security)
- [Prisma Transaction ใน Next.js](/th/notes/prisma-transaction-nextjs)

## Official references

- [Next.js Server Actions and Mutations](https://nextjs.org/docs/app/guides/server-actions)
- [updateTag](https://nextjs.org/docs/app/api-reference/functions/updateTag)
- [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [refresh](https://nextjs.org/docs/app/api-reference/functions/refresh)
