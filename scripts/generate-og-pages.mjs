/**
 * Generate OG Pages — Post-build Script
 *
 * สร้าง static HTML สำหรับแต่ละ project route เพื่อให้ social media crawlers
 * (Facebook, LINE, Twitter) เห็น OG tags ที่ถูกต้อง
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

    // Write the file
    fs.writeFileSync(path.join(projectDir, "index.html"), html, "utf-8");
    console.log(`  ✅ projects/${project.slug}/index.html`);
    generated++;
  }

  console.log(`\n🎉 Done! Generated ${generated} OG pages.\n`);
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
