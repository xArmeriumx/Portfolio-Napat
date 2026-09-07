import type { NoteContent, ProfileContent, ProjectContent } from "./schema";

export interface ContentRepository {
  getPublishedProfile(): Promise<ProfileContent>;
  listPublishedProjects(): Promise<ProjectContent[]>;
  getPublishedProjectBySlug(_slug: string): Promise<ProjectContent | null>;
  getPublishedSlugRedirect(_contentType: "PROJECT" | "NOTE", _slug: string): Promise<string | null>;
  listPublishedNotes(): Promise<NoteContent[]>;
  getPublishedNoteBySlug(_slug: string): Promise<NoteContent | null>;
}

let repositoryPromise: Promise<ContentRepository> | undefined;

export function getContentRepository(): Promise<ContentRepository> {
  if (!repositoryPromise) {
    repositoryPromise = (async () => {
      const isNextBuild = process.env.NEXT_PHASE === "phase-production-build";
      if (isNextBuild) {
        // Build-time prerender (SSG/ISR) must never hit the database:
        // production env sets CONTENT_STORAGE=database and concurrent
        // prerender queries exhaust the small pooled connection limit
        // (Prisma P2024). Runtime ISR revalidation still reads the database.
        const { StaticContentRepository } = await import("./static-adapter");
        return new StaticContentRepository();
      }
      const isProductionRuntime = process.env.NODE_ENV === "production";
      const storage = process.env.CONTENT_STORAGE || (isProductionRuntime ? "database" : "static");
      if (isProductionRuntime && storage !== "database") {
        throw new Error("Production runtime must use database content storage");
      }
      if (storage === "database") {
        const [{ DatabaseContentRepository }, { prisma, assertPortfolioDatabaseTarget }] = await Promise.all([
          import("./database-adapter"),
          import("@/server/db"),
        ]);
        assertPortfolioDatabaseTarget();
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
