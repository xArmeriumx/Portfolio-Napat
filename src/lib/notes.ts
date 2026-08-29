import {
  absoluteUrl,
  getCoreSiteSchemas,
  normalizeMetaDescription,
  ORGANIZATION_ID,
  PERSON_ID,
  WEBSITE_ID,
  SITE_URL,
} from "@/config/seo.js";
import type { PresentationNote, PresentationProfile } from "@/content/presentation";

export type Note = PresentationNote;

export function getNoteDescription(note: Note, maxLength = 160) {
  const plainText = note.content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`_[\]()]/g, "")
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalizeMetaDescription(
    plainText || `Developer notes and cheatsheet document for ${note.name}.`,
    maxLength,
  );
}

export function getNotesCollectionSchema(notes: Note[], profile: PresentationProfile) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/notes#collection`,
        url: absoluteUrl("/notes"),
        name: "Developer Notes / โน้ตความรู้",
        alternateName: ["Developer Notes", "โน้ตความรู้", "ชีทสรุปด้านเทคนิค"],
        description: "Developer notes and searchable technical cheatsheets by Napat Pamornsut. โน้ตความรู้และชีทสรุปด้านเทคนิคโดย ณภัทร ภมรสูตร",
        inLanguage: ["en", "th"],
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        mainEntity: {
          "@type": "ItemList",
          name: "Developer Notes / โน้ตความรู้",
          numberOfItems: notes.length,
          itemListElement: notes.map((note, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: note.name,
            alternateName: [note.name, `โน้ต ${note.name}`],
            url: absoluteUrl(`/notes/${note.id}`),
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/notes#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home / หน้าแรก", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Developer Notes / โน้ตความรู้", item: absoluteUrl("/notes") },
        ],
      },
    ],
  };
}

export function getNoteSchema(note: Note, profile: PresentationProfile) {
  const noteUrl = absoluteUrl(`/notes/${note.id}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "TechArticle",
        "@id": `${noteUrl}#article`,
        url: noteUrl,
        headline: note.name,
        name: note.name,
        alternateName: [note.name, `โน้ต ${note.name}`, `Cheatsheet ${note.name}`],
        description: `${getNoteDescription(note, 220)} โน้ตความรู้และชีทสรุปเรื่อง ${note.name} โดย ณภัทร ภมรสูตร`,
        inLanguage: ["en", "th"],
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORGANIZATION_ID },
        isPartOf: { "@id": WEBSITE_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${noteUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home / หน้าแรก", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Developer Notes / โน้ตความรู้", item: absoluteUrl("/notes") },
          { "@type": "ListItem", position: 3, name: `${note.name} / โน้ต ${note.name}`, item: noteUrl },
        ],
      },
    ],
  };
}
