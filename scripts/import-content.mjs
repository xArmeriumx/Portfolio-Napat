/* global process, URL, console */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { profile } from "../src/data/profile.js";
import { projects } from "../src/data/projects.js";
import { getNoteCatalogEntry } from "../src/data/note-catalog.js";
import { canonicalNoteSlug, legacyNoteSlug } from "../src/data/note-slugs.js";

const allowedSchemas = new Set(["portfolio_cms_dev", "portfolio_cms_preview", "portfolio_cms_prod"]);
const schema = process.env.PORTFOLIO_CMS_SCHEMA;

if (!schema || !allowedSchemas.has(schema)) {
  throw new Error("PORTFOLIO_CMS_SCHEMA must be one of portfolio_cms_dev, portfolio_cms_preview, portfolio_cms_prod");
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const databaseUrl = new URL(process.env.DATABASE_URL);
if (databaseUrl.searchParams.get("schema") !== schema) {
  throw new Error("DATABASE_URL schema does not match PORTFOLIO_CMS_SCHEMA");
}

const prisma = new PrismaClient();
const revisionTime = new Date();

function localized(en, th) {
  return { en: String(en ?? ""), th: typeof th === "string" && th.trim() ? th : String(en ?? "") };
}

function optionalUrl(value) {
  return typeof value === "string" && value && value !== "#" ? value : null;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function profilePayload() {
  return {
    id: "profile",
    identity: {
      name: localized(profile.name, profile.name_th),
      headline: localized(profile.headline, profile.headline_th),
      tagline: localized(profile.tagline, profile.tagline_th),
    },
    biography: localized(profile.about, profile.about_th),
    education: profile.education.map((value, index) => localized(value, profile.education_th[index])),
    contact: {
      location: localized(profile.contact.location, profile.contact.location_th),
      phone: profile.contact.phone,
      links: {
        email: profile.links.email,
        github: optionalUrl(profile.links.github),
        linkedin: optionalUrl(profile.links.linkedin),
        resume: optionalUrl(profile.links.resume),
      },
    },
    skillCategories: profile.skillCategories.map((category, categoryIndex) => ({
      id: `skill-category-${slugify(category.category)}`,
      name: localized(category.category, category.category_th),
      order: categoryIndex,
      skills: category.skills.map((skill, skillIndex) => ({
        id: `skill-${slugify(skill.name)}-${skillIndex + 1}`,
        name: localized(skill.name, skill.name),
        logo: skill.logo,
      })),
    })),
    seo: { title: null, description: null, image: "/favicon.png" },
  };
}

function projectPayload(project, order) {
  const images = project.images || (project.image ? [project.image] : []);
  return {
    id: project.slug,
    slug: project.slug,
    title: localized(project.title, project.title_th),
    description: localized(project.description, project.description_th),
    role: project.role || [],
    technologies: project.technologies || [],
    keyFeatures: { en: project.keyFeatures || [], th: project.keyFeatures_th || project.keyFeatures || [] },
    highlights: { en: project.highlights || [], th: project.highlights_th || project.highlights || [] },
    responsibilities: { en: project.responsibilities || [], th: project.responsibilities_th || project.responsibilities || [] },
    metrics: project.metrics || [],
    links: { demo: optionalUrl(project.links?.demo), repo: optionalUrl(project.links?.repo) },
    featured: Boolean(project.featured),
    order,
    media: images.map((url, mediaOrder) => ({
      id: `${project.slug}-media-${mediaOrder + 1}`,
      storageKey: null,
      url,
      mimeType: /\.(jpe?g)$/i.test(url) ? "image/jpeg" : "image/png",
      width: null,
      height: null,
      alt: localized(`${project.title} ${mediaOrder + 1}`, `${project.title_th || project.title} ${mediaOrder + 1}`),
      caption: null,
      order: mediaOrder,
    })),
    seo: { title: null, description: null, image: images[0] || "/favicon.png" },
  };
}

function noteDescription(markdown, name) {
  const plainText = markdown.replace(/```[\s\S]*?```/g, " ").replace(/[#*`_[\]()]/g, "").replace(/\s+/g, " ").trim();
  return plainText || `Developer notes and cheatsheet document for ${name}.`;
}

function formatSlugName(slug) {
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Mirrors src/content/static-adapter.ts: `<slug>.en.md` / `<slug>.th.md`
// carry one locale each (optional frontmatter: title, excerpt, seo_title,
// seo_description, order). Plain `<slug>.md` stays a legacy single body.
// The note catalog keeps overriding titles, excerpts, SEO and locales.
function parseNoteFrontmatter(raw) {
  if (!raw.startsWith("---")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: raw };
  const block = raw.slice(3, end).replace(/^\r?\n/, "");
  const body = raw.slice(end + 4).replace(/^\r?\n/, "");
  const meta = {};
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
    } else if (["title", "excerpt", "seo_title", "seo_description"].includes(key)) {
      meta[key] = value;
    }
  }
  return { meta, body };
}

function extractFirstH1(markdown) {
  const match = String(markdown).match(/^#{1}\s+(.+)$/m);
  if (!match) return null;
  return match[1].replace(/[#*`_[\]()]/g, "").replace(/\s+/g, " ").trim() || null;
}

function notePayloads() {
  const notesDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/data/notes");
  const files = fs.readdirSync(notesDirectory).filter((file) => file.endsWith(".md")).sort((a, b) => a.localeCompare(b));
  const groups = new Map();
  for (const file of files) {
    const localeMatch = file.match(/^(.+)\.(en|th)\.md$/);
    if (localeMatch) {
      const slug = localeMatch[1];
      const locale = localeMatch[2];
      const { meta, body } = parseNoteFrontmatter(fs.readFileSync(path.join(notesDirectory, file), "utf8"));
      const group = groups.get(slug) ?? {};
      group[locale] = { body, meta, file };
      groups.set(slug, group);
    } else {
      const slug = file.replace(/\.md$/, "");
      const group = groups.get(slug) ?? {};
      group.legacy = { body: fs.readFileSync(path.join(notesDirectory, file), "utf8"), file };
      groups.set(slug, group);
    }
  }
  return [...groups.keys()].sort((a, b) => a.localeCompare(b)).map((slug, index) => {
    const group = groups.get(slug);
    const catalog = getNoteCatalogEntry(slug);
    const fallbackName = formatSlugName(slug);
    const enBody = group.en?.body;
    const thBody = group.th?.body;
    const legacyBody = group.legacy?.body;
    const bodyMarkdown = enBody ?? thBody ?? legacyBody ?? "";
    const titleEn = group.en?.meta.title?.trim() || (enBody ? extractFirstH1(enBody) : null) || fallbackName;
    const titleTh = group.th?.meta.title?.trim() || (thBody ? extractFirstH1(thBody) : null) || fallbackName;
    const excerptEn =
      group.en?.meta.excerpt?.trim() || (enBody ? noteDescription(enBody, titleEn) : null) || noteDescription(bodyMarkdown, titleEn);
    const excerptTh =
      group.th?.meta.excerpt?.trim() || (thBody ? noteDescription(thBody, titleTh) : null) || noteDescription(bodyMarkdown, titleTh);
    const bodyMarkdownByLocale = {};
    if (enBody?.trim()) bodyMarkdownByLocale.en = enBody;
    if (thBody?.trim()) bodyMarkdownByLocale.th = thBody;
    if (Object.keys(bodyMarkdownByLocale).length === 0 && catalog?.sourceLocale) {
      bodyMarkdownByLocale[catalog.sourceLocale] = bodyMarkdown;
    }
    const seoTitleEn = group.en?.meta.seo_title?.trim() || group.th?.meta.seo_title?.trim() || null;
    const seoTitleTh = group.th?.meta.seo_title?.trim() || group.en?.meta.seo_title?.trim() || null;
    const seoDescriptionEn = group.en?.meta.seo_description?.trim() || group.th?.meta.seo_description?.trim() || null;
    const seoDescriptionTh = group.th?.meta.seo_description?.trim() || group.en?.meta.seo_description?.trim() || null;
    return {
      id: slug,
      slug,
      title: catalog?.title || localized(titleEn, titleTh),
      bodyMarkdown,
      ...(Object.keys(bodyMarkdownByLocale).length > 0 ? { bodyMarkdownByLocale } : {}),
      excerpt: catalog?.excerpt || localized(excerptEn, excerptTh),
      // Explicit frontmatter orders sort first; notes without frontmatter sort after.
      order: group.en?.meta.order ?? group.th?.meta.order ?? 100 + index,
      rawName: group.en?.file ?? group.th?.file ?? group.legacy?.file ?? `${slug}.md`,
      seo: {
        title: catalog?.seo?.title || (seoTitleEn || seoTitleTh ? localized(seoTitleEn || "", seoTitleTh || "") : null),
        description: catalog?.seo?.description || (seoDescriptionEn || seoDescriptionTh ? localized(seoDescriptionEn || "", seoDescriptionTh || "") : null),
        keywords: catalog?.seo?.keywords || [],
      },
    };
  });
}

async function importDocument(tx, { id, contentType, slug, displayOrder, featured, payload, slugAliases = [] }) {
  const lookup = [{ id }];
  if (slug) {
    lookup.push({ contentType, slug });
    for (const alias of slugAliases) {
      if (alias) lookup.push({ contentType, slug: alias });
    }
  }

  const existing = await tx.contentDocument.findFirst({ where: { OR: lookup } });
  if (existing) return { status: "skipped", id: existing.id, requestedId: id };

  const document = await tx.contentDocument.create({
    data: {
      id,
      contentType,
      slug,
      displayOrder,
      featured,
      status: "PUBLISHED",
    },
  });
  const revision = await tx.contentRevision.create({
    data: {
      documentId: document.id,
      revisionNumber: 1,
      status: "PUBLISHED",
      payload,
      createdAt: revisionTime,
      publishedAt: revisionTime,
    },
  });
  await tx.contentDocument.update({
    where: { id: document.id },
    data: { publishedRevisionId: revision.id },
  });
  return { status: "imported", id };
}

async function main() {
  const target = await prisma.$queryRawUnsafe("SELECT current_database() AS database, current_schema() AS schema");
  const expectedDatabase = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));
  if (expectedDatabase && target[0]?.database !== expectedDatabase) throw new Error("Connected database verification failed");
  if (target[0]?.schema !== schema) throw new Error(`Connected schema verification failed for ${schema}`);

  const notePayloadList = notePayloads();
  const results = await prisma.$transaction(async (tx) => {
    const imported = [];
    imported.push(await importDocument(tx, {
      id: "profile",
      contentType: "PROFILE",
      slug: null,
      displayOrder: 0,
      featured: false,
      payload: profilePayload(),
    }));
    for (const [order, project] of projects.entries()) {
      imported.push(await importDocument(tx, {
        id: project.slug,
        contentType: "PROJECT",
        slug: project.slug,
        displayOrder: order,
        featured: Boolean(project.featured),
        payload: projectPayload(project, order),
      }));
    }
    for (const payload of notePayloadList) {
      imported.push(await importDocument(tx, {
        id: payload.id,
        contentType: "NOTE",
        slug: payload.slug,
        slugAliases: [legacyNoteSlug(payload.slug)].filter(Boolean),
        displayOrder: payload.order,
        featured: false,
        payload,
      }));
    }
    return imported;
  });

  const expectedNoteSlugs = notePayloadList.map((payload) => payload.slug);
  const publishedNotes = await prisma.contentDocument.findMany({
    where: {
      contentType: "NOTE",
      status: "PUBLISHED",
      publishedRevisionId: { not: null },
    },
    select: { slug: true },
  });
  const publishedCanonicalSlugs = new Set(
    publishedNotes
      .map((document) => canonicalNoteSlug(document.slug || ""))
      .filter(Boolean),
  );
  const missingPublishedNotes = expectedNoteSlugs.filter(
    (slug) => !publishedCanonicalSlugs.has(slug),
  );

  if (missingPublishedNotes.length) {
    throw new Error(
      `Baseline Note verification failed: ${missingPublishedNotes.join(", ")}`,
    );
  }

  console.log(JSON.stringify({
    schema,
    imported: results.filter((item) => item.status === "imported").length,
    skipped: results.filter((item) => item.status === "skipped").length,
    total: results.length,
    expectedPublishedNotes: expectedNoteSlugs.length,
    verifiedPublishedNotes: expectedNoteSlugs.length,
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Content import failed");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
