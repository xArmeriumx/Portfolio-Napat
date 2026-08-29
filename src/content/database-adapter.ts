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

type PublishedDocument = {
  id: string;
  publishedRevision: ContentRevision | null;
  displayOrder: number;
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
      if (!redirect) return currentSlug === slug ? null : currentSlug;
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
