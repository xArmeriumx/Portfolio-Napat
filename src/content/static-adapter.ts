import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { profile as sourceProfile } from "../data/profile.js";
import { projects as sourceProjects } from "../data/projects.js";
import {
  noteContentSchema,
  profileContentSchema,
  projectContentSchema,
  publishedRevision,
  toLocalizedText,
  type NoteContent,
  type ProfileContent,
  type ProjectContent,
} from "./schema";
import type { ContentRepository } from "./repository";

type SourceProfile = typeof sourceProfile;
type SourceProject = (typeof sourceProjects)[number];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function safeOptionalUrl(value: unknown) {
  if (typeof value !== "string" || !value || value === "#") return null;
  return value;
}

function mapProfile(source: SourceProfile): ProfileContent {
  return profileContentSchema.parse({
    id: "profile",
    revision: publishedRevision,
    identity: {
      name: toLocalizedText(source.name, source.name),
      headline: toLocalizedText(source.headline, source.headline),
      tagline: toLocalizedText(source.tagline, source.tagline),
    },
    biography: toLocalizedText(source.about, source.about_th),
    education: source.education.map((value, index) =>
      toLocalizedText(value, source.education_th[index]),
    ),
    contact: {
      location: toLocalizedText(source.contact.location, source.contact.location),
      phone: source.contact.phone,
      links: {
        email: source.links.email,
        github: safeOptionalUrl(source.links.github),
        linkedin: safeOptionalUrl(source.links.linkedin),
        resume: safeOptionalUrl(source.links.resume),
      },
    },
    skillCategories: source.skillCategories.map((category, categoryIndex) => ({
      id: `skill-category-${slugify(category.category)}`,
      name: toLocalizedText(category.category, category.category_th),
      order: categoryIndex,
      skills: category.skills.map((skill, skillIndex) => ({
        id: `skill-${slugify(skill.name)}-${skillIndex + 1}`,
        name: toLocalizedText(skill.name, skill.name),
        logo: skill.logo,
      })),
    })),
    seo: {
      title: null,
      description: null,
      image: "/favicon.png",
    },
  });
}

function mapProject(source: SourceProject, order: number): ProjectContent {
  const images = source.images || (source.image ? [source.image] : []);
  const title = source.title;
  return projectContentSchema.parse({
    id: source.slug,
    revision: publishedRevision,
    slug: source.slug,
    title: toLocalizedText(source.title, source.title_th),
    description: toLocalizedText(source.description, source.description_th),
    role: source.role || [],
    technologies: source.technologies || [],
    keyFeatures: {
      en: source.keyFeatures || [],
      th: source.keyFeatures_th || source.keyFeatures || [],
    },
    highlights: {
      en: source.highlights || [],
      th: source.highlights_th || source.highlights || [],
    },
    responsibilities: {
      en: source.responsibilities || [],
      th: source.responsibilities_th || source.responsibilities || [],
    },
    metrics: source.metrics || [],
    links: {
      demo: safeOptionalUrl(source.links?.demo),
      repo: safeOptionalUrl(source.links?.repo),
    },
    featured: Boolean(source.featured),
    order,
    media: images.map((url, mediaOrder) => ({
      id: `${source.slug}-media-${mediaOrder + 1}`,
      storageKey: null,
      url,
      mimeType: path.extname(url).toLowerCase() === ".jpg" || path.extname(url).toLowerCase() === ".jpeg"
        ? "image/jpeg"
        : "image/png",
      width: null,
      height: null,
      alt: toLocalizedText(`${title} ${mediaOrder + 1}`, `${source.title_th || title} ${mediaOrder + 1}`),
      caption: null,
      order: mediaOrder,
    })),
    seo: {
      title: null,
      description: null,
      image: images[0] || "/favicon.png",
    },
  });
}

function formatFileName(filePath: string) {
  const filename = path.basename(filePath).replace(/\.md$/, "");
  return filename
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getNotesDirectory() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/notes");
}

function getNoteDescription(markdown: string, name: string) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`_[\]()]/g, "")
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plainText || `Developer notes and cheatsheet document for ${name}.`;
}

function readStaticNotes(): NoteContent[] {
  return fs
    .readdirSync(getNotesDirectory())
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b))
    .map((file, order) => {
      const slug = file.replace(/\.md$/, "");
      const name = formatFileName(file);
      const bodyMarkdown = fs.readFileSync(path.join(getNotesDirectory(), file), "utf8");
      return noteContentSchema.parse({
        id: slug,
        revision: publishedRevision,
        slug,
        title: toLocalizedText(name, name),
        bodyMarkdown,
        excerpt: toLocalizedText(getNoteDescription(bodyMarkdown, name), getNoteDescription(bodyMarkdown, name)),
        order,
        rawName: file,
        seo: { title: null, description: null },
      });
    });
}

export class StaticContentRepository implements ContentRepository {
  private readonly profile: ProfileContent;
  private readonly projects: ProjectContent[];
  private readonly notes: NoteContent[];

  constructor() {
    this.profile = mapProfile(sourceProfile);
    this.projects = sourceProjects.map(mapProject);
    this.notes = readStaticNotes();
  }

  async getPublishedProfile() {
    return this.profile;
  }

  async listPublishedProjects() {
    return this.projects.filter((project) => project.revision.status === "PUBLISHED");
  }

  async getPublishedProjectBySlug(slug: string) {
    return (await this.listPublishedProjects()).find((project) => project.slug === slug) || null;
  }

  async getPublishedSlugRedirect() {
    return null;
  }

  async listPublishedNotes() {
    return this.notes.filter((note) => note.revision.status === "PUBLISHED");
  }

  async getPublishedNoteBySlug(slug: string) {
    return (await this.listPublishedNotes()).find((note) => note.slug === slug) || null;
  }
}

export { mapProfile, mapProject, readStaticNotes };
