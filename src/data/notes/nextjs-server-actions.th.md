---
title: "Next.js Server Actions คืออะไร? ใช้เมื่อไร และต่างจาก Route Handler อย่างไร"
excerpt: "Server Actions คือฟังก์ชันที่รันบน server แต่เรียกจาก form หรือ event ใน Client Component ได้โดยตรง มาดูว่าใช้เมื่อไร และเมื่อไรควรใช้ Route Handler แทน พร้อมตัวอย่างฟอร์มติดต่อ"
seo_title: "Next.js Server Actions คืออะไร ใช้เมื่อไร"
seo_description: "Next.js Server Actions คืออะไร? ใช้เมื่อไร และต่างจาก Route Handler อย่างไร พร้อมตัวอย่างฟอร์มติดต่อและเกณฑ์เลือกให้เหมาะกับงาน"
order: 17
---

# Next.js Server Actions คืออะไร? ใช้เมื่อไร และต่างจาก Route Handler อย่างไร

**คำตอบสั้น:** Server Actions คือฟังก์ชัน `"use server"` ที่รันบน server แต่เรียกได้โดยตรงจาก `<form action={...}>` หรือ event handler โดยไม่ต้องสร้าง API route เอง ใช้เมื่อต้องการ mutation ที่ผูกกับ UI (ฟอร์ม บันทึก ลบ) ส่วน Route Handler เหมาะกับ endpoint ที่ต้องเรียกจากภายนอก (webhook, REST API ให้ mobile app)

## สภาพแวดล้อม

- Next.js 14+ (App Router)
- React 19 / Next.js 16 ใช้ pattern เดียวกัน
- ฐานข้อมูลอะไรก็ได้ ตัวอย่างนี้ใช้ Prisma

## ตัวอย่าง: ฟอร์มติดต่อแบบไม่ต้องสร้าง API route

`app/contact/actions.ts`:

```ts
'use server';

import { z } from 'zod';
import { prisma } from '@/server/db';

const contactSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  message: z.string().min(10, 'ข้อความต้องยาวอย่างน้อย 10 ตัวอักษร'),
});

export async function submitContact(formData: FormData) {
  const parsed = contactSchema.safeParse({
    email: formData.get('email'),
    message: formData.get('message'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  await prisma.contactMessage.create({ data: parsed.data });
  return { ok: true };
}
```

`app/contact/form.tsx`:

```tsx
'use client';

import { useActionState } from 'react';
import { submitContact } from './actions';

export function ContactForm() {
  const [state, submit] = useActionState(
    async (_prev: unknown, formData: FormData) => submitContact(formData),
    null,
  );
  return (
    <form action={submit}>
      <input name="email" type="email" required />
      <textarea name="message" required minLength={10} />
      <button type="submit">ส่งข้อความ</button>
      {state && !state.ok && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

สังเกตว่าไม่มี `fetch` ไม่มี `/api/contact` — Next.js จัดการส่งข้อมูลและเรียกฟังก์ชัน server ให้เอง

## Server Actions vs Route Handler: เลือกอย่างไร

| เกณฑ์ | Server Actions | Route Handler (`route.ts`) |
|---|---|---|
| เรียกจาก form/event ในแอปตัวเอง | เหมาะมาก | ทำได้แต่ต้องเขียน fetch เอง |
| เรียกจากภายนอก (webhook, mobile app) | ไม่ได้ | เหมาะ |
| ต้องคุม HTTP method/status/cache header เอง | ไม่ได้ | ได้เต็มที่ |
| validation + DB write ตรง ๆ | ทำได้เลย | ทำได้เหมือนกัน |
| progressive enhancement (JS ปิดก็ส่งฟอร์มได้) | ได้ | ต้องทำเอง |

กฎจำง่าย: **mutation ผูก UI ใช้ Server Actions, endpoint ผูกระบบอื่นใช้ Route Handler**

## ทำไมต้อง validate ซ้ำบน server

`required` กับ `minLength` ใน HTML ช่วย UX แต่ไม่ช่วย security — ใครก็ยิง request ตรงได้โดยไม่ผ่านฟอร์มเรา `zod.safeParse` ใน action คือด่านจริง ด่านเดียวที่นับ ดู checklist เต็มที่ [Next.js Server Actions Security: Validation, Authorization และ CSRF](/th/notes/nextjs-server-actions-security)

## ข้อผิดพลาดที่พบบ่อย

1. **ไว้ใจข้อมูลจาก client** — ไม่ validate บน server เปิดช่องให้ข้อมูลขยะ/อันตรายเข้าฐานข้อมูล
2. **โยน error ดิบออกไป** — stack trace หลุดถึงผู้ใช้ ให้ return `{ ok: false, error }` ที่คุมข้อความแล้ว
3. **ลืม revalidate หน้าหลัง mutation** — ข้อมูลใหม่ไม่ขึ้นเพราะ cache เก่า ให้เรียก `revalidatePath`/`revalidateTag` หลัง write สำเร็จ
4. **ใส่ logic หนักใน action เดียว** — action ควรบาง (validate > authorize > write) ถ้าซับซ้อนให้แยก service function แล้วเทสแยก

## อ้างอิง

- Next.js Server Actions / Updating Data: https://nextjs.org/docs/app/getting-started/updating-data
- Prisma + Next.js: https://docs.prisma.io/docs/guides/v8/frameworks/nextjs

## บทความที่เกี่ยวข้อง

- [Next.js Server Actions Security: Validation, Authorization และ CSRF ที่ต้องระวัง](/th/notes/nextjs-server-actions-security)
- [Next.js Server Actions + Prisma Transaction: ทำ Mutation ให้ Atomic](/th/notes/nextjs-prisma-transaction)
- [โน้ต Next.js ทั้งหมด](/th/notes/nextjs)

---

ผู้เขียน: ณภัทร ภมรสูตร — [เกี่ยวกับผู้เขียน](/th/about) · [ผลงาน](/th/projects) · [โน้ตทั้งหมด](/th/notes)
