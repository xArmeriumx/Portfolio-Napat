/**
 * Generate OG Pages + Sitemap — Post-build Script
 *
 * 1. สร้าง static HTML สำหรับ crawlers (Google, Facebook, LINE, Twitter)
 *    ให้เห็น title, description, og:image ที่ถูกต้องต่อหน้า
 *
 * 2. สร้าง sitemap.xml พร้อม image tags สำหรับ Google Image Search
 *
 * Usage: node scripts/generate-og-pages.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { projects } from "../src/data/projects.js";
import {
  SITE_URL,
  SEO_DEFAULTS,
  getAboutPageSchema,
  getAboutSeoMeta,
  getProjectSchema,
  getProjectsListSeoMeta,
  getProjectsCollectionSchema,
  normalizeMetaDescription,
  toAbsoluteImageUrl,
} from "../src/config/seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  {
    path: "/about",
    priority: "0.85",
    changefreq: "monthly",
    image: () => toAbsoluteImageUrl(getAboutSeoMeta().ogImage),
    imageTitle: () => getAboutSeoMeta().title,
  },
  {
    path: "/projects",
    priority: "0.9",
    changefreq: "weekly",
    image: () => toAbsoluteImageUrl(getProjectsListSeoMeta().ogImage),
    imageTitle: () => getProjectsListSeoMeta().title,
  },
  { path: "/notes", priority: "0.8", changefreq: "weekly" },
];

let generatedNotesSlugs = [];

function main() {
  const indexPath = path.join(distDir, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.error("❌ dist/index.html not found. Run `vite build` first.");
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexPath, "utf-8");
  generateOgPages(baseHtml);
  generateSitemap();
}

function generateOgPages(baseHtml) {
  console.log("\n🔧 Generating OG pages for search & social previews...\n");

  let generated = 0;

  for (const project of projects) {
    const image = project.images?.[0] || project.image;
    const description = normalizeMetaDescription(project.description, 300);
    const title = project.title;
    const ogTitle = `${title} | Napat Pamornsut`;
    const pageTitle = `${title} | Projects — Napat Pamornsut`;
    const ogImage = toAbsoluteImageUrl(image);
    const ogUrl = `${SITE_URL}/projects/${project.slug}`;
    const keywords = [
      title,
      "Napat Pamornsut",
      "ณภัทร ภมรสูตร",
      ...(project.technologies || []),
      ...(project.role || []),
    ].join(", ");

    const html = applyPageMeta(baseHtml, {
      title: pageTitle,
      description,
      ogTitle,
      ogDescription: normalizeMetaDescription(
        `${description}${project.technologies?.length ? ` Tech: ${project.technologies.slice(0, 6).join(", ")}.` : ""}`,
        200,
      ),
      url: ogUrl,
      image: ogImage,
      imageAlt: `${title} — portfolio project by Napat Pamornsut`,
      imageWidth: 1200,
      imageHeight: 630,
      type: "article",
      keywords,
      schema: getProjectSchema({
        slug: project.slug,
        title,
        description: project.description,
        image,
        technologies: project.technologies,
        links: project.links,
      }),
    });

    const projectDir = path.join(distDir, "projects", project.slug);
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, "index.html"), html, "utf-8");
    console.log(`  ✅ projects/${project.slug}/index.html`);
    generated++;
  }

  const listSeo = getProjectsListSeoMeta();
  const projectsListHtml = applyPageMeta(baseHtml, {
    title: listSeo.title,
    description: listSeo.description,
    ogTitle: listSeo.title,
    ogDescription: listSeo.description,
    url: `${SITE_URL}/projects`,
    image: toAbsoluteImageUrl(listSeo.ogImage),
    imageAlt: listSeo.ogImageAlt,
    imageWidth: 1200,
    imageHeight: 630,
    type: "website",
    keywords:
      "Napat Pamornsut, ณภัทร ภมรสูตร, Projects, Portfolio, Web Developer",
    schema: getProjectsCollectionSchema(
      projects.map((p) => ({ slug: p.slug, name: p.title })),
    ),
  });
  fs.mkdirSync(path.join(distDir, "projects"), { recursive: true });
  fs.writeFileSync(path.join(distDir, "projects", "index.html"), projectsListHtml, "utf-8");
  console.log("  ✅ projects/index.html");
  generated++;

  const aboutSeo = getAboutSeoMeta();
  const aboutHtml = applyPageMeta(baseHtml, {
    title: aboutSeo.title,
    description: aboutSeo.description,
    ogTitle: aboutSeo.title,
    ogDescription: aboutSeo.description,
    url: `${SITE_URL}/about`,
    image: toAbsoluteImageUrl(aboutSeo.ogImage),
    imageAlt: aboutSeo.ogImageAlt,
    imageWidth: 512,
    imageHeight: 512,
    type: "profile",
    keywords: aboutSeo.keywords,
    schema: getAboutPageSchema(),
  });
  fs.mkdirSync(path.join(distDir, "about"), { recursive: true });
  fs.writeFileSync(path.join(aboutDirPath(), "index.html"), aboutHtml, "utf-8");
  console.log("  ✅ about/index.html");
  generated++;

  generated += generateNotesOgPages(baseHtml);

  console.log(`\n🎉 Generated ${generated} static OG pages.`);
}

function aboutDirPath() {
  return path.join(distDir, "about");
}

function generateNotesOgPages(baseHtml) {
  let generated = 0;
  const notesDir = path.join(distDir, "notes");
  fs.mkdirSync(notesDir, { recursive: true });

  const notesUrl = `${SITE_URL}/notes`;
  const notesTitle = "Summary Notes | Napat Pamornsut";
  const notesDesc =
    "Personal knowledge base, summary notes, and technical cheatsheets.";

  const notesHtml = applyPageMeta(baseHtml, {
    title: notesTitle,
    description: notesDesc,
    ogTitle: notesTitle,
    ogDescription: notesDesc,
    url: notesUrl,
    image: SEO_DEFAULTS.ogImage,
    imageAlt: "Napat Pamornsut technical notes",
    imageWidth: 512,
    imageHeight: 512,
    type: "website",
  });
  fs.writeFileSync(path.join(notesDir, "index.html"), notesHtml, "utf-8");
  console.log("  ✅ notes/index.html");
  generated++;

  const notesSrcDir = path.resolve(__dirname, "../src/data/notes");
  if (!fs.existsSync(notesSrcDir)) return generated;

  const files = fs.readdirSync(notesSrcDir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const filename = file.replace(".md", "");
    const noteDir = path.join(distDir, "notes", filename);
    fs.mkdirSync(noteDir, { recursive: true });

    const content = fs.readFileSync(path.join(notesSrcDir, file), "utf-8");
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const rawName = filename
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const pageTitle = titleMatch
      ? titleMatch[1].replace(/[*`_]/g, "")
      : rawName;
    const fullTitle = `${pageTitle} - Cheatsheet | Napat Pamornsut`;

    const plainText = content
      .replace(/[#*`_\[\]()]/g, "")
      .replace(/(\r\n|\n|\r)/gm, " ")
      .trim();
    const safeDesc = normalizeMetaDescription(
      plainText || `Cheatsheet document for ${pageTitle}`,
      160,
    );

    const ogUrl = `${SITE_URL}/notes/${filename}`;
    const noteSchema = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: pageTitle,
      description: safeDesc,
      url: ogUrl,
      image: SEO_DEFAULTS.ogImage,
      author: { "@type": "Person", name: "Napat Pamornsut" },
      publisher: {
        "@type": "Organization",
        name: "Napatdev",
        logo: {
          "@type": "ImageObject",
          url: SEO_DEFAULTS.ogImage,
        },
      },
    };

    const html = applyPageMeta(baseHtml, {
      title: fullTitle,
      description: safeDesc,
      ogTitle: fullTitle,
      ogDescription: safeDesc,
      url: ogUrl,
      image: SEO_DEFAULTS.ogImage,
      imageAlt: `${pageTitle} cheatsheet`,
      imageWidth: 512,
      imageHeight: 512,
      type: "article",
      schema: noteSchema,
    });

    fs.writeFileSync(path.join(noteDir, "index.html"), html, "utf-8");
    console.log(`  ✅ notes/${filename}/index.html`);
    generated++;
    generatedNotesSlugs.push(filename);
  }

  return generated;
}

function applyPageMeta(
  baseHtml,
  {
    title,
    description,
    ogTitle,
    ogDescription,
    url,
    image,
    imageAlt,
    imageWidth = 1200,
    imageHeight = 630,
    type = "website",
    keywords,
    schema,
  },
) {
  let html = baseHtml;

  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceMetaName(html, "title", title);
  html = replaceMetaName(html, "description", description);
  if (keywords) html = replaceMetaName(html, "keywords", keywords);

  html = replaceMetaProperty(html, "og:type", type);
  html = replaceMetaProperty(html, "og:title", ogTitle || title);
  html = replaceMetaProperty(html, "og:description", ogDescription || description);
  html = replaceMetaProperty(html, "og:url", url);
  html = replaceMetaProperty(html, "og:image", image);
  html = replaceOrInsertMetaProperty(html, "og:image:secure_url", image);
  html = replaceOrInsertMetaProperty(html, "og:image:alt", imageAlt || title);
  html = replaceOrInsertMetaProperty(html, "og:image:width", String(imageWidth));
  html = replaceOrInsertMetaProperty(html, "og:image:height", String(imageHeight));

  html = replaceMetaName(html, "twitter:card", "summary_large_image");
  html = replaceOrInsertMetaName(html, "twitter:title", ogTitle || title);
  html = replaceOrInsertMetaName(html, "twitter:description", ogDescription || description);
  html = replaceOrInsertMetaName(html, "twitter:url", url);
  html = replaceOrInsertMetaName(html, "twitter:image", image);
  html = replaceOrInsertMetaName(html, "twitter:image:alt", imageAlt || title);

  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  );

  if (schema) {
    const schemaHtml = `    <!-- Page-specific JSON-LD -->\n    <script type="application/ld+json">\n      ${JSON.stringify(schema, null, 2).replace(/\n/g, "\n      ")}\n    </script>\n  </head>`;
    html = html.replace("</head>", schemaHtml);
  }

  return html;
}

function generateSitemap() {
  console.log("\n🗺️  Generating sitemap.xml...\n");

  const today = new Date().toISOString().split("T")[0];
  let urls = "";

  for (const page of staticPages) {
    const imageBlock =
      page.image && page.imageTitle
        ? `
    <image:image>
      <image:loc>${page.image()}</image:loc>
      <image:title>${escapeXml(page.imageTitle())}</image:title>
    </image:image>`
        : "";

    urls += `
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageBlock}
  </url>`;
  }

  for (const project of projects) {
    const projectUrl = `${SITE_URL}/projects/${project.slug}`;
    const ogImage = toAbsoluteImageUrl(project.images?.[0] || project.image);
    urls += `
  <url>
    <loc>${projectUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${ogImage}</image:loc>
      <image:title>${escapeXml(project.title)}</image:title>
    </image:image>
  </url>`;
  }

  for (const slug of generatedNotesSlugs) {
    urls += `
  <url>
    <loc>${SITE_URL}/notes/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}
</urlset>
`;

  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap, "utf-8");
  console.log("  ✅ sitemap.xml");

  const totalUrls =
    staticPages.length + projects.length + generatedNotesSlugs.length;
  console.log(`\n🎉 Sitemap generated with ${totalUrls} URLs.\n`);
}

function replaceMetaName(html, name, content) {
  const regex = new RegExp(
    `(<meta\\s+name="${name}"\\s+content=")[^"]*("\\s*\\/?>)`,
    "i",
  );
  if (regex.test(html)) {
    return html.replace(regex, `$1${escapeHtml(content)}$2`);
  }
  return html.replace(
    "</head>",
    `    <meta name="${name}" content="${escapeHtml(content)}" />\n  </head>`,
  );
}

function replaceOrInsertMetaName(html, name, content) {
  const regex = new RegExp(
    `(<meta\\s+name="${name}"\\s+content=")[^"]*("\\s*\\/?>)`,
    "i",
  );
  if (regex.test(html)) {
    return html.replace(regex, `$1${escapeHtml(content)}$2`);
  }
  return html.replace(
    "</head>",
    `    <meta name="${name}" content="${escapeHtml(content)}" />\n  </head>`,
  );
}

function replaceMetaProperty(html, property, content) {
  const regex = new RegExp(
    `(<meta\\s+property="${property}"\\s+content=")[^"]*("\\s*\\/?>)`,
    "i",
  );
  if (regex.test(html)) {
    return html.replace(regex, `$1${escapeHtml(content)}$2`);
  }
  return html.replace(
    "</head>",
    `    <meta property="${property}" content="${escapeHtml(content)}" />\n  </head>`,
  );
}

function replaceOrInsertMetaProperty(html, property, content) {
  const regex = new RegExp(
    `(<meta\\s+property="${property}"\\s+content=")[^"]*("\\s*\\/?>)`,
    "i",
  );
  if (regex.test(html)) {
    return html.replace(regex, `$1${escapeHtml(content)}$2`);
  }
  return html.replace(
    "</head>",
    `    <meta property="${property}" content="${escapeHtml(content)}" />\n  </head>`,
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

main();
