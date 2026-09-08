import type { ContentRevision, PrismaClient } from "@prisma/client";
import {
  noteContentSchema,
  profileContentSchema,
  projectContentSchema,
  type NoteContent,
  type ProfileContent,
  type ProjectContent,
} from "./schema";
import type { ContentRepository } from "./repository";

// URLs already exposed by older fixture-based builds. Resolve only when the
// counterpart actually exists in the published database; never redirect to 404.
const noteSlugPairs: Record<string, string> = {
  "nextjs-app-router-guide": "NEXTJS_ARCHITECTURE",
  "typescript-reference-guide": "TYPESCRIPT_REFERENCE",
  "sql-basics": "sql_basics_with_examples_easy",
  "sql-query-examples": "sql_code_and_response_tables",
};

type PublishedDocument = {
  id: string;
  publishedRevision: ContentRevision | null;
  displayOrder: number;
  updatedAt: Date;
};

function payloadRecord(revision: ContentRevision) {
  if (!revision.payload || typeof revision.payload !== "object" || Array.isArray(revision.payload)) {
    throw new Error(`Published revision ${revision.id} has an invalid payload`);
  }
  return revision.payload as Record<string, unknown>;
}

function publishedRevision(revision: ContentRevision) {
  if (revision.status !== "PUBLISHED") throw new Error("Selected revision is not published");
  return {
    revisionId: revision.id,
    revisionNumber: revision.revisionNumber,
    status: "PUBLISHED" as const,
    publishedAt: revision.publishedAt?.toISOString() || null,
    updatedAt: revision.publishedAt?.toISOString() ?? null,
  };
}

function mapProfile(document: PublishedDocument): ProfileContent {
  if (!document.publishedRevision) throw new Error("Published Profile has no selected revision");
  return profileContentSchema.parse({
    ...payloadRecord(document.publishedRevision),
    id: document.id,
    revision: publishedRevision(document.publishedRevision),
  });
}

function mapProject(document: PublishedDocument): ProjectContent {
  if (!document.publishedRevision) throw new Error("Published Project has no selected revision");
  return projectContentSchema.parse({
    ...payloadRecord(document.publishedRevision),
    id: document.id,
    revision: publishedRevision(document.publishedRevision),
  });
}

function mapNote(document: PublishedDocument): NoteContent {
  if (!document.publishedRevision) throw new Error("Published Note has no selected revision");
  return noteContentSchema.parse({
    ...payloadRecord(document.publishedRevision),
    id: document.id,
    revision: publishedRevision(document.publishedRevision),
  });
}

const publishedRevisionInclude = { publishedRevision: true } as const;

export class DatabaseContentRepository implements ContentRepository {
  constructor(private readonly db: PrismaClient) {}

  async getPublishedProfile() {
    const document = await this.db.contentDocument.findFirst({
      where: { contentType: "PROFILE", status: "PUBLISHED", publishedRevisionId: { not: null } },
      include: publishedRevisionInclude,
    });
    if (!document) throw new Error("Published Profile is unavailable");
    return mapProfile(document);
  }

  async listPublishedProjects() {
    const documents = await this.db.contentDocument.findMany({
      where: { contentType: "PROJECT", status: "PUBLISHED", publishedRevisionId: { not: null } },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      include: publishedRevisionInclude,
    });
    return documents.map(mapProject);
  }

  async getPublishedProjectBySlug(slug: string) {
    const document = await this.db.contentDocument.findFirst({
      where: { contentType: "PROJECT", slug, status: "PUBLISHED", publishedRevisionId: { not: null } },
      include: publishedRevisionInclude,
    });
    return document ? mapProject(document) : null;
  }

  async getPublishedSlugRedirect(contentType: "PROJECT" | "NOTE", slug: string) {
    let currentSlug = slug;
    const visited = new Set<string>();
    for (let step = 0; step < 10; step += 1) {
      if (visited.has(currentSlug)) return null;
      visited.add(currentSlug);
      const redirect = await this.db.slugRedirect.findFirst({
        where: { contentType, fromSlug: currentSlug, document: { status: "PUBLISHED", publishedRevisionId: { not: null } } },
        select: { toSlug: true },
      });
      if (!redirect) {
        if (currentSlug !== slug) return currentSlug;
        if (contentType === "NOTE") {
          const counterpart = noteSlugPairs[slug] || Object.entries(noteSlugPairs).find(([, legacy]) => legacy === slug)?.[0];
          if (counterpart) {
            const published = await this.db.contentDocument.findFirst({
              where: { contentType, slug: counterpart, status: "PUBLISHED", publishedRevisionId: { not: null } },
              select: { slug: true },
            });
            if (published) return counterpart;
          }
        }
        return null;
      }
      currentSlug = redirect.toSlug;
    }
    return currentSlug === slug ? null : currentSlug;
  }

  async listPublishedNotes() {
    const documents = await this.db.contentDocument.findMany({
      where: { contentType: "NOTE", status: "PUBLISHED", publishedRevisionId: { not: null } },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      include: publishedRevisionInclude,
    });
    return documents.map(mapNote);
  }

  async getPublishedNoteBySlug(slug: string) {
    const document = await this.db.contentDocument.findFirst({
      where: { contentType: "NOTE", slug, status: "PUBLISHED", publishedRevisionId: { not: null } },
      include: publishedRevisionInclude,
    });
    return document ? mapNote(document) : null;
  }
}
