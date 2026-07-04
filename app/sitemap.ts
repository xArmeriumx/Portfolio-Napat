import type { MetadataRoute } from "next";
import { projects } from "@/data/projects.js";
import { SITE_URL } from "@/config/seo.js";
import { getAllNotes } from "@/lib/notes";

const now = new Date();

function route(url: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  const absoluteUrl = `${SITE_URL}${url}`;

  return {
    url: absoluteUrl,
    lastModified: now,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    route("/", 1, "monthly"),
    route("/about", 0.9, "monthly"),
    route("/contact", 0.85, "monthly"),
    route("/projects", 0.95, "weekly"),
    route("/search", 0.7, "weekly"),
    ...projects.map((project) => route(`/projects/${project.slug}`, 0.8, "monthly")),
    ...getAllNotes().map((note) => route(`/notes/${note.id}`, 0.65, "monthly")),
  ];
}
