import type { MetadataRoute } from "next";
import type { ContentRepository } from "@/content/repository";
import { getNoteLocales, getProjectLocales, toPresentationNote } from "@/content/presentation";
import { NOTE_TOPICS, getTopicHub, isNoteTopicKey } from "./related";
import { SITE_URL } from "@/config/seo.js";

type Locale = "en" | "th";
export async function buildSitemap(repository: ContentRepository): Promise<MetadataRoute.Sitemap> {
  const [profile, projects, notes] = await Promise.all([
    repository.getPublishedProfile(), repository.listPublishedProjects(), repository.listPublishedNotes(),
  ]);
  const entries: MetadataRoute.Sitemap = [];
  function add(path: string, locales: Locale[], modified?: string | null) {
    const urls = Object.fromEntries(locales.map((locale) => [locale, `${SITE_URL}${locale === "th" ? "/th" : ""}${path === "/" && locale === "th" ? "" : path}`]));
    for (const locale of locales) entries.push({
      url: urls[locale],
      alternates: { languages: { ...urls, "x-default": urls.en || urls.th } },
      ...(modified && Number.isFinite(Date.parse(modified)) ? { lastModified: new Date(modified) } : {}),
    });
  }
  for (const path of ["/", "/about", "/contact", "/projects", "/notes"]) add(path, ["en", "th"], ["/", "/about", "/contact"].includes(path) ? profile.revision.publishedAt : null);
  for (const project of projects) add(`/projects/${project.slug}`, getProjectLocales(project), project.revision.publishedAt);
  for (const note of notes) add(`/notes/${note.slug}`, getNoteLocales(note), note.revision.publishedAt);
  for (const topic of Object.keys(NOTE_TOPICS).filter(isNoteTopicKey)) {
    const locales = (["en", "th"] as const).filter((locale) => getTopicHub(topic, notes.filter((note) => getNoteLocales(note).includes(locale)).map((note) => toPresentationNote(note, locale))).length > 0);
    add(`/notes/${topic}`, locales);
  }
  return entries;
}
