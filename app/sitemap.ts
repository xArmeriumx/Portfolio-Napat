import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/seo.js";
import { getContentRepository } from "@/content/repository";

function route(url: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  const absoluteUrl = `${SITE_URL}${url}`;

  return {
    url: absoluteUrl,
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repository = await getContentRepository();
  const [projects, notes] = await Promise.all([
    repository.listPublishedProjects(),
    repository.listPublishedNotes(),
  ]);

  return [
    route("/", 1, "monthly"),
    route("/about", 0.9, "monthly"),
    route("/contact", 0.85, "monthly"),
    route("/projects", 0.95, "weekly"),
    route("/notes", 0.8, "weekly"),
    route("/search", 0.7, "weekly"),
    ...projects.map((project) => route(`/projects/${project.slug}`, 0.8, "monthly")),
    ...notes.map((note) => route(`/notes/${note.slug}`, 0.65, "monthly")),
  ];
}
