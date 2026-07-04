import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getFirstNoteSlug } from "@/lib/notes";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Developer Notes / โน้ตความรู้ | Napatdev",
  description: "Searchable developer notes and technical cheatsheets by Napat Pamornsut covering Next.js, TypeScript, SQL, and web development. โน้ตความรู้และชีทสรุปด้านเทคนิคของ ณภัทร ภมรสูตร",
  path: "/notes",
});

export default function NotesIndexPage() {
  const firstNoteSlug = getFirstNoteSlug();
  redirect(firstNoteSlug ? `/notes/${firstNoteSlug}` : "/");
}
