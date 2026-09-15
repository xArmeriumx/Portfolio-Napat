---
title: "Next.js Server Actions Security: validation, authorization and CSRF"
excerpt: "Server Actions cross the network boundary — anyone can invoke them directly without your UI. Apply 4 layers every time: Zod validation, authentication, record-level authorization, and safe errors."
seo_title: "Next.js Server Actions Security Checklist"
seo_description: "Next.js Server Actions security checklist: Zod validation, authentication, record-level authorization, CSRF, and error handling with code examples."
order: 18
---

# Next.js Server Actions Security: validation, authorization and CSRF

**Short answer:** Server Actions cross the network — attackers can invoke them directly without touching your UI. Every action must pass 4 gates: 1) validate shape with Zod, 2) authenticate (who is calling), 3) authorize at record level (may they touch this row), 4) return errors that leak nothing internal.

## Environment

- Next.js 14+ App Router
- Basics first: [Server Actions explained: when to use them vs Route Handlers](/notes/nextjs-server-actions) — this note continues with security

## Gate 1: Zod validation (never trust the client)

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
    return { ok: false, error: 'Invalid input' };
  }
  // ... continue with type-safe parsed.data
}
```

Use `safeParse`, not `parse` — actions must return controlled errors, never throw raw ones.

## Gate 2: Authentication (who is calling)

```ts
import { auth } from '@/server/auth';

export async function updateNote(input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: 'Please sign in' };
  }
  // ...
}
```

Every action touching private data checks the session first — hiding the button in the UI is not protection.

## Gate 3: Record-level authorization (the most-breached gate)

Valid input plus a login is still not enough. Ask: "may this user touch this exact row?"

```ts
export async function updateNote(input: unknown) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Please sign in' };

  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  const note = await prisma.note.findUnique({
    where: { id: parsed.data.noteId },
  });
  if (!note || note.ownerId !== session.user.id) {
    return { ok: false, error: 'Not found' };
  }

  await prisma.note.update({
    where: { id: note.id },
    data: { title: parsed.data.title },
  });
  return { ok: true };
}
```

Note the "missing record" and "not the owner" cases return the identical message (`Not found`) — so attackers probing other people's ids cannot distinguish existing ids from absent ones (IDOR enumeration).

For multi-tenant systems (e.g. scoping shops by `shopId`), check the tenant boundary every time. See the full pattern in [Server Actions + Prisma Transaction](/notes/prisma-transaction-nextjs).

## Gate 4: CSRF and error handling

**CSRF:** Next.js Server Actions have built-in CSRF protection (origin/host verification on action requests), making them safer than a hand-rolled POST endpoint in general. Conditions: never disable or bypass that verification, and if an action genuinely must be called cross-origin, move it to a Route Handler with explicit CORS instead.

**Error handling:** two rules.

1. Never return raw errors (Prisma errors, stack traces) to the client — log server-side, return a generic message.
2. Separate user-fixable errors (bad input, insufficient rights) from system errors (DB down) so the UI responds correctly.

```ts
try {
  await prisma.note.update({ where: { id }, data });
} catch {
  console.error('updateNote failed', { noteId: id });
  return { ok: false, error: 'Something went wrong, please retry' };
}
```

## Pre-merge checklist for every action

- [ ] `safeParse` all client input
- [ ] Session check on every action touching private data
- [ ] Record-level ownership/tenant check (not just login)
- [ ] Same message for "not found" and "forbidden"
- [ ] No stack traces / Prisma errors reach the client
- [ ] `revalidatePath` after mutations that change rendered pages

## References

- Next.js Server Actions / Updating Data: https://nextjs.org/docs/app/getting-started/updating-data
- Prisma + Next.js: https://docs.prisma.io/docs/guides/v8/frameworks/nextjs

## Related notes

- [Next.js Server Actions explained: when to use them vs Route Handlers](/notes/nextjs-server-actions)
- [Next.js Server Actions + Prisma Transaction: atomic mutations](/notes/prisma-transaction-nextjs)
- [All Next.js notes](/notes/nextjs)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
