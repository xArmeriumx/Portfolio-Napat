import type { Metadata } from "next";
import NoteEditor from "@/components/admin/NoteEditor";
import { requireAdminPage } from "@/server/auth-guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New Note", robots: { index: false, follow: false } };

export default async function NewNotePage() {
  await requireAdminPage();
  return <NoteEditor initialPayload={{ slug: "new-note", title: { en: "", th: "" }, bodyMarkdown: "# New note\n\n", excerpt: { en: "", th: "" }, order: 0, rawName: "new-note.md", seo: { title: null, description: null } }} />;
}
