/* global process, URL, console */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { profile } from "../src/data/profile.js";
import { projects } from "../src/data/projects.js";

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
      name: localized(profile.name, profile.name),
      headline: localized(profile.headline, profile.headline),
      tagline: localized(profile.tagline, profile.tagline),
    },
    biography: localized(profile.about, profile.about_th),
    education: profile.education.map((value, index) => localized(value, profile.education_th[index])),
    contact: {
      location: localized(profile.contact.location, profile.contact.location),
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

function formatFileName(file) {
  return file
    .replace(/\.md$/, "")
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function noteDescription(markdown, name) {
  const plainText = markdown.replace(/```[\s\S]*?```/g, " ").replace(/[#*`_[\]()]/g, "").replace(/\s+/g, " ").trim();
  return plainText || `Developer notes and cheatsheet document for ${name}.`;
}

function notePayload(file, order) {
  const notesDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/data/notes");
  const name = formatFileName(file);
  const bodyMarkdown = fs.readFileSync(path.join(notesDirectory, file), "utf8");
  const description = noteDescription(bodyMarkdown, name);
  const slug = file.replace(/\.md$/, "");
  return {
    id: slug,
    slug,
    title: localized(name, name),
    bodyMarkdown,
    excerpt: localized(description, description),
    order,
    rawName: file,
    seo: { title: null, description: null },
  };
}

async function importDocument(tx, { id, contentType, slug, displayOrder, featured, payload }) {
  const existing = await tx.contentDocument.findUnique({ where: { id } });
  if (existing) return { status: "skipped", id };

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

  const notesDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/data/notes");
  const noteFiles = fs.readdirSync(notesDirectory).filter((file) => file.endsWith(".md")).sort((a, b) => a.localeCompare(b));
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
    for (const [order, file] of noteFiles.entries()) {
      imported.push(await importDocument(tx, {
        id: file.replace(/\.md$/, ""),
        contentType: "NOTE",
        slug: file.replace(/\.md$/, ""),
        displayOrder: order,
        featured: false,
        payload: notePayload(file, order),
      }));
    }
    return imported;
  });

  console.log(JSON.stringify({ schema, imported: results.filter((item) => item.status === "imported").length, skipped: results.filter((item) => item.status === "skipped").length, total: results.length }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Content import failed");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
