import { describe, expect, it } from "vitest";
import { archiveContent, ContentConflictError, createContentDraft, getPreviewRevision, publishDraft, restoreRevision, saveDraft } from "./admin-service";
import { parseContentDraft } from "./input-schema";
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
    $transaction: async (callback: (_transaction: unknown) => unknown) => callback(db),
  };
  return { db, document, revisions };
}

function fakeProjectDatabase(mediaAssets: Array<{ id: string; storageKey: string; publicUrl?: string }>) {
  const document = {
    id: "project-1",
    contentType: "PROJECT",
    slug: "project-1",
    displayOrder: 0,
    featured: false,
    status: "PUBLISHED",
    publishedRevisionId: null,
    draftRevisionId: null,
  };
  const db = {
    contentDocument: {
      findFirst: async () => ({ ...document }),
      update: async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(document, data);
        return { ...document };
      },
    },
    contentRevision: {
      findFirst: async ({ orderBy }: { orderBy?: unknown }) => (orderBy ? null : null),
      create: async ({ data }: { data: Record<string, unknown> }) => ({
        id: "draft-project-1",
        ...data,
        createdAt: new Date(),
      }),
    },
    mediaAsset: {
      findMany: async () => mediaAssets.map((asset) => ({ ...asset, publicUrl: asset.publicUrl || `https://storage.example/${asset.storageKey}` })),
    },
    mediaReference: {
      createMany: async () => ({ count: mediaAssets.length }),
    },
    auditEvent: { create: async () => ({}) },
    $transaction: async (callback: (_transaction: unknown) => unknown) => callback(db),
  };
  return db;
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
    expect(revisions.get("published-1")?.status).toBe("ARCHIVED");
    expect((revisions.get(draft.revisionId)?.payload as typeof published).identity.name.en).toBe("Draft-only Name");

    const restored = await restoreRevision(db as never, { contentType: "PROFILE", documentId: "profile", revisionId: "published-1", actorId: "admin-1" });
    expect(document.draftRevisionId).toBe(restored.revisionId);
    expect(revisions.get("published-1")?.status).toBe("ARCHIVED");
    expect((restored.payload as typeof published).identity.name.en).toBe("Napat Pamornsut");
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
      $transaction: async (callback: (_transaction: unknown) => unknown) => callback(db),
    };
    const draftPayload = structuredClone(published);
    draftPayload.title.en = "Draft note title";

    const draft = await saveDraft(db as never, { contentType: "NOTE", documentId: document.id, actorId: "admin-1", payload: draftPayload });
    expect((revisions.get("published-note-1")?.payload as typeof published).title.en).toBe(published.title.en);
    expect((await getPreviewRevision(db as never, { contentType: "NOTE", documentId: document.id, revisionId: draft.revisionId })).payload).toMatchObject({ title: { en: "Draft note title" } });

    await publishDraft(db as never, { contentType: "NOTE", documentId: document.id, actorId: "admin-1", revisionId: draft.revisionId });
    expect(document.publishedRevisionId).toBe(draft.revisionId);
    expect(document.draftRevisionId).toBeNull();

    await archiveContent(db as never, { contentType: "NOTE", documentId: document.id, actorId: "admin-1" });
    expect(document.status).toBe("ARCHIVED");
    expect(document.publishedRevisionId).toBe(draft.revisionId);
    expect(document.draftRevisionId).toBeNull();
    expect(revisions.get(draft.revisionId)?.status).toBe("ARCHIVED");
  });
});

describe("content conflict handling", () => {
  it("archives a pending draft as recoverable history", async () => {
    const document = {
      id: "note-archive-1",
      contentType: "NOTE",
      slug: "archive-note",
      status: "PUBLISHED",
      publishedRevisionId: "published-1",
      draftRevisionId: "draft-2",
    };
    const revisions = new Map([
      ["published-1", { status: "PUBLISHED" }],
      ["draft-2", { status: "DRAFT" }],
    ]);
    const db = {
      contentDocument: {
        findFirst: async () => document,
        update: async ({ data }: { data: Record<string, unknown> }) => Object.assign(document, data),
      },
      contentRevision: {
        update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          const revision = revisions.get(where.id);
          if (!revision) throw new Error("revision missing");
          Object.assign(revision, data);
          return revision;
        },
      },
      auditEvent: { create: async () => ({}) },
      $transaction: async (callback: (_transaction: unknown) => unknown) => callback(db),
    };

    await archiveContent(db as never, { contentType: "NOTE", documentId: document.id, actorId: "admin-1" });

    expect(document.status).toBe("ARCHIVED");
    expect(document.draftRevisionId).toBeNull();
    expect(revisions.get("published-1")?.status).toBe("ARCHIVED");
    expect(revisions.get("draft-2")?.status).toBe("ARCHIVED");
  });

  it("rejects a new document when its slug is already in use", async () => {
    const source = new StaticContentRepository();
    const project = await source.listPublishedProjects();
    const db = {
      contentDocument: {
        findFirst: async () => ({ id: "existing-project" }),
      },
      $transaction: async (callback: (_transaction: unknown) => unknown) => callback(db),
    };

    await expect(createContentDraft(db as never, {
      contentType: "PROJECT",
      actorId: "admin-1",
      payload: project[0],
    })).rejects.toBeInstanceOf(ContentConflictError);
  });

  it("rejects a managed media reference outside the current Project namespace", async () => {
    const source = new StaticContentRepository();
    const project = structuredClone((await source.listPublishedProjects())[0]);
    project.media = [{
      ...project.media[0],
      id: "asset-1",
      storageKey: "projects/other-project/123e4567-e89b-12d3-a456-426614174000.png",
    }];
    const db = fakeProjectDatabase([{ id: "asset-1", storageKey: "projects/other-project/123e4567-e89b-12d3-a456-426614174000.png" }]);

    await expect(saveDraft(db as never, {
      contentType: "PROJECT",
      documentId: "project-1",
      actorId: "admin-1",
      payload: project,
    })).rejects.toBeInstanceOf(ContentConflictError);
  });

  it("rejects a managed media reference whose asset is missing", async () => {
    const source = new StaticContentRepository();
    const project = structuredClone((await source.listPublishedProjects())[0]);
    project.media = [{
      ...project.media[0],
      id: "missing-asset",
      storageKey: "projects/project-1/123e4567-e89b-12d3-a456-426614174000.png",
    }];
    const db = fakeProjectDatabase([]);

    await expect(saveDraft(db as never, {
      contentType: "PROJECT",
      documentId: "project-1",
      actorId: "admin-1",
      payload: project,
    })).rejects.toBeInstanceOf(ContentConflictError);
  });

  it("rejects a managed media reference when its storage key is omitted", async () => {
    const source = new StaticContentRepository();
    const project = structuredClone((await source.listPublishedProjects())[0]);
    project.media = [{
      ...project.media[0],
      id: "asset-1",
      storageKey: null,
    }];
    const db = fakeProjectDatabase([{ id: "asset-1", storageKey: "projects/project-1/123e4567-e89b-12d3-a456-426614174000.png" }]);

    await expect(saveDraft(db as never, {
      contentType: "PROJECT",
      documentId: "project-1",
      actorId: "admin-1",
      payload: project,
    })).rejects.toBeInstanceOf(ContentConflictError);
  });

  it("rejects a managed media reference when its URL does not match the asset", async () => {
    const source = new StaticContentRepository();
    const project = structuredClone((await source.listPublishedProjects())[0]);
    const storageKey = "projects/project-1/123e4567-e89b-12d3-a456-426614174000.png";
    project.media = [{
      ...project.media[0],
      id: "asset-1",
      storageKey,
      url: "https://attacker.example/replacement.png",
    }];
    const db = fakeProjectDatabase([{ id: "asset-1", storageKey, publicUrl: `https://storage.example/${storageKey}` }]);

    await expect(saveDraft(db as never, {
      contentType: "PROJECT",
      documentId: "project-1",
      actorId: "admin-1",
      payload: project,
    })).rejects.toBeInstanceOf(ContentConflictError);
  });

  it("requires normalized slugs when creating a new Note", async () => {
    const source = new StaticContentRepository();
    const note = structuredClone((await source.listPublishedNotes())[0]);
    note.slug = "Unsafe_Note";

    await expect(createContentDraft({} as never, {
      contentType: "NOTE",
      actorId: "admin-1",
      payload: note,
    })).rejects.toMatchObject({ message: "CONTENT_VALIDATION_ERROR" });
  });

  it("rejects protocol-relative URLs in admin content", async () => {
    const source = new StaticContentRepository();
    const profile = structuredClone(await source.getPublishedProfile());
    profile.contact.links.github = "//attacker.example/profile";

    expect(parseContentDraft("PROFILE", profile).success).toBe(false);
  });
});
