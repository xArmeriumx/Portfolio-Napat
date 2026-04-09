/**
 * Generate OG Pages + Sitemap — Post-build Script
 *
 * 1. สร้าง static HTML สำหรับแต่ละ project route เพื่อให้ social media crawlers
 *    (Facebook, LINE, Twitter) เห็น OG tags ที่ถูกต้อง
 *
 * 2. สร้าง sitemap.xml เพื่อให้ Google index ทุกหน้าได้เร็วขึ้น
 *
 * ทำงานหลัง `vite build` — อ่าน dist/index.html แล้ว clone + แก้ OG tags
 * สำหรับแต่ละ project แล้วบันทึกไปที่ dist/projects/{slug}/index.html
 *
 * Usage: node scripts/generate-og-pages.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const SITE_URL = "https://napatdev.com";

// ============================================================
// Project SEO Metadata
// ⚠️ ถ้าเพิ่ม/แก้ project ใน projects.js ให้มาอัพเดทที่นี่ด้วย
// ============================================================
const projects = [
  {
    slug: "shop-inventory-management",
    title: "Shop Inventory & Sales Management System",
    description:
      "A comprehensive Inventory and Sales Management System designed for multi-tenant usage. Built with Next.js 14 and TypeScript, featuring RBAC, real-time stock tracking, and a dedicated POS interface.",
    image: "/images/shop-inventory-1.png",
  },
  {
    slug: "jodbill-expense-tracker",
    title: "JodBill — Smart Expense Tracker",
    description:
      "A personal finance PWA — scan receipts with AI, track income & expenses, set budgets, and get AI-driven financial coaching. Mobile-first app with native-like UX.",
    image: "/images/jodbill-1.png",
  },
  {
    slug: "clean-water-monitoring",
    title: "Clean Water Monitoring",
    description:
      "Real-time water quality monitoring system with IoT sensors, React dashboard, and LINE LIFF authentication. Built with Node.js/Express and Firebase.",
    image: "/images/p1-clean-water.jpg",
  },
  {
    slug: "automate-test-pipeline",
    title: "Automated Testing for Clean Water Monitoring",
    description:
      "Comprehensive automated testing suite covering API, UI, and E2E flows using Playwright. Includes custom test pipeline scripts and Google Sheets integration.",
    image: "/images/p5-testcase2.png",
  },
  {
    slug: "stock-management-system",
    title: "Stock Management System",
    description:
      "A comprehensive inventory management system designed for restaurants and food service businesses. Features product categorization, expiration tracking, and purchase order management.",
    image: "/images/p2-stock-management.jpg",
  },
  {
    slug: "pharmacy-store",
    title: "Pharmacy Store",
    description:
      "An e-commerce pharmacy system for selling medicines and health supplements online. Features product catalog, shopping cart, order processing, and admin dashboard.",
    image: "/images/p3-phamacy.png",
  },
  {
    slug: "uat-testkit",
    title: "UAT / Test Case & Bug Report Template",
    description:
      "Template set for UAT, test case design, and bug reporting used in real projects to improve communication between dev, tester, and business.",
    image: "/images/p4-testcase.png",
  },
];

// ============================================================
// Static Pages (นอกเหนือจาก projects)
// ============================================================
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/projects", priority: "0.9", changefreq: "weekly" },
  { path: "/notes", priority: "0.8", changefreq: "weekly" },
];

let generatedNotesSlugs = [];

// ============================================================
// Main
// ============================================================
function main() {
  // Read base HTML from build output
  const indexPath = path.join(distDir, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.error("❌ dist/index.html not found. Run `vite build` first.");
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexPath, "utf-8");

  // 1) Generate OG pages
  generateOgPages(baseHtml);

  // 2) Generate sitemap.xml
  generateSitemap();
}

// ============================================================
// 1) OG Pages
// ============================================================
function generateOgPages(baseHtml) {
  console.log("\n🔧 Generating OG pages for social media previews...\n");

  let generated = 0;

  for (const project of projects) {
    const projectDir = path.join(distDir, "projects", project.slug);
    fs.mkdirSync(projectDir, { recursive: true });

    const ogUrl = `${SITE_URL}/projects/${project.slug}`;
    const ogImage = `${SITE_URL}${project.image}`;
    const fullTitle = `${project.title} | Napat Pamornsut`;
    const safeDesc = escapeHtml(project.description);

    let html = baseHtml;

    // ---- Replace <title> ----
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${escapeHtml(fullTitle)}</title>`,
    );

    // ---- Replace meta name="title" ----
    html = replaceMetaName(html, "title", fullTitle);

    // ---- Replace meta name="description" ----
    html = replaceMetaName(html, "description", safeDesc);

    // ---- Replace Open Graph tags ----
    html = replaceMetaProperty(html, "og:title", fullTitle);
    html = replaceMetaProperty(html, "og:description", safeDesc);
    html = replaceMetaProperty(html, "og:url", ogUrl);
    html = replaceMetaProperty(html, "og:image", ogImage);
    html = replaceMetaProperty(html, "og:type", "article");

    // ---- Replace Twitter tags ----
    html = replaceMetaName(html, "twitter:title", fullTitle);
    html = replaceMetaName(html, "twitter:description", safeDesc);
    html = replaceMetaName(html, "twitter:url", ogUrl);
    html = replaceMetaName(html, "twitter:image", ogImage);

    // ---- Replace canonical URL ----
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${ogUrl}" />`,
    );

    // ---- Add og:image dimensions (for better preview) ----
    if (!html.includes("og:image:width")) {
      html = html.replace(
        "</head>",
        `    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n  </head>`,
      );
    }

    // ---- Inject dynamic JSON-LD Schema for SoftwareApplication ----
    const projectSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": project.title,
      "description": project.description,
      "image": ogImage,
      "applicationCategory": "WebApplication",
      "author": {
        "@type": "Person",
        "name": "Napat Pamornsut"
      }
    };
    
    const projectSchemaHtml = `    <!-- Dynamic JSON-LD Structured Data - SoftwareApplication -->\n    <script type="application/ld+json">\n      ${JSON.stringify(projectSchema, null, 2).replace(/\n/g, '\n      ')}\n    </script>\n  </head>`;
    html = html.replace("</head>", projectSchemaHtml);

    // Write the file
    fs.writeFileSync(path.join(projectDir, "index.html"), html, "utf-8");
    console.log(`  ✅ projects/${project.slug}/index.html`);
    generated++;
  }



  // ---- Generate OG for /notes ----
  const notesDir = path.join(distDir, "notes");
  fs.mkdirSync(notesDir, { recursive: true });

  const notesUrl = `${SITE_URL}/notes`;
  const notesTitle = `Summary Notes | Napat Pamornsut`;
  const notesDesc = `Personal knowledge base, summary notes, and technical cheatsheets.`;

  let notesHtml = baseHtml;
  notesHtml = notesHtml.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(notesTitle)}</title>`);
  notesHtml = replaceMetaName(notesHtml, "title", notesTitle);
  notesHtml = replaceMetaName(notesHtml, "description", escapeHtml(notesDesc));
  notesHtml = replaceMetaProperty(notesHtml, "og:title", notesTitle);
  notesHtml = replaceMetaProperty(notesHtml, "og:description", escapeHtml(notesDesc));
  notesHtml = replaceMetaProperty(notesHtml, "og:url", notesUrl);
  // Keep the default og:image from baseHtml or set a specific one if needed
  fs.writeFileSync(path.join(notesDir, "index.html"), notesHtml, "utf-8");
  console.log(`  ✅ notes/index.html`);
  generated++;

  // ---- Generate OG for individual Notes ----
  const notesSrcDir = path.resolve(__dirname, "../src/data/notes");
  if (fs.existsSync(notesSrcDir)) {
    const files = fs.readdirSync(notesSrcDir).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const filename = file.replace('.md', '');
      const noteDir = path.join(distDir, "notes", filename);
      fs.mkdirSync(noteDir, { recursive: true });

      const content = fs.readFileSync(path.join(notesSrcDir, file), "utf-8");
      
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const rawName = filename.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const pageTitle = titleMatch ? titleMatch[1].replace(/[*`_]/g, '') : rawName;
      const fullTitle = `${pageTitle} - Cheatsheet | Napat Pamornsut`;

      const plainText = content.replace(/[#*`_\[\]()]/g, '').replace(/(\r\n|\n|\r)/gm, ' ').trim();
      const descMatch = plainText.match(/.*?[a-zA-Zก-๙]{10,}.*?(?=\s|$)/); 
      const safeDesc = escapeHtml(descMatch ? plainText.substring(0, 160) + '...' : `Cheatsheet document for ${pageTitle}`);

      const ogUrl = `${SITE_URL}/notes/${filename}`;

      let html = baseHtml;
      html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`);
      html = replaceMetaName(html, "title", fullTitle);
      html = replaceMetaName(html, "description", safeDesc);
      html = replaceMetaProperty(html, "og:title", fullTitle);
      html = replaceMetaProperty(html, "og:description", safeDesc);
      html = replaceMetaProperty(html, "og:url", ogUrl);

      // ---- Inject dynamic JSON-LD Schema for TechArticle ----
      const noteSchema = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": pageTitle,
        "description": safeDesc,
        "image": `${SITE_URL}/favicon.png`,
        "author": {
          "@type": "Person",
          "name": "Napat Pamornsut"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Napatdev",
          "logo": {
            "@type": "ImageObject",
            "url": "https://napatdev.com/favicon.png"
          }
        }
      };
      
      const noteSchemaHtml = `    <!-- Dynamic JSON-LD Structured Data - TechArticle -->\n    <script type="application/ld+json">\n      ${JSON.stringify(noteSchema, null, 2).replace(/\n/g, '\n      ')}\n    </script>\n  </head>`;
      html = html.replace("</head>", noteSchemaHtml);
      
      fs.writeFileSync(path.join(noteDir, "index.html"), html, "utf-8");
      console.log(`  ✅ notes/${filename}/index.html`);
      generated++;

      generatedNotesSlugs.push(filename);
    }
  }

  console.log(`\n🎉 Generated ${generated} static OG pages.`);
}

// ============================================================
// 2) Sitemap
// ============================================================
function generateSitemap() {
  console.log("\n🗺️  Generating sitemap.xml...\n");

  // Use build date as lastmod
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  let urls = "";

  // Static pages
  for (const page of staticPages) {
    urls += `
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  // Project pages
  for (const project of projects) {
    urls += `
  <url>
    <loc>${SITE_URL}/projects/${project.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Individual Note pages
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

  // Count total URLs
  const totalUrls = staticPages.length + projects.length;
  console.log(`\n🎉 Sitemap generated with ${totalUrls} URLs.\n`);
}

// ============================================================
// Helpers
// ============================================================

/**
 * Replace <meta name="X" content="...">
 */
function replaceMetaName(html, name, content) {
  const regex = new RegExp(
    `(<meta\\s+name="${name}"\\s+content=")[^"]*("\\s*\\/?>)`,
    "i",
  );
  if (regex.test(html)) {
    return html.replace(regex, `$1${escapeHtml(content)}$2`);
  }
  // If not found, insert before </head>
  return html.replace(
    "</head>",
    `    <meta name="${name}" content="${escapeHtml(content)}" />\n  </head>`,
  );
}

/**
 * Replace <meta property="X" content="...">
 */
function replaceMetaProperty(html, property, content) {
  const regex = new RegExp(
    `(<meta\\s+property="${property}"\\s+content=")[^"]*("\\s*\\/?>)`,
    "i",
  );
  if (regex.test(html)) {
    return html.replace(regex, `$1${escapeHtml(content)}$2`);
  }
  // If not found, insert before </head>
  return html.replace(
    "</head>",
    `    <meta property="${property}" content="${escapeHtml(content)}" />\n  </head>`,
  );
}

/**
 * Escape HTML special characters for use in attributes
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Run
main();
