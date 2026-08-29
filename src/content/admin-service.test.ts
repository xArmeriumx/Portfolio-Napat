import { describe, expect, it } from "vitest";
import { getPreviewRevision, publishDraft, saveDraft } from "./admin-service";
import { StaticContentRepository } from "./static-adapter";

function fakeDatabase(initialPayload: unknown) {
  const document = {
    id: "profile",
    contentType: "PROFILE",
    slug: null,
    displayOrder: 0,
    featured: false,
    status: "PUBLISHED",
    publishedRevisionId: "published-1",
    draftRevisionId: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const revisions = new Map([
    ["published-1", {
      id: "published-1",
      documentId: "profile",
      revisionNumber: 1,
      status: "PUBLISHED",
      payload: initialPayload,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      createdBy: null,
      publishedAt: new Date("2026-01-01T00:00:00.000Z"),
      publishedBy: null,
    }],
  ]);
  let nextRevision = 2;

  const snapshotDocument = () => ({
    ...document,
    draftRevision: document.draftRevisionId ? revisions.get(document.draftRevisionId) || null : null,
    publishedRevision: document.publishedRevisionId ? revisions.get(document.publishedRevisionId) || null : null,
    revisions: [...revisions.values()].sort((a, b) => b.revisionNumber - a.revisionNumber).slice(0, 20),
  });
  const db = {
    contentDocument: {
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        if (where.id !== document.id || where.contentType !== document.contentType) return null;
        return snapshotDocument();
      },
      update: async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(document, data);
        return snapshotDocument();
      },
    },
    contentRevision: {
      findFirst: async ({ where, orderBy }: { where: Record<string, unknown>; orderBy?: unknown }) => {
        if (orderBy) {
          const latest = [...revisions.values()].sort((a, b) => b.revisionNumber - a.revisionNumber)[0];
          return latest ? { revisionNumber: latest.revisionNumber } : null;
        }
        const id = String(where.id || "");
        const revision = revisions.get(id);
        if (!revision || revision.documentId !== where.documentId || (where.status && revision.status !== where.status)) return null;
        return revision;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const revision = {
          id: `draft-${nextRevision}`,
          documentId: String(data.documentId),
          revisionNumber: Number(data.revisionNumber),
          status: String(data.status),
          payload: data.payload,
          createdAt: new Date(),
          createdBy: data.createdBy,
          publishedAt: null,
          publishedBy: null,
        };
        nextRevision += 1;
        revisions.set(revision.id, revision);
        return revision;
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const revision = revisions.get(where.id);
        if (!revision) throw new Error("revision missing");
        Object.assign(revision, data);
        return revision;
      },
    },
    auditEvent: { create: async () => ({}) },
    $transaction: async (callback: (transaction: unknown) => unknown) => callback(db),
  };
  return { db, document, revisions };
}

describe("profile draft lifecycle", () => {
  it("keeps public content isolated until the exact draft revision is published", async () => {
    const source = new StaticContentRepository();
    const published = await source.getPublishedProfile();
    const draftPayload = structuredClone(published);
    draftPayload.identity.name.en = "Draft-only Name";
    const { db, document, revisions } = fakeDatabase(published);

    const draft = await saveDraft(db as never, {
      contentType: "PROFILE",
      documentId: "profile",
      actorId: "admin-1",
      payload: draftPayload,
    });

    expect(document.publishedRevisionId).toBe("published-1");
    expect(document.draftRevisionId).toBe(draft.revisionId);
    expect((revisions.get("published-1")?.payload as typeof published).identity.name.en).toBe("Napat Pamornsut");

    const preview = await getPreviewRevision(db as never, { contentType: "PROFILE", documentId: "profile", revisionId: draft.revisionId });
    expect((preview.payload as typeof published).identity.name.en).toBe("Draft-only Name");

    await publishDraft(db as never, { contentType: "PROFILE", documentId: "profile", actorId: "admin-1", revisionId: draft.revisionId });
    expect(document.publishedRevisionId).toBe(draft.revisionId);
    expect(document.draftRevisionId).toBeNull();
    expect((revisions.get(draft.revisionId)?.payload as typeof published).identity.name.en).toBe("Draft-only Name");
  });
});

describe("note draft lifecycle", () => {
  it("publishes the exact note draft without mutating the previous payload first", async () => {
    const source = new StaticContentRepository();
    const published = (await source.listPublishedNotes())[0];
    const document = {
      id: "note-1",
      contentType: "NOTE",
      slug: published.slug,
      displayOrder: published.order,
      featured: false,
      status: "PUBLISHED",
      publishedRevisionId: "published-note-1",
      draftRevisionId: null as string | null,
    };
    const revisions = new Map<string, Record<string, unknown>>([
      ["published-note-1", { id: "published-note-1", documentId: document.id, revisionNumber: 1, status: "PUBLISHED", payload: published, createdAt: new Date(), createdBy: null, publishedAt: new Date(), publishedBy: null }],
    ]);
    const snapshot = () => ({
      ...document,
      draftRevision: document.draftRevisionId ? revisions.get(document.draftRevisionId) || null : null,
      publishedRevision: document.publishedRevisionId ? revisions.get(document.publishedRevisionId) || null : null,
      revisions: [...revisions.values()],
    });
    const db = {
      contentDocument: {
        findFirst: async () => snapshot(),
        update: async ({ data }: { data: Record<string, unknown> }) => { Object.assign(document, data); return snapshot(); },
      },
      contentRevision: {
        findFirst: async ({ where, orderBy }: { where: Record<string, unknown>; orderBy?: unknown }) => {
          if (orderBy) return { revisionNumber: 1 };
          const revision = revisions.get(String(where.id));
          return revision && revision.documentId === where.documentId && revision.status === where.status ? revision : null;
        },
        create: async ({ data }: { data: Record<string, unknown> }) => {
          const revision = { id: "draft-note-2", ...data, createdAt: new Date(), publishedAt: null, publishedBy: null };
          revisions.set(revision.id, revision);
          return revision;
        },
        update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          const revision = revisions.get(where.id);
          if (!revision) throw new Error("revision missing");
          Object.assign(revision, data);
          return revision;
        },
      },
      auditEvent: { create: async () => ({}) },
      $transaction: async (callback: (transaction: unknown) => unknown) => callback(db),
    };
    const draftPayload = structuredClone(published);
    draftPayload.title.en = "Draft note title";

    const draft = await saveDraft(db as never, { contentType: "NOTE", documentId: document.id, actorId: "admin-1", payload: draftPayload });
    expect((revisions.get("published-note-1")?.payload as typeof published).title.en).toBe(published.title.en);
    expect((await getPreviewRevision(db as never, { contentType: "NOTE", documentId: document.id, revisionId: draft.revisionId })).payload).toMatchObject({ title: { en: "Draft note title" } });

    await publishDraft(db as never, { contentType: "NOTE", documentId: document.id, actorId: "admin-1", revisionId: draft.revisionId });
    expect(document.publishedRevisionId).toBe(draft.revisionId);
    expect(document.draftRevisionId).toBeNull();
  });
});
