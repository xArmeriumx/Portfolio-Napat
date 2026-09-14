---
title: "Next.js Server Actions Security: Validation, Authorization และ CSRF ที่ต้องระวัง"
excerpt: "Server Actions ข้าม network boundary ได้ ใครก็ยิงตรงได้โดยไม่ผ่าน UI มาดู checklist 4 ชั้น: validate ด้วย Zod, authenticate, authorize เจ้าของข้อมูล และจัดการ error อย่างปลอดภัย"
seo_title: "Next.js Server Actions Security Checklist"
seo_description: " checklist ปลอดภัย Next.js Server Actions: validation ด้วย Zod, authentication, authorization ระดับ record, CSRF และ error handling พร้อมตัวอย่างโค้ด"
order: 18
---

# Next.js Server Actions Security: Validation, Authorization และ CSRF ที่ต้องระวัง

**คำตอบสั้น:** Server Actions เรียกข้าม network ได้ — ผู้โจมตีไม่ต้องผ่านฟอร์มเรา ยิง request ตรงได้เลย ดังนั้นทุก action ต้องผ่าน 4 ด่านเสมอ: 1) validate รูปร่างข้อมูลด้วย Zod 2) ยืนยันตัวตน (ใครเรียก) 3) ตรวจสิทธิ์ระดับ record (แตะข้อมูลชิ้นนี้ได้ไหม) 4) คืน error ที่ไม่หลุดข้อมูลภายใน

## สภาพแวดล้อม

- Next.js 14+ App Router
- อ่านพื้นฐานก่อนที่ [Next.js Server Actions คืออะไร? ใช้เมื่อไร และต่างจาก Route Handler อย่างไร](/th/notes/nextjs-server-actions) — ฉบับนี้ต่อยอดเรื่องความปลอดภัยโดยเฉพาะ

## ด่านที่ 1: Validation ด้วย Zod (ห้ามไว้ใจ client)

```ts
'use server';

import { z } from 'zod';

const updateNoteSchema = z.object({
  noteId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
});

export async function updateNote(input: unknown) {
  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'ข้อมูลไม่ถูกต้อง' };
  }
  // ... ไปด่านต่อไปด้วย parsed.data ที่ type-safe แล้ว
}
```

ใช้ `safeParse` ไม่ใช่ `parse` — action ต้อง return error ที่คุมได้ ไม่ใช่ throw ดิบ

## ด่านที่ 2: Authentication (ใครกำลังเรียก)

```ts
import { auth } from '@/server/auth';

export async function updateNote(input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: 'กรุณาเข้าสู่ระบบ' };
  }
  // ...
}
```

ทุก action ที่แตะข้อมูลส่วนตัวต้องเช็ก session ก่อนเสมอ แม้หน้า UI จะซ่อนปุ่มไว้แล้ว — การซ่อนปุ่มไม่ใช่การป้องกัน

## ด่านที่ 3: Authorization ระดับ record (ด่านที่โดนเจาะบ่อยสุด)

validation ผ่าน + login แล้ว ยังไม่พอ ต้องถามว่า "user คนนี้แตะ record ชิ้นนี้ได้ไหม":

```ts
export async function updateNote(input: unknown) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'กรุณาเข้าสู่ระบบ' };

  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'ข้อมูลไม่ถูกต้อง' };

  const note = await prisma.note.findUnique({
    where: { id: parsed.data.noteId },
  });
  if (!note || note.ownerId !== session.user.id) {
    return { ok: false, error: 'ไม่พบข้อมูล' };
  }

  await prisma.note.update({
    where: { id: note.id },
    data: { title: parsed.data.title },
  });
  return { ok: true };
}
```

สังเกตว่า error กรณี "ไม่มี record" กับ "ไม่ใช่เจ้าของ" คืนข้อความเดียวกัน (`ไม่พบข้อมูล`) — เพื่อไม่ให้ผู้โจมตีเดา id ของคนอื่นแล้วแยกแยะได้ว่า id ไหนมีอยู่จริง (IDOR enumeration)

สำหรับระบบ multi-tenant (เช่น แยกร้านด้วย `shopId`) ให้เช็กขอบเขต tenant ทุกครั้ง ดู pattern เต็มที่ [Server Actions + Prisma Transaction](/th/notes/prisma-transaction-nextjs)

## ด่านที่ 4: CSRF และ error handling

**CSRF:** Next.js Server Actions มีการป้องกัน CSRF ในตัว (ตรวจสอบ origin/host ของ request ที่เรียก action) จึงปลอดภัยกว่าการเปิด POST endpoint เองโดยทั่วไป แต่มีเงื่อนไข: อย่าไปปิดหรือข้ามการตรวจสอบนี้ และถ้า action ต้องเรียกข้าม origin จริง ๆ ให้ย้ายไปเป็น Route Handler ที่คุม CORS เองอย่าง explicit แทน

**Error handling:** กฎ 2 ข้อ

1. ไม่ส่งข้อความ error ดิบ (Prisma error, stack trace) กลับ client — log ไว้ฝั่ง server แล้วคืนข้อความกลาง ๆ
2. แยก error ที่ผู้ใช้แก้ได้ (ข้อมูลผิด, สิทธิ์ไม่พอ) ออกจาก error ระบบ (DB ล่ม) เพื่อแสดง UI ถูก

```ts
try {
  await prisma.note.update({ where: { id }, data });
} catch {
  console.error('updateNote failed', { noteId: id });
  return { ok: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
}
```

## Checklist ก่อน merge ทุก action

- [ ] `safeParse` ทุก input จาก client
- [ ] เช็ก session ทุก action ที่แตะข้อมูลส่วนตัว
- [ ] เช็ก ownership/tenant ระดับ record (ไม่ใช่แค่ login)
- [ ] error กรณีไม่มีสิทธิ์ คืนข้อความเดียวกับกรณีไม่มีข้อมูล
- [ ] ไม่หลุด stack trace / Prisma error ถึง client
- [ ] `revalidatePath` หลัง mutation ที่เปลี่ยนหน้าที่ render ไว้

## อ้างอิง

- Next.js Server Actions / Updating Data: https://nextjs.org/docs/app/getting-started/updating-data
- Prisma + Next.js: https://docs.prisma.io/docs/guides/v8/frameworks/nextjs

## บทความที่เกี่ยวข้อง

- [Next.js Server Actions คืออะไร? ใช้เมื่อไร และต่างจาก Route Handler อย่างไร](/th/notes/nextjs-server-actions)
- [Next.js Server Actions + Prisma Transaction: ทำ Mutation ให้ Atomic](/th/notes/prisma-transaction-nextjs)
- [โน้ต Next.js ทั้งหมด](/th/notes/nextjs)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
