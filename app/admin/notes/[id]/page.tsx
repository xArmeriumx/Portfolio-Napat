import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NoteEditor from "@/components/admin/NoteEditor";
import { getAdminContent } from "@/content/admin-service";
import { prisma } from "@/server/db";
import { requireAdminPage } from "@/server/auth-guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Note", robots: { index: false, follow: false } };

export default async function AdminNotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const content = await getAdminContent(prisma, "NOTE", (await params).id).catch(() => null);
  if (!content) notFound();
  return <NoteEditor documentId={content.document.id} initialPayload={content.draft?.payload || content.published?.payload} draftRevisionId={content.draft?.revisionId || null} />;
}
