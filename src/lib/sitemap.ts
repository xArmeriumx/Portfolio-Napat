import type { MetadataRoute } from "next";
import type { ContentRepository } from "@/content/repository";
import { getNoteLocales, getProjectLocales, toPresentationNote } from "@/content/presentation";
import { NOTE_TOPICS, getTopicHub, isNoteTopicKey } from "./related";
import { SITE_URL } from "@/config/seo.js";

type Locale = "en" | "th";

function latestPublishedAt(values: Array<string | null | undefined>) {
  const timestamps = values
    .filter((value): value is string => Boolean(value && Number.isFinite(Date.parse(value))))
    .map((value) => Date.parse(value));

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

export async function buildSitemap(repository: ContentRepository): Promise<MetadataRoute.Sitemap> {
  const [profile, projects, notes] = await Promise.all([
    repository.getPublishedProfile(),
    repository.listPublishedProjects(),
    repository.listPublishedNotes(),
  ]);
  const entries: MetadataRoute.Sitemap = [];

  function add(path: string, locales: Locale[], modified?: string | null) {
    if (locales.length === 0) return;

    const urls = Object.fromEntries(
      locales.map((locale) => [
        locale,
        `${SITE_URL}${locale === "th" ? "/th" : ""}${
          path === "/" && locale === "th" ? "" : path
        }`,
      ]),
    );

    for (const locale of locales) {
      entries.push({
        url: urls[locale],
        alternates: {
          languages: {
            ...urls,
            "x-default": urls.en || urls.th,
          },
        },
        ...(modified && Number.isFinite(Date.parse(modified))
          ? { lastModified: new Date(modified) }
          : {}),
      });
    }
  }

  const latestProject = latestPublishedAt(
    projects.map((project) => project.revision.publishedAt),
  );
  const latestNote = latestPublishedAt(
    notes.map((note) => note.revision.publishedAt),
  );

  add("/", ["en", "th"], profile.revision.publishedAt);
  add("/about", ["en", "th"], profile.revision.publishedAt);
  add("/contact", ["en", "th"], profile.revision.publishedAt);
  add("/projects", ["en", "th"], latestProject);
  add("/notes", ["en", "th"], latestNote);

  for (const project of projects) {
    add(
      `/projects/${project.slug}`,
      getProjectLocales(project),
      project.revision.publishedAt,
    );
  }

  for (const note of notes) {
    add(
      `/notes/${note.slug}`,
      getNoteLocales(note),
      note.revision.publishedAt,
    );
  }

  for (const topic of Object.keys(NOTE_TOPICS).filter(isNoteTopicKey)) {
    const topicNotesByLocale = Object.fromEntries(
      (["en", "th"] as const).map((locale) => {
        const localizedNotes = notes
          .filter((note) => getNoteLocales(note).includes(locale))
          .map((note) => toPresentationNote(note, locale));

        return [locale, getTopicHub(topic, localizedNotes)];
      }),
    ) as Record<Locale, ReturnType<typeof getTopicHub>>;

    const locales = (["en", "th"] as const).filter(
      (locale) => topicNotesByLocale[locale].length > 0,
    );
    const modified = latestPublishedAt(
      locales.flatMap((locale) =>
        topicNotesByLocale[locale].map(
          (note) => note.updatedAt || note.publishedAt,
        ),
      ),
    );

    add(`/notes/${topic}`, locales, modified);
  }

  return entries;
}
