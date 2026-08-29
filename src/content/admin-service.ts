import type { Prisma, PrismaClient } from "@prisma/client";
import { contentDraftSchemas, type NoteDraft, type ProfileDraft, type ProjectDraft } from "./input-schema";

export type CmsContentType = "PROFILE" | "PROJECT" | "NOTE";
export type DraftPayload = ProfileDraft | ProjectDraft | NoteDraft;

export class ContentNotFoundError extends Error {}
export class ContentConflictError extends Error {}

function documentWhere(contentType: CmsContentType, documentId: string) {
  return { id: documentId, contentType } as const;
}

function jsonObject(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

function payloadFor(contentType: CmsContentType, value: unknown) {
  const result = contentDraftSchemas[contentType].safeParse(value);
  if (!result.success) {
    const error = new Error("CONTENT_VALIDATION_ERROR");
    Object.assign(error, { details: result.error.flatten().fieldErrors });
    throw error;
  }
  return jsonObject(result.data);
}

export async function getAdminContent(db: PrismaClient, contentType: CmsContentType, documentId: string) {
  const document = await db.contentDocument.findFirst({
    where: documentWhere(contentType, documentId),
    include: {
      draftRevision: true,
      publishedRevision: true,
      revisions: { orderBy: { revisionNumber: "desc" }, take: 20 },
    },
  });
  if (!document) throw new ContentNotFoundError("Content document not found");
  return {
    document: {
      id: document.id,
      contentType: document.contentType,
      slug: document.slug,
      status: document.status,
      displayOrder: document.displayOrder,
      featured: document.featured,
    },
    draft: document.draftRevision ? { revisionId: document.draftRevision.id, revisionNumber: document.draftRevision.revisionNumber, payload: document.draftRevision.payload } : null,
    published: document.publishedRevision ? { revisionId: document.publishedRevision.id, revisionNumber: document.publishedRevision.revisionNumber, payload: document.publishedRevision.payload } : null,
    revisions: document.revisions.map((revision) => ({
      revisionId: revision.id,
      revisionNumber: revision.revisionNumber,
      status: revision.status,
      createdAt: revision.createdAt.toISOString(),
      createdBy: revision.createdBy,
      publishedAt: revision.publishedAt?.toISOString() || null,
      publishedBy: revision.publishedBy,
    })),
  };
}

export async function saveDraft(
  db: PrismaClient,
  input: { contentType: CmsContentType; documentId: string; actorId: string; payload: unknown },
) {
  const payload = payloadFor(input.contentType, input.payload);
  return db.$transaction(async (tx) => {
    const document = await tx.contentDocument.findFirst({ where: documentWhere(input.contentType, input.documentId) });
    if (!document) throw new ContentNotFoundError("Content document not found");
    const latest = await tx.contentRevision.findFirst({ where: { documentId: document.id }, orderBy: { revisionNumber: "desc" }, select: { revisionNumber: true } });
    const revision = await tx.contentRevision.create({
      data: {
        documentId: document.id,
        revisionNumber: (latest?.revisionNumber || 0) + 1,
        status: "DRAFT",
        payload: payload as Prisma.InputJsonValue,
        createdBy: input.actorId,
      },
    });
    await tx.contentDocument.update({
      where: { id: document.id },
      data: { draftRevisionId: revision.id },
    });
    await tx.auditEvent.create({
      data: { action: "DRAFT_SAVED", contentType: input.contentType, documentId: document.id, revisionId: revision.id, actorId: input.actorId },
    });
    return { revisionId: revision.id, revisionNumber: revision.revisionNumber, payload: revision.payload };
  });
}

export async function getPreviewRevision(
  db: PrismaClient,
  input: { contentType: CmsContentType; documentId: string; revisionId: string },
) {
  const revision = await db.contentRevision.findFirst({
    where: { id: input.revisionId, documentId: input.documentId, status: "DRAFT", document: { contentType: input.contentType } },
  });
  if (!revision) throw new ContentNotFoundError("Preview revision not found");
  return { revisionId: revision.id, revisionNumber: revision.revisionNumber, payload: revision.payload };
}

export async function publishDraft(
  db: PrismaClient,
  input: { contentType: CmsContentType; documentId: string; actorId: string; revisionId?: string },
) {
  return db.$transaction(async (tx) => {
    const document = await tx.contentDocument.findFirst({
      where: documentWhere(input.contentType, input.documentId),
      include: { draftRevision: true },
    });
    if (!document) throw new ContentNotFoundError("Content document not found");
    const revisionId = input.revisionId || document.draftRevisionId;
    if (!revisionId) throw new ContentConflictError("No draft revision is available to publish");
    const revision = await tx.contentRevision.findFirst({ where: { id: revisionId, documentId: document.id, status: "DRAFT" } });
    if (!revision) throw new ContentConflictError("The selected revision is not a draft for this document");
    const payload = payloadFor(input.contentType, revision.payload);
    const nextSlug = input.contentType === "PROFILE" ? null : String(payload.slug);

    if (nextSlug && nextSlug !== document.slug) {
      const conflict = await tx.contentDocument.findFirst({
        where: { contentType: input.contentType, slug: nextSlug, id: { not: document.id }, status: { not: "ARCHIVED" } },
        select: { id: true },
      });
      if (conflict) throw new ContentConflictError(`Slug "${nextSlug}" is already in use`);
    }

    const publishedAt = new Date();
    await tx.contentRevision.update({
      where: { id: revision.id },
      data: { status: "PUBLISHED", publishedAt, publishedBy: input.actorId },
    });
    await tx.contentDocument.update({
      where: { id: document.id },
      data: { publishedRevisionId: revision.id, draftRevisionId: null, status: "PUBLISHED", slug: nextSlug },
    });
    if (document.slug && nextSlug && document.slug !== nextSlug) {
      await tx.slugRedirect.upsert({
        where: { contentType_fromSlug: { contentType: input.contentType, fromSlug: document.slug } },
        create: { contentType: input.contentType, fromSlug: document.slug, toSlug: nextSlug, documentId: document.id },
        update: { toSlug: nextSlug },
      });
    }
    await tx.auditEvent.create({
      data: { action: "PUBLISHED", contentType: input.contentType, documentId: document.id, revisionId: revision.id, actorId: input.actorId },
    });
    return { revisionId: revision.id, revisionNumber: revision.revisionNumber, publishedAt: publishedAt.toISOString(), slug: nextSlug };
  });
}
