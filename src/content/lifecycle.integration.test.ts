import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, it } from "vitest";
import { createContentDraft, saveDraft, getPreviewRevision, publishDraft, archiveContent, restoreRevision } from "./admin-service";
import { DatabaseContentRepository } from "./database-adapter";
import { toPresentationNote } from "./presentation";

it.skipIf(!process.env.SEO_TEST_DATABASE_URL)("round-trips localized drafts through real PostgreSQL and rolls back every test write", async () => {
  const url = new URL(process.env.SEO_TEST_DATABASE_URL!);
  if (url.searchParams.get("schema") !== "portfolio_cms_dev") throw new Error("Only the dedicated development schema is allowed");
  const db = new PrismaClient({ datasources: { db: { url: url.href } } });
  const runId = randomUUID();
  const actorId = `seo-test-${runId}`;
  const rollback = new Error("ROLLBACK_SEO_TEST");
  let completed = false;
  try {
    await db.$transaction(async tx => {
      await tx.user.create({ data: { id: actorId, email: `${runId}@example.invalid`, name: "SEO transaction test" } });
      // Service transactions share this outer transaction; nothing commits.
      const serviceDb = Object.assign(Object.create(tx), { $transaction: async (fn: (_tx: typeof tx) => Promise<unknown>) => fn(tx) }) as PrismaClient;
      const repository = new DatabaseContentRepository(tx as unknown as PrismaClient);
      const slug = `seo-test-${runId}`;
      const payload = { slug, title: { en: "Test", th: "ทดสอบ" }, bodyMarkdown: "# Legacy", bodyMarkdownByLocale: { en: "# English", th: "# ไทย" }, excerpt: { en: "Test", th: "ทดสอบ" }, order: 0, rawName: `${slug}.md`, seo: { title: null, description: null } };
      const draft = await createContentDraft(serviceDb, { contentType: "NOTE", actorId, payload });
      const input = { contentType: "NOTE" as const, documentId: draft.documentId, actorId, revisionId: draft.revisionId };
      expect(await repository.getPublishedNoteBySlug(slug)).toBeNull();
      const preview = await getPreviewRevision(serviceDb, input);
      expect(preview.payload).toMatchObject({ bodyMarkdownByLocale: payload.bodyMarkdownByLocale });
      await publishDraft(serviceDb, input);
      const first = await repository.getPublishedNoteBySlug(slug);
      expect(toPresentationNote(first, "th").content).toBe("# ไทย");
      const next = await saveDraft(serviceDb, { ...input, payload: { ...payload, slug: `${slug}-renamed`, bodyMarkdownByLocale: { en: "# Edited", th: "# แก้ไข" } } });
      expect((await repository.getPublishedNoteBySlug(slug)).revision.updatedAt).toBe(first.revision.updatedAt);
      expect(toPresentationNote(await repository.getPublishedNoteBySlug(slug), "en").content).toBe("# English");
      await publishDraft(serviceDb, { ...input, revisionId: next.revisionId });
      expect(await repository.getPublishedSlugRedirect("NOTE", slug)).toBe(`${slug}-renamed`);
      await archiveContent(serviceDb, input);
      expect(await repository.getPublishedNoteBySlug(`${slug}-renamed`)).toBeNull();
      const restored = await restoreRevision(serviceDb, input);
      expect(restored.payload).toMatchObject({ bodyMarkdownByLocale: payload.bodyMarkdownByLocale });
      expect(await repository.getPublishedNoteBySlug(slug)).toBeNull();
      await publishDraft(serviceDb, { ...input, revisionId: restored.revisionId });
      expect(toPresentationNote(await repository.getPublishedNoteBySlug(slug), "th").content).toBe("# ไทย");
      expect(await repository.getPublishedSlugRedirect("NOTE", `${slug}-renamed`)).toBe(slug);
      completed = true;
      throw rollback;
    }, { maxWait: 10000, timeout: 60000 });
  } catch (error) { if (error !== rollback) throw error; }
  finally {
    expect(await db.user.count({ where: { id: actorId } })).toBe(0);
    await db.$disconnect();
  }
  expect(completed).toBe(true);
}, 90000);
