---
title: "Next.js Server Actions explained: when to use them vs Route Handlers"
excerpt: "Server Actions are server-running functions callable directly from forms and event handlers without an API route. Learn when to use them, when Route Handlers fit better, and see a contact-form example."
seo_title: "Next.js Server Actions vs Route Handlers"
seo_description: "What are Next.js Server Actions, when to use them, and how they differ from Route Handlers, with a contact-form example and selection criteria."
order: 17
---

# Next.js Server Actions explained: when to use them vs Route Handlers

**Short answer:** Server Actions are `"use server"` functions that run on the server but can be called directly from `<form action={...}>` or event handlers — no API route needed. Use them for UI-bound mutations (forms, saves, deletes). Route Handlers fit endpoints called from outside (webhooks, a REST API for a mobile app).

## Environment

- Next.js 14+ (App Router)
- Same pattern on React 19 / Next.js 16
- Any database; this example uses Prisma

## Example: contact form with no API route

`app/contact/actions.ts`:

```ts
'use server';

import { z } from 'zod';
import { prisma } from '@/server/db';

const contactSchema = z.object({
  email: z.string().email('Invalid email format'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
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
      <button type="submit">Send message</button>
      {state && !state.ok && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

No `fetch`, no `/api/contact` — Next.js transports the data and invokes the server function for you.

## Server Actions vs Route Handlers: how to choose

| Criterion | Server Actions | Route Handler (`route.ts`) |
|---|---|---|
| Called from your own app's form/event | Ideal | Possible but hand-write fetch |
| Called from outside (webhooks, mobile apps) | Not possible | Ideal |
| Custom HTTP methods/status/cache headers | Not available | Full control |
| Validation + direct DB writes | Yes | Yes |
| Progressive enhancement (works with JS off) | Yes | DIY |

Rule of thumb: **UI-bound mutations → Server Actions; system-facing endpoints → Route Handlers.**

## Why server-side validation is non-negotiable

HTML `required` and `minLength` help UX, not security — anyone can POST directly, bypassing your form. The `zod.safeParse` in the action is the only gate that counts. See the full checklist in [Next.js Server Actions Security](/notes/nextjs-server-actions-security).

## Common mistakes

1. **Trusting client data** — skipping server validation lets junk or malicious data into the database.
2. **Throwing raw errors** — stack traces leak to users; return a controlled `{ ok: false, error }` instead.
3. **Forgetting revalidation after mutation** — fresh data never shows because of stale cache; call `revalidatePath`/`revalidateTag` after successful writes.
4. **One fat action** — actions should stay thin (validate > authorize > write); extract complex logic into service functions you can test separately.

## References

- Next.js Server Actions / Updating Data: https://nextjs.org/docs/app/getting-started/updating-data
- Prisma + Next.js: https://docs.prisma.io/docs/guides/v8/frameworks/nextjs

## Related notes

- [Next.js Server Actions Security: validation, authorization and CSRF](/notes/nextjs-server-actions-security)
- [Next.js Server Actions + Prisma Transaction: atomic mutations](/notes/prisma-transaction-nextjs)
- [All Next.js notes](/notes/nextjs)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
