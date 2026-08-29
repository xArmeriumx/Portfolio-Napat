import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Notes from "@/views/Notes.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { getNoteDescription, getNoteSchema } from "@/lib/notes";
import { getContentRepository } from "@/content/repository";
import { toPresentationNote, toPresentationProfile } from "@/content/presentation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const repository = await getContentRepository();
  const rawNote = await repository.getPublishedNoteBySlug(slug);
  const note = rawNote ? toPresentationNote(rawNote) : null;

  if (!note) {
    return buildPageMetadata({
      title: "Note Not Found",
      description: "Developer note not found.",
      path: `/notes/${slug}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: `${note.name} Cheatsheet | Napatdev | Napat Pamornsut`,
    description: `${getNoteDescription(note)} โน้ตความรู้เรื่อง ${note.name} โดย ณภัทร ภมรสูตร และ Napatdev`,
    ogTitle: `${note.name} Cheatsheet | Napatdev`,
    ogDescription: getNoteDescription(note, 200),
    ogType: "article",
    ogImage: "/favicon.png",
    ogImageWidth: 512,
    ogImageHeight: 512,
    path: `/notes/${note.id}`,
    keywords: [note.name, `Napatdev ${note.name}`, `Napat Pamornsut ${note.name}`, `ณภัทร ภมรสูตร ${note.name}`, "developer notes", "technical cheatsheet"],
  });
}

export default async function NoteDetailPage({ params }: Props) {
  const { slug } = await params;
  const repository = await getContentRepository();
  const [rawProfile, rawNote, rawNotes] = await Promise.all([
    repository.getPublishedProfile(),
    repository.getPublishedNoteBySlug(slug),
    repository.listPublishedNotes(),
  ]);

  if (!rawNote) notFound();

  const profile = toPresentationProfile(rawProfile);
  const note = toPresentationNote(rawNote);
  const notes = rawNotes.map(toPresentationNote);

  return (
    <>
      <JsonLd data={getNoteSchema(note, profile)} />
      <Notes initialNotes={notes} slug={slug} />
    </>
  );
}
