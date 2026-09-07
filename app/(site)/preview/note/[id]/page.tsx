import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Notes from "@/views/Notes.jsx";
import { noteDraftSchema } from "@/content/input-schema";
import { getPreviewRevision } from "@/content/admin-service";
import { getContentRepository } from "@/content/repository";
import { toPresentationNote } from "@/content/presentation";
import { assertPortfolioDatabaseTarget, prisma } from "@/server/db";
import { verifyPreviewToken } from "@/server/preview-token";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Private Note Preview", robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ token?: string }> };

export default async function NotePreviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token } = await searchParams;
  const claims = token ? verifyPreviewToken(token) : null;
  if (!claims || claims.contentType !== "NOTE" || claims.documentId !== id) notFound();

  const preview = await (async () => {
    try {
      assertPortfolioDatabaseTarget();
      const revision = await getPreviewRevision(prisma, claims);
      const payload = noteDraftSchema.parse(revision.payload);
      const repository = await getContentRepository();
      const rawNotes = await repository.listPublishedNotes();
      const note = toPresentationNote({
        id,
        revision: { revisionId: revision.revisionId, revisionNumber: revision.revisionNumber, status: "DRAFT", publishedAt: null },
        ...payload,
      });
      const notes = rawNotes.filter((item) => item.slug !== note.slug).map(toPresentationNote);
      notes.splice(Math.min(payload.order, notes.length), 0, note);
      return { revisionNumber: revision.revisionNumber, notes, slug: note.slug };
    } catch {
      return null;
    }
  })();
  if (!preview) notFound();

  return <><div className="fixed left-0 right-0 top-16 z-40 bg-amber-500 px-4 py-2 text-center text-xs font-bold text-amber-950">PRIVATE DRAFT PREVIEW · Revision {preview.revisionNumber} · ไม่แสดงต่อ Search Engine</div><Notes initialNotes={preview.notes} slug={preview.slug} /></>;
}
