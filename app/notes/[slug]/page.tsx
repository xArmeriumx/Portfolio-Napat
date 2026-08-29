import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Notes from "@/views/Notes.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { buildPageMetadata } from "@/lib/metadata";
import { getNoteSchema, getNoteSeoMeta } from "@/lib/notes";
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
  let rawNote = await repository.getPublishedNoteBySlug(slug);
  if (!rawNote) {
    const redirectedSlug = await repository.getPublishedSlugRedirect("NOTE", slug);
    if (redirectedSlug) rawNote = await repository.getPublishedNoteBySlug(redirectedSlug);
  }
  const note = rawNote ? toPresentationNote(rawNote) : null;

  if (!note) {
    return buildPageMetadata({
      title: "Note Not Found",
      description: "Developer note not found.",
      path: `/notes/${slug}`,
      noindex: true,
    });
  }

  const noteSeo = getNoteSeoMeta(note);
  return buildPageMetadata({
    title: noteSeo.title,
    description: noteSeo.description,
    ogTitle: noteSeo.ogTitle,
    ogDescription: noteSeo.ogDescription,
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

  if (!rawNote) {
    const redirectedSlug = await repository.getPublishedSlugRedirect("NOTE", slug);
    if (redirectedSlug) redirect(`/notes/${encodeURIComponent(redirectedSlug)}`);
    notFound();
  }

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
