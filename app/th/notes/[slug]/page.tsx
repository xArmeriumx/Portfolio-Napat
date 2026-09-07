import type { Metadata } from "next";
import { metadataNotePage, renderNotePage } from "../../../(site)/notes/[slug]/page";
import { NOTE_TOPICS } from "@/lib/related";
import { isNoteTopicKey } from "@/lib/related";
import { getContentRepository } from "@/content/repository";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const repository = await getContentRepository();
  const notes = await repository.listPublishedNotes();
  return [
    ...notes.map((note) => ({ slug: note.slug })),
    ...Object.keys(NOTE_TOPICS).filter(isNoteTopicKey).map((topic) => ({ slug: topic })),
  ];
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataNotePage(slug, "th");
}

export default async function ThaiNoteDetailPage({ params }: Props) {
  const { slug } = await params;
  return renderNotePage(slug, "th");
}
