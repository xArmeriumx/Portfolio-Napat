import { describe, expect, it } from "vitest";
import { DatabaseContentRepository } from "./database-adapter";
import { StaticContentRepository } from "./static-adapter";

function revision(payload: unknown, id: string) {
  return {
    id,
    documentId: "document",
    revisionNumber: 1,
    status: "PUBLISHED" as const,
    payload,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    createdBy: null,
    publishedAt: new Date("2026-01-01T00:00:00.000Z"),
    publishedBy: null,
  } as never;
}

describe("DatabaseContentRepository contract", () => {
  it("maps the selected published revision through the same typed contract", async () => {
    const source = new StaticContentRepository();
    const profile = await source.getPublishedProfile();
    const project = (await source.listPublishedProjects())[0];
    const note = (await source.listPublishedNotes())[0];
    const db = {
      contentDocument: {
        findFirst: async ({ where }: { where: { contentType: string } }) => {
          if (where.contentType === "PROFILE") return { id: profile.id, displayOrder: 0, publishedRevision: revision(profile, "profile-revision") };
          if (where.contentType === "PROJECT") return { id: project.id, displayOrder: 0, publishedRevision: revision(project, "project-revision") };
          return { id: note.id, displayOrder: 0, publishedRevision: revision(note, "note-revision") };
        },
        findMany: async ({ where }: { where: { contentType: string } }) => {
          if (where.contentType === "PROJECT") return [{ id: project.id, displayOrder: 0, publishedRevision: revision(project, "project-revision") }];
          return [{ id: note.id, displayOrder: 0, publishedRevision: revision(note, "note-revision") }];
        },
      },
    };
    const repository = new DatabaseContentRepository(db as never);

    expect((await repository.getPublishedProfile()).identity.name.en).toBe(profile.identity.name.en);
    expect((await repository.listPublishedProjects())[0].slug).toBe(project.slug);
    expect((await repository.listPublishedNotes())[0].bodyMarkdown).toBe(note.bodyMarkdown);
  });

  it("derives the public identity from the document when admin payload omits internal ids", async () => {
    const source = new StaticContentRepository();
    const project = (await source.listPublishedProjects())[0];
    const { id: _id, revision: _revision, ...draftPayload } = project;
    const db = {
      contentDocument: {
        findFirst: async () => ({ id: "database-project-id", displayOrder: 0, publishedRevision: revision(draftPayload, "project-revision") }),
      },
    };
    const repository = new DatabaseContentRepository(db as never);
    expect((await repository.getPublishedProjectBySlug(project.slug)).id).toBe("database-project-id");
  });

  it("resolves only redirects whose document is still published", async () => {
    const db = {
      slugRedirect: {
        findFirst: async ({ where }: { where: { fromSlug: string; document?: { status: string; publishedRevisionId: { not: null } } } }) => {
          if (!where.document || where.document.status !== "PUBLISHED" || where.document.publishedRevisionId.not !== null) return null;
          if (where.fromSlug === "old") return { toSlug: "current" };
          if (where.fromSlug === "current") return { toSlug: "latest" };
          return null;
        },
      },
    };
    const repository = new DatabaseContentRepository(db as never);

    expect(await repository.getPublishedSlugRedirect("PROJECT", "old")).toBe("latest");
    expect(await repository.getPublishedSlugRedirect("PROJECT", "missing")).toBeNull();
  });
});
