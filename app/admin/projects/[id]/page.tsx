import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectEditor from "@/components/admin/ProjectEditor";
import { getAdminContent } from "@/content/admin-service";
import { prisma } from "@/server/db";
import { requireAdminPage } from "@/server/auth-guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Project", robots: { index: false, follow: false } };

export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const content = await getAdminContent(prisma, "PROJECT", (await params).id).catch(() => null);
  if (!content) notFound();
  return <ProjectEditor documentId={content.document.id} initialPayload={content.draft?.payload || content.published?.payload} draftRevisionId={content.draft?.revisionId || null} />;
}
