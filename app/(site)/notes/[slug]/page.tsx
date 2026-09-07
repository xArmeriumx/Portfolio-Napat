import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Notes from "@/views/Notes.jsx";
import JsonLd from "@/components/utils/JsonLd";
import TopicHub from "@/components/notes/TopicHub.jsx";
import { buildPageMetadata } from "@/lib/metadata";
import { getNoteSchema, getNoteSeoMeta } from "@/lib/notes";
import { NOTE_TOPICS, getRelatedProjects, getTopicHub, isNoteTopicKey } from "@/lib/related";
import { SITE_URL, WEBSITE_ID, absoluteUrl, getCoreSiteSchemas } from "@/config/seo.js";
import type { SiteLocale } from "../../page";
import { getContentRepository } from "@/content/repository";
import { toPresentationNote, toPresentationProfile, toPresentationProject } from "@/content/presentation";

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

function notesBase(locale: SiteLocale) {
  return locale === "th" ? "/th/notes" : "/notes";
}

export async function metadataNotePage(slug: string, locale: SiteLocale = "en"): Promise<Metadata> {
  if (isNoteTopicKey(slug)) {
    const topic = NOTE_TOPICS[slug];
    return buildPageMetadata({
      title: topic.title,
      description: topic.description,
      ogTitle: topic.title,
      ogDescription: topic.description,
      ogKind: "note",
      ogSubtitle: `โน้ตความรู้โดย Napat Pamornsut`,
      path: `${notesBase(locale)}/${slug}`,
      keywords: [topic.label, `${topic.label} guide`, `Napatdev ${topic.label}`, `ณภัทร ภมรสูตร ${topic.label}`, "developer notes"],
      locale,
    });
  }
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
      path: `${notesBase(locale)}/${slug}`,
      noindex: true,
      locale,
    });
  }

  const noteSeo = getNoteSeoMeta(note, locale);
  return buildPageMetadata({
    title: noteSeo.title,
    description: noteSeo.description,
    ogTitle: noteSeo.ogTitle,
    ogDescription: noteSeo.ogDescription,
    ogType: "article",
    ogSection: "Developer Notes",
    ogKind: "note",
    ogSubtitle: `โน้ตความรู้โดย Napat Pamornsut`,
    publishedTime: note.publishedAt,
    modifiedTime: note.updatedAt || note.publishedAt,
    path: `${notesBase(locale)}/${note.slug}`,
    keywords: [note.name, `Napatdev ${note.name}`, `Napat Pamornsut ${note.name}`, `ณภัทร ภมรสูตร ${note.name}`, "developer notes", "technical cheatsheet"],
    locale,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataNotePage(slug, "en");
}

export async function renderNotePage(slug: string, locale: SiteLocale = "en") {
  const repository = await getContentRepository();
  const base = notesBase(locale);
  const homeUrl = locale === "th" ? `${SITE_URL}/th` : `${SITE_URL}/`;
  if (isNoteTopicKey(slug)) {
    const [rawProfile, rawNotes] = await Promise.all([
      repository.getPublishedProfile(),
      repository.listPublishedNotes(),
    ]);
    const profile = toPresentationProfile(rawProfile);
    const hubNotes = getTopicHub(slug, rawNotes.map(toPresentationNote));
    const topic = NOTE_TOPICS[slug];
    const hubUrl = absoluteUrl(`${base}/${slug}`);
    const notesIndexUrl = absoluteUrl(base);
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              ...getCoreSiteSchemas(profile),
              {
                "@type": "CollectionPage",
                "@id": `${hubUrl}#collection`,
                url: hubUrl,
                name: topic.title,
                description: topic.description,
                inLanguage: ["en", "th"],
                isPartOf: { "@id": WEBSITE_ID },
                mainEntity: {
                  "@type": "ItemList",
                  name: topic.title,
                  numberOfItems: hubNotes.length,
                  itemListElement: hubNotes.map((note, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: note.displayTitle,
                    url: absoluteUrl(`${base}/${note.slug}`),
                  })),
                },
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${hubUrl}#breadcrumb`,
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home / หน้าแรก", item: homeUrl },
                  { "@type": "ListItem", position: 2, name: "Developer Notes / โน้ตความรู้", item: notesIndexUrl },
                  { "@type": "ListItem", position: 3, name: topic.title, item: hubUrl },
                ],
              },
            ],
          }}
        />
        <TopicHub topic={topic} notes={hubNotes} locale={locale} />
      </>
    );
  }
  const [rawProfile, rawNote, rawNotes, rawProjects] = await Promise.all([
    repository.getPublishedProfile(),
    repository.getPublishedNoteBySlug(slug),
    repository.listPublishedNotes(),
    repository.listPublishedProjects(),
  ]);

  if (!rawNote) {
    const redirectedSlug = await repository.getPublishedSlugRedirect("NOTE", slug);
    if (redirectedSlug) permanentRedirect(`${base}/${encodeURIComponent(redirectedSlug)}`);
    notFound();
  }

  const profile = toPresentationProfile(rawProfile);
  const note = toPresentationNote(rawNote);
  const notes = rawNotes.map(toPresentationNote);
  const relatedProjects = getRelatedProjects(note, rawProjects.map(toPresentationProject));

  return (
    <>
      <JsonLd data={getNoteSchema(note, profile)} />
      <Notes initialNotes={notes} slug={slug} relatedProjects={relatedProjects} locale={locale} />
    </>
  );
}

export default async function NoteDetailPage({ params }: Props) {
  const { slug } = await params;
  return renderNotePage(slug, "en");
}
