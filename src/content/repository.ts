import type { NoteContent, ProfileContent, ProjectContent } from "./schema";

export interface ContentRepository {
  getPublishedProfile(): Promise<ProfileContent>;
  listPublishedProjects(): Promise<ProjectContent[]>;
  getPublishedProjectBySlug(slug: string): Promise<ProjectContent | null>;
  listPublishedNotes(): Promise<NoteContent[]>;
  getPublishedNoteBySlug(slug: string): Promise<NoteContent | null>;
}

let repositoryPromise: Promise<ContentRepository> | undefined;

export function getContentRepository(): Promise<ContentRepository> {
  if (!repositoryPromise) {
    repositoryPromise = (async () => {
      const storage = process.env.CONTENT_STORAGE || "static";
      if (storage === "database") {
        const [{ DatabaseContentRepository }, { prisma }] = await Promise.all([
          import("./database-adapter"),
          import("@/server/db"),
        ]);
        return new DatabaseContentRepository(prisma);
      }
      if (storage === "static") {
        const { StaticContentRepository } = await import("./static-adapter");
        return new StaticContentRepository();
      }
      throw new Error(`Content storage adapter "${storage}" is not supported`);
    })();
  }

  return repositoryPromise;
}

export function resetContentRepositoryForTests() {
  repositoryPromise = undefined;
}
