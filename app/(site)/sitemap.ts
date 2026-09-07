import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/seo.js";
import { NOTE_TOPICS, isNoteTopicKey } from "@/lib/related";
import { getContentRepository } from "@/content/repository";

export const revalidate = 3600;

type SitemapEntry = {
  url: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified?: Date;
  alternates?: MetadataRoute.Sitemap[number]["alternates"];
};

function route(
  url: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  lastModified?: string | null,
): SitemapEntry {
  const absoluteUrl = `${SITE_URL}${url}`;

  return {
    url: absoluteUrl,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: absoluteUrl,
        th: `${SITE_URL}/th${url === "/" ? "" : url}`,
        "x-default": absoluteUrl,
      },
    },
    ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repository = await getContentRepository();
  const [projects, notes] = await Promise.all([
    repository.listPublishedProjects(),
    repository.listPublishedNotes(),
  ]);

  const staticRoutes = ["/", "/about", "/contact", "/projects", "/notes"];
  const projectRoutes = projects.map((project) => `/projects/${project.slug}`);
  const noteRoutes = notes.map((note) => `/notes/${note.slug}`);
  const topicRoutes = Object.keys(NOTE_TOPICS).filter(isNoteTopicKey).map((topic) => `/notes/${topic}`);

  const enEntries: MetadataRoute.Sitemap = [
    route("/", 1, "monthly"),
    route("/about", 0.9, "monthly"),
    route("/contact", 0.85, "monthly"),
    route("/projects", 0.95, "weekly"),
    route("/notes", 0.8, "weekly"),
    ...projects.map((project) =>
      route(`/projects/${project.slug}`, 0.8, "monthly", project.revision.publishedAt),
    ),
    ...notes.map((note) => route(`/notes/${note.slug}`, 0.65, "monthly", note.revision.publishedAt)),
    ...topicRoutes.map((url) => route(url, 0.7, "weekly")),
  ];

  // Thai tree mirrors every indexable route with identical hreflang pairs.
  const thEntries: MetadataRoute.Sitemap = [...staticRoutes, ...projectRoutes, ...noteRoutes, ...topicRoutes].map(
    (url) => {
      const thUrl = `/th${url === "/" ? "" : url}`;
      const enUrl = `${SITE_URL}${url}`;
      const absoluteThUrl = `${SITE_URL}${thUrl}`;
      return {
        url: absoluteThUrl,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: {
          languages: {
            en: enUrl,
            th: absoluteThUrl,
            "x-default": enUrl,
          },
        },
      };
    },
  );

  return [...enEntries, ...thEntries];
}
