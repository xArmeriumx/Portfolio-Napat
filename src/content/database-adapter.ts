import type { ContentRevision, PrismaClient } from "@prisma/client";
import { getNoteCatalogEntry } from "../data/note-catalog.js";
import { canonicalNoteSlug, legacyNoteSlug } from "../data/note-slugs.js";
import {
  noteContentSchema,
  profileContentSchema,
  projectContentSchema,
  type NoteContent,
  type ProfileContent,
  type ProjectContent,
} from "./schema";
import type { ContentRepository } from "./repository";

function normalizeNoteSlug(note: NoteContent): NoteContent {
  const slug = canonicalNoteSlug(note.slug);
  return slug === note.slug ? note : { ...note, slug };
}

function hydrateKnownSourceLocale(note: NoteContent): NoteContent {
  const catalog = getNoteCatalogEntry(canonicalNoteSlug(note.slug));
  if (!catalog?.sourceLocale) return note;

  const sourceLocale = catalog.sourceLocale as "en" | "th";
  const otherLocale = sourceLocale === "th" ? "en" : "th";
  const localizedBodies = {
    ...(note.bodyMarkdownByLocale || {}),
  };

  // The catalog defines the editorial source language for source-controlled
  // legacy notes. Production revisions may still contain an older mirrored
  // locale field, so always restore the real source body when it is missing.
  if (!localizedBodies[sourceLocale]?.trim()) {
    localizedBodies[sourceLocale] = note.bodyMarkdown;
  }

  // An old importer/editor revision may have copied the legacy body verbatim
  // into the opposite locale. Exact duplicate bodies are not translations and
  // must not create a false hreflang/indexable locale.
  if (
    localizedBodies[otherLocale]?.trim() &&
    localizedBodies[otherLocale]?.trim() === note.bodyMarkdown.trim()
  ) {
    delete localizedBodies[otherLocale];
  }

  return {
    ...note,
    bodyMarkdownByLocale: localizedBodies,
  };
}

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
  const note = noteContentSchema.parse({
    ...payloadRecord(document.publishedRevision),
    id: document.id,
    revision: publishedRevision(document.publishedRevision),
  });
  return hydrateKnownSourceLocale(note);
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
        where: {
          contentType,
          fromSlug: currentSlug,
          document: { status: "PUBLISHED", publishedRevisionId: { not: null } },
        },
        select: { toSlug: true },
      });

      if (redirect) {
        currentSlug = redirect.toSlug;
        continue;
      }

      const finalSlug = contentType === "NOTE" ? canonicalNoteSlug(currentSlug) : currentSlug;
      if (finalSlug === slug) return null;

      if (contentType === "NOTE") {
        // Legacy fixture-era slugs are storage aliases only. Public redirects
        // always point toward the canonical slug, never back toward storage.
        return (await this.getPublishedNoteBySlug(finalSlug)) ? finalSlug : null;
      }

      return finalSlug;
    }

    const finalSlug = contentType === "NOTE" ? canonicalNoteSlug(currentSlug) : currentSlug;
    return finalSlug === slug ? null : finalSlug;
  }

  async listPublishedNotes() {
    const documents = await this.db.contentDocument.findMany({
      where: { contentType: "NOTE", status: "PUBLISHED", publishedRevisionId: { not: null } },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      include: publishedRevisionInclude,
    });
    return documents.map((document) => normalizeNoteSlug(mapNote(document)));
  }

  async getPublishedNoteBySlug(slug: string) {
    const canonicalSlug = canonicalNoteSlug(slug);
    const legacySlug = legacyNoteSlug(canonicalSlug);

    let document = await this.db.contentDocument.findFirst({
      where: {
        contentType: "NOTE",
        slug: canonicalSlug,
        status: "PUBLISHED",
        publishedRevisionId: { not: null },
      },
      include: publishedRevisionInclude,
    });

    if (!document && legacySlug) {
      document = await this.db.contentDocument.findFirst({
        where: {
          contentType: "NOTE",
          slug: legacySlug,
          status: "PUBLISHED",
          publishedRevisionId: { not: null },
        },
        include: publishedRevisionInclude,
      });
    }

    if (!document) return null;

    const note = normalizeNoteSlug(mapNote(document));
    return note.slug === canonicalSlug ? note : { ...note, slug: canonicalSlug };
  }
}
