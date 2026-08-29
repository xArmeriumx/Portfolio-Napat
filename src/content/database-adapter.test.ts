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
          if (where.contentType === "PROFILE") return { displayOrder: 0, publishedRevision: revision(profile, "profile-revision") };
          if (where.contentType === "PROJECT") return { displayOrder: 0, publishedRevision: revision(project, "project-revision") };
          return { displayOrder: 0, publishedRevision: revision(note, "note-revision") };
        },
        findMany: async ({ where }: { where: { contentType: string } }) => {
          if (where.contentType === "PROJECT") return [{ displayOrder: 0, publishedRevision: revision(project, "project-revision") }];
          return [{ displayOrder: 0, publishedRevision: revision(note, "note-revision") }];
        },
      },
    };
    const repository = new DatabaseContentRepository(db as never);

    expect((await repository.getPublishedProfile()).identity.name.en).toBe(profile.identity.name.en);
    expect((await repository.listPublishedProjects())[0].slug).toBe(project.slug);
    expect((await repository.listPublishedNotes())[0].bodyMarkdown).toBe(note.bodyMarkdown);
  });
});
