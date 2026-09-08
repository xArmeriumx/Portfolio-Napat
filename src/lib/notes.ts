import {
  absoluteUrl,
  getCoreSiteSchemas,
  normalizeMetaDescription,
  PERSON_ID,
  WEBSITE_ID,
  SITE_URL,
} from "@/config/seo.js";
import { buildOgImageUrl } from "@/lib/metadata";
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

export function getNoteWordCount(note: Note) {
  const plainText = note.content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`_[\]()]/g, "")
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plainText) return 0;
  return plainText.split(" ").length;
}

export function getNoteSeoMeta(note: Note, locale: "en" | "th" = "en") {
  const titleOverride =
    locale === "th"
      ? note.seo?.title?.th?.trim() || ""
      : note.seo?.title?.en?.trim() || "";
  const descriptionOverride =
    locale === "th"
      ? note.seo?.description?.th?.trim() || ""
      : note.seo?.description?.en?.trim() || "";
  const generatedDescription = getNoteDescription(note);

  return {
    title: titleOverride || note.displayTitle,
    description: descriptionOverride || generatedDescription,
    ogTitle: titleOverride || note.displayTitle,
    ogDescription: descriptionOverride || getNoteDescription(note, 200),
    schemaTitle: titleOverride || note.displayTitle,
    schemaDescription: descriptionOverride || getNoteDescription(note, 220),
  };
}

export function getNotesCollectionSchema(notes: Note[], profile: PresentationProfile, locale: "en" | "th" = "en") {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${locale === "th" ? "/th" : ""}/notes#collection`,
        url: absoluteUrl(locale === "th" ? "/th/notes" : "/notes"),
        name: locale === "th" ? "โน้ตความรู้" : "Developer Notes",
        alternateName: ["Developer Notes", "โน้ตความรู้", "ชีทสรุปด้านเทคนิค"],
        description: locale === "th" ? "โน้ตพัฒนาเว็บและทดสอบซอฟต์แวร์โดย ณภัทร ภมรสูตร" : "Development and testing notes by Napat Pamornsut.",
        inLanguage: locale,
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        mainEntity: {
          "@type": "ItemList",
          name: locale === "th" ? "โน้ตความรู้" : "Developer Notes",
          numberOfItems: notes.length,
          itemListElement: notes.map((note, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: note.displayTitle,
            alternateName: [note.name, `โน้ต ${note.displayTitle}`],
            url: absoluteUrl(`${locale === "th" ? "/th" : ""}/notes/${note.slug}`),
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}${locale === "th" ? "/th" : ""}/notes#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home / หน้าแรก", item: absoluteUrl(locale === "th" ? "/th" : "/") },
          { "@type": "ListItem", position: 2, name: locale === "th" ? "โน้ตความรู้" : "Developer Notes", item: absoluteUrl(locale === "th" ? "/th/notes" : "/notes") },
        ],
      },
    ],
  };
}

export function getNoteSchema(note: Note, profile: PresentationProfile, locale: "en" | "th" = "en") {
  const noteUrl = absoluteUrl(`${locale === "th" ? "/th" : ""}/notes/${note.slug}`);
  const seo = getNoteSeoMeta(note, locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...getCoreSiteSchemas(profile),
      {
        "@type": "TechArticle",
        "@id": `${noteUrl}#article`,
        url: noteUrl,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": noteUrl,
        },
        headline: seo.schemaTitle,
        name: seo.schemaTitle,
        alternateName: [seo.schemaTitle, `โน้ต ${note.name}`, `Cheatsheet ${note.name}`],
        description: seo.schemaDescription,
        image: absoluteUrl(buildOgImageUrl("note", seo.schemaTitle, "โน้ตความรู้โดย Napat Pamornsut")),
        inLanguage: locale,
        wordCount: getNoteWordCount(note),
        author: {
          "@id": PERSON_ID,
          "@type": "Person",
          name: profile.name,
          url: `${SITE_URL}/`,
        },
        publisher: { "@id": PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
        ...(note.publishedAt ? { datePublished: note.publishedAt } : {}),
        ...(note.updatedAt || note.publishedAt ? { dateModified: note.updatedAt || note.publishedAt } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${noteUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home / หน้าแรก", item: absoluteUrl(locale === "th" ? "/th" : "/") },
          { "@type": "ListItem", position: 2, name: locale === "th" ? "โน้ตความรู้" : "Developer Notes", item: absoluteUrl(locale === "th" ? "/th/notes" : "/notes") },
          { "@type": "ListItem", position: 3, name: `${note.displayTitle} / โน้ต ${note.displayTitle}`, item: noteUrl },
        ],
      },
    ],
  };
}
