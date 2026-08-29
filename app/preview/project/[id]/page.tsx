import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/views/ProjectDetail.jsx";
import { projectDraftSchema } from "@/content/input-schema";
import { getPreviewRevision } from "@/content/admin-service";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile, toPresentationProject } from "@/content/presentation";
import { prisma } from "@/server/db";
import { verifyPreviewToken } from "@/server/preview-token";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Private Project Preview", robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string }> };

export default async function ProjectPreviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token } = await searchParams;
  const claims = token ? verifyPreviewToken(token) : null;
  if (!claims || claims.contentType !== "PROJECT" || claims.documentId !== id) notFound();

  const preview = await (async () => {
    try {
      const revision = await getPreviewRevision(prisma, claims);
      const payload = projectDraftSchema.parse(revision.payload);
      const repository = await getContentRepository();
      const profile = toPresentationProfile(await repository.getPublishedProfile());
      return { revisionNumber: revision.revisionNumber, profile, project: toPresentationProject({ id, revision: { revisionId: revision.revisionId, revisionNumber: revision.revisionNumber, status: "DRAFT", publishedAt: null }, ...payload }) };
    } catch { return null; }
  })();
  if (!preview) notFound();

  return <><div className="fixed left-0 right-0 top-16 z-40 bg-amber-500 px-4 py-2 text-center text-xs font-bold text-amber-950">PRIVATE DRAFT PREVIEW · Revision {preview.revisionNumber} · ไม่แสดงต่อ Search Engine</div><ProjectDetail slug={preview.project.slug} project={preview.project} /></>;
}
