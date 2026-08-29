import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { adminSlugSchema, contentDraftSchemas, type NoteDraft, type ProfileDraft, type ProjectDraft } from "./input-schema";
import { isPortfolioStorageKey } from "@/server/storage";

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

async function attachMediaReferences(tx: any, revisionId: string, documentId: string, payload: Record<string, unknown>) {
  const media = Array.isArray(payload.media) ? payload.media : [];
  const requested = media
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: String(item.id || ""),
      order: Number(item.order || 0),
      storageKey: typeof item.storageKey === "string" ? item.storageKey : null,
      url: typeof item.url === "string" ? item.url : null,
    }))
    .filter((item) => item.id);
  if (!requested.length) return;

  const assets = await tx.mediaAsset.findMany({
    where: { id: { in: requested.map((item) => item.id) } },
    select: { id: true, storageKey: true, publicUrl: true },
  });
  const assetsById = new Map<string, { id: string; storageKey: string; publicUrl: string }>(
    assets.map((asset: { id: string; storageKey: string; publicUrl: string }) => [asset.id, asset]),
  );

  const managed = [];
  for (const item of requested) {
    const asset = assetsById.get(item.id);
    if (!asset) {
      if (item.storageKey) throw new ContentConflictError("Media reference is not available for this Project");
      continue;
    }
    if (!item.storageKey || asset.storageKey !== item.storageKey || asset.publicUrl !== item.url || !isPortfolioStorageKey(item.storageKey) || !item.storageKey.startsWith(`projects/${documentId}/`)) {
      throw new ContentConflictError("Media reference is outside this Project namespace");
    }
    managed.push(item);
  }
  if (!managed.length) return;

  const references = managed.map((item) => ({ revisionId, mediaId: item.id, displayOrder: item.order }));
  if (references.length) await tx.mediaReference.createMany({ data: references, skipDuplicates: true });
}

export async function getAdminContent(db: PrismaClient, contentType: CmsContentType, documentId: string) {
  const document = await db.contentDocument.findFirst({
    where: documentWhere(contentType, documentId),
    include: {
      draftRevision: true,
      publishedRevision: true,
      revisions: { orderBy: { revisionNumber: "desc" }, take: 20, include: { createdByUser: { select: { id: true, name: true, email: true } }, publishedByUser: { select: { id: true, name: true, email: true } } } },
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
      createdBy: revision.createdByUser?.email || revision.createdBy,
      publishedAt: revision.publishedAt?.toISOString() || null,
      publishedBy: revision.publishedByUser?.email || revision.publishedBy,
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
      data: {
        draftRevisionId: revision.id,
        ...(input.contentType === "PROFILE"
          ? {}
          : { displayOrder: Number(payload.order), featured: Boolean(payload.featured) }),
      },
    });
    if (input.contentType === "PROJECT") await attachMediaReferences(tx, revision.id, document.id, payload);
    await tx.auditEvent.create({
      data: { action: "DRAFT_SAVED", contentType: input.contentType, documentId: document.id, revisionId: revision.id, actorId: input.actorId },
    });
    return { revisionId: revision.id, revisionNumber: revision.revisionNumber, payload: revision.payload };
  });
}

export async function listAdminContent(db: PrismaClient, contentType: Exclude<CmsContentType, "PROFILE">) {
  const documents = await db.contentDocument.findMany({
    where: { contentType },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: { draftRevision: true, publishedRevision: true },
  });
  return documents.map((document) => ({
    id: document.id,
    slug: document.slug,
    status: document.status,
    displayOrder: document.displayOrder,
    featured: document.featured,
    draftRevisionId: document.draftRevisionId,
    publishedRevisionId: document.publishedRevisionId,
    updatedAt: document.updatedAt.toISOString(),
  }));
}

export async function createContentDraft(
  db: PrismaClient,
  input: { contentType: Exclude<CmsContentType, "PROFILE">; actorId: string; payload: unknown },
) {
  const payload = payloadFor(input.contentType, input.payload);
  if (input.contentType === "NOTE") {
    const slugResult = adminSlugSchema.safeParse(payload.slug);
    if (!slugResult.success) {
      const error = new Error("CONTENT_VALIDATION_ERROR");
      Object.assign(error, { details: slugResult.error.flatten().fieldErrors });
      throw error;
    }
  }
  const slug = String(payload.slug);
  return db.$transaction(async (tx) => {
    const conflict = await tx.contentDocument.findFirst({
      where: { contentType: input.contentType, slug },
      select: { id: true },
    });
    if (conflict) throw new ContentConflictError(`Slug "${slug}" is already in use`);
    const document = await tx.contentDocument.create({
      data: {
        id: randomUUID(),
        contentType: input.contentType,
        slug,
        displayOrder: Number(payload.order),
        featured: Boolean(payload.featured),
        status: "DRAFT",
      },
    });
    const revision = await tx.contentRevision.create({
      data: {
        documentId: document.id,
        revisionNumber: 1,
        status: "DRAFT",
        payload: payload as Prisma.InputJsonValue,
        createdBy: input.actorId,
      },
    });
    await tx.contentDocument.update({ where: { id: document.id }, data: { draftRevisionId: revision.id } });
    if (input.contentType === "PROJECT") await attachMediaReferences(tx, revision.id, document.id, payload);
    await tx.auditEvent.create({
      data: { action: "DRAFT_CREATED", contentType: input.contentType, documentId: document.id, revisionId: revision.id, actorId: input.actorId },
    });
    return { documentId: document.id, revisionId: revision.id, revisionNumber: revision.revisionNumber };
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

export async function restoreRevision(
  db: PrismaClient,
  input: { contentType: CmsContentType; documentId: string; revisionId: string; actorId: string },
) {
  return db.$transaction(async (tx) => {
    const document = await tx.contentDocument.findFirst({ where: documentWhere(input.contentType, input.documentId) });
    if (!document) throw new ContentNotFoundError("Content document not found");
    const source = await tx.contentRevision.findFirst({ where: { id: input.revisionId, documentId: document.id } });
    if (!source) throw new ContentNotFoundError("Revision not found");
    if (source.status === "DRAFT") throw new ContentConflictError("Choose a published or archived revision to restore");
    const payload = payloadFor(input.contentType, source.payload);
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
      data: {
        draftRevisionId: revision.id,
        ...(input.contentType === "PROFILE" ? {} : { displayOrder: Number(payload.order), featured: Boolean(payload.featured) }),
      },
    });
    if (input.contentType === "PROJECT") await attachMediaReferences(tx, revision.id, document.id, payload);
    await tx.auditEvent.create({
      data: { action: "REVISION_RESTORED", contentType: input.contentType, documentId: document.id, revisionId: revision.id, actorId: input.actorId, metadata: { sourceRevisionId: source.id } },
    });
    return { revisionId: revision.id, revisionNumber: revision.revisionNumber, payload: revision.payload, sourceRevisionId: source.id };
  });
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
        where: { contentType: input.contentType, slug: nextSlug, id: { not: document.id } },
        select: { id: true },
      });
      if (conflict) throw new ContentConflictError(`Slug "${nextSlug}" is already in use`);
    }

    const publishedAt = new Date();
    if (document.publishedRevisionId && document.publishedRevisionId !== revision.id) {
      await tx.contentRevision.update({
        where: { id: document.publishedRevisionId },
        data: { status: "ARCHIVED" },
      });
    }
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
    return { revisionId: revision.id, revisionNumber: revision.revisionNumber, publishedAt: publishedAt.toISOString(), slug: nextSlug, previousSlug: document.slug };
  });
}

export async function archiveContent(
  db: PrismaClient,
  input: { contentType: Exclude<CmsContentType, "PROFILE">; documentId: string; actorId: string },
) {
  return db.$transaction(async (tx) => {
    const document = await tx.contentDocument.findFirst({ where: documentWhere(input.contentType, input.documentId) });
    if (!document) throw new ContentNotFoundError("Content document not found");
    if (document.publishedRevisionId) {
      await tx.contentRevision.update({
        where: { id: document.publishedRevisionId },
        data: { status: "ARCHIVED" },
      });
    }
    await tx.contentDocument.update({ where: { id: document.id }, data: { status: "ARCHIVED", draftRevisionId: null } });
    await tx.auditEvent.create({ data: { action: "ARCHIVED", contentType: input.contentType, documentId: document.id, actorId: input.actorId } });
    return { documentId: document.id, slug: document.slug };
  });
}
