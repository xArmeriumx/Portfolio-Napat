import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Notes from "@/views/Notes.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { getAllNotes, getNoteBySlug, getNoteDescription, getNoteSchema } from "@/lib/notes";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    return buildPageMetadata({
      title: "Note Not Found",
      description: "Developer note not found.",
      path: `/notes/${slug}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: `${note.name} - Cheatsheet | Napat Portfolio`,
    description: `${getNoteDescription(note)} โน้ตความรู้เรื่อง ${note.name} โดย ณภัทร ภมรสูตร`,
    ogTitle: `${note.name} - Cheatsheet | Napat Portfolio`,
    ogDescription: getNoteDescription(note, 200),
    ogType: "article",
    ogImage: "/favicon.png",
    ogImageWidth: 512,
    ogImageHeight: 512,
    path: `/notes/${note.id}`,
  });
}

export default async function NoteDetailPage({ params }: Props) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) notFound();

  return (
    <>
      <JsonLd data={getNoteSchema(note)} />
      <Notes initialNotes={getAllNotes()} slug={slug} />
    </>
  );
}
