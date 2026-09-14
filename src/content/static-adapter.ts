import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { profile as sourceProfile } from "../data/profile.js";
import { projects as sourceProjects } from "../data/projects.js";
import { getNoteCatalogEntry } from "../data/note-catalog.js";
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
      name: toLocalizedText(source.name, source.name_th),
      headline: toLocalizedText(source.headline, source.headline_th),
      tagline: toLocalizedText(source.tagline, source.tagline_th),
    },
    biography: toLocalizedText(source.about, source.about_th),
    education: source.education.map((value, index) =>
      toLocalizedText(value, source.education_th[index]),
    ),
    contact: {
      location: toLocalizedText(source.contact.location, source.contact.location_th),
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
      alt: toLocalizedText(
        `${title} project interface — screenshot ${mediaOrder + 1}`,
        `ภาพหน้าจอ ${mediaOrder + 1} ของโปรเจค ${source.title_th || title}`,
      ),
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

// Permanent slug renames. Mirrors the SlugRedirect rows that the CMS
// publish flow auto-creates in production (admin-service publishDraft),
// so previews and static builds 308 old URLs to their replacements.
const STATIC_SLUG_REDIRECTS: Record<string, string> = {
  "NOTE:NEXTJS_ARCHITECTURE": "nextjs-app-router-guide",
  "NOTE:TYPESCRIPT_REFERENCE": "typescript-reference-guide",
  "NOTE:sql_basics_with_examples_easy": "sql-basics",
  "NOTE:sql_code_and_response_tables": "sql-query-examples",
};

function getNoteDescription(markdown: string, name: string) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`_[\]()]/g, "")
    .replace(/(\r\n|\n|\r)/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plainText || `Developer notes and cheatsheet document for ${name}.`;
}

export type NoteLocale = "en" | "th";

export type NoteFileMeta = {
  title?: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  order?: number;
};

// Minimal frontmatter reader (no extra dependency). Supported keys:
// title, excerpt, seo_title, seo_description, order. Everything after the
// closing `---` is the Markdown body for one locale file (`<slug>.en.md`
// or `<slug>.th.md`). Files without frontmatter keep working as before.
export function parseNoteFrontmatter(raw: string): { meta: NoteFileMeta; body: string } {
  if (!raw.startsWith("---")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: raw };
  const block = raw.slice(3, end).replace(/^\r?\n/, "");
  const body = raw.slice(end + 4).replace(/^\r?\n/, "");
  const meta: NoteFileMeta = {};
  for (const line of block.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    if (key === "order") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) meta.order = parsed;
    } else if (key === "title") {
      meta.title = value;
    } else if (key === "excerpt") {
      meta.excerpt = value;
    } else if (key === "seo_title") {
      meta.seoTitle = value;
    } else if (key === "seo_description") {
      meta.seoDescription = value;
    }
  }
  return { meta, body };
}

function extractFirstH1(markdown: string): string | null {
  const match = markdown.match(/^#{1}\s+(.+)$/m);
  if (!match) return null;
  return match[1].replace(/[#*`_[\]()]/g, "").replace(/\s+/g, " ").trim() || null;
}

type LocaleNoteFile = { body: string; meta: NoteFileMeta; file: string };

function readStaticNotes(): NoteContent[] {
  const files = fs
    .readdirSync(getNotesDirectory())
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));
  // Group `<slug>.en.md` / `<slug>.th.md` pairs (real translations) with
  // legacy single `<slug>.md` bodies. The note catalog keeps overriding
  // titles, excerpts, SEO and publish dates wherever it has an entry.
  const groups = new Map<string, { en?: LocaleNoteFile; th?: LocaleNoteFile; legacy?: { body: string; file: string } }>();
  for (const file of files) {
    const localeMatch = file.match(/^(.+)\.(en|th)\.md$/);
    if (localeMatch) {
      const slug = localeMatch[1];
      const locale = localeMatch[2] as NoteLocale;
      const { meta, body } = parseNoteFrontmatter(
        fs.readFileSync(path.join(getNotesDirectory(), file), "utf8"),
      );
      const group = groups.get(slug) ?? {};
      group[locale] = { body, meta, file };
      groups.set(slug, group);
    } else {
      const slug = file.replace(/\.md$/, "");
      const group = groups.get(slug) ?? {};
      group.legacy = {
        body: fs.readFileSync(path.join(getNotesDirectory(), file), "utf8"),
        file,
      };
      groups.set(slug, group);
    }
  }
  return [...groups.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((slug, index) => {
      const group = groups.get(slug)!;
      const catalog = getNoteCatalogEntry(slug);
      const fallbackName = formatFileName(slug);
      const enBody = group.en?.body;
      const thBody = group.th?.body;
      const legacyBody = group.legacy?.body;
      const bodyMarkdown = enBody ?? thBody ?? legacyBody ?? "";
      const titleEn = group.en?.meta.title?.trim() || (enBody ? extractFirstH1(enBody) : null) || fallbackName;
      const titleTh = group.th?.meta.title?.trim() || (thBody ? extractFirstH1(thBody) : null) || fallbackName;
      const excerptEn =
        group.en?.meta.excerpt?.trim() || (enBody ? getNoteDescription(enBody, titleEn) : null) || getNoteDescription(bodyMarkdown, titleEn);
      const excerptTh =
        group.th?.meta.excerpt?.trim() || (thBody ? getNoteDescription(thBody, titleTh) : null) || getNoteDescription(bodyMarkdown, titleTh);
      const pairedLocales: { en?: string; th?: string } = {};
      if (enBody?.trim()) pairedLocales.en = enBody;
      if (thBody?.trim()) pairedLocales.th = thBody;
      const seoTitleEn = group.en?.meta.seoTitle?.trim() || group.th?.meta.seoTitle?.trim() || null;
      const seoTitleTh = group.th?.meta.seoTitle?.trim() || group.en?.meta.seoTitle?.trim() || null;
      const seoDescriptionEn =
        group.en?.meta.seoDescription?.trim() || group.th?.meta.seoDescription?.trim() || null;
      const seoDescriptionTh =
        group.th?.meta.seoDescription?.trim() || group.en?.meta.seoDescription?.trim() || null;
      const revision = catalog?.publishedAt
        ? {
            ...publishedRevision,
            publishedAt: catalog.publishedAt,
            updatedAt: catalog.publishedAt,
          }
        : publishedRevision;
      return noteContentSchema.parse({
        id: slug,
        revision,
        slug,
        title: catalog?.title || toLocalizedText(titleEn, titleTh),
        bodyMarkdown,
        ...(Object.keys(pairedLocales).length > 0
          ? { bodyMarkdownByLocale: pairedLocales }
          : catalog?.sourceLocale
            ? { bodyMarkdownByLocale: { [catalog.sourceLocale]: bodyMarkdown } }
            : {}),
        excerpt: catalog?.excerpt || toLocalizedText(excerptEn, excerptTh),
        // Explicit frontmatter orders (10-19 for the bilingual SEO pairs)
        // sort first; notes without frontmatter sort after.
        order: group.en?.meta.order ?? group.th?.meta.order ?? 100 + index,
        rawName: group.en?.file ?? group.th?.file ?? group.legacy?.file ?? `${slug}.md`,
        seo: {
          title: catalog?.seo?.title || (seoTitleEn || seoTitleTh ? toLocalizedText(seoTitleEn || "", seoTitleTh || "") : null),
          description: catalog?.seo?.description || (seoDescriptionEn || seoDescriptionTh ? toLocalizedText(seoDescriptionEn || "", seoDescriptionTh || "") : null),
          keywords: catalog?.seo?.keywords || [],
        },
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

  async getPublishedSlugRedirect(contentType: "PROJECT" | "NOTE", slug: string) {
    return STATIC_SLUG_REDIRECTS[`${contentType}:${slug}`] ?? null;
  }

  async listPublishedNotes() {
    return this.notes.filter((note) => note.revision.status === "PUBLISHED");
  }

  async getPublishedNoteBySlug(slug: string) {
    return (await this.listPublishedNotes()).find((note) => note.slug === slug) || null;
  }
}

export { mapProfile, mapProject, readStaticNotes };
