# Napat Pamornsut - Portfolio

Personal portfolio website showcasing my projects, skills, and professional experience as a Web Developer and Software Tester. Bilingual (English / Thai) and backed by a built-in CMS for content management.

## Live Demo

**Production URL:** [https://napatdev.com](https://napatdev.com)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript + JavaScript (JSX views) |
| Styling | Tailwind CSS 4 |
| Content | Dual-adapter content repository: static data files (dev) or Supabase Postgres via Prisma (production) |
| Auth | Better Auth (admin login) |
| Testing | Vitest (unit), Playwright (E2E) |
| Deployment | Vercel |

---

## Project Structure

```
app/                    # Next.js App Router routes, metadata, API handlers
├── api/og/             # Dynamic OG image generation (next/og + Prompt font)
├── admin/              # CMS backoffice (noindex)
├── preview/            # Token-guarded draft previews (noindex)
├── layout.tsx          # Root metadata (metadataBase, OG, templates)
├── sitemap.ts          # Dynamic sitemap.xml with content-driven lastModified
└── robots.ts           # robots.txt (disallows /api, /admin, /preview)

src/
├── config/seo.js       # Site-wide SEO defaults, per-page meta, JSON-LD schemas
├── lib/metadata.ts     # buildPageMetadata() + /api/og URL builder
├── content/            # Content repository, Zod schemas, static/database adapters
├── data/               # Static content baseline (profile, projects, markdown notes)
├── views/              # Page-level JSX views
└── components/         # UI components
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm

### Installation

```bash
git clone https://github.com/xArmeriumx/Portfolio-Napat.git
cd Portfolio-Napat
npm install
npm run prisma:generate
npm run dev
```

By default the app serves content from the static adapter (`CONTENT_STORAGE=static`). Production requires `CONTENT_STORAGE=database` with a `DATABASE_URL` pointing at the Supabase Postgres schema — see `docs/ops/portfolio-cms-operations.md` and `PORTFOLIO_CMS_HANDOVER.md`.

### Available Scripts

```bash
npm run dev        # Development server
npm run build      # Production build (runs prisma generate first via vercel.json)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest unit tests
npm run test:e2e   # Playwright E2E (public smoke without CMS env vars)
```

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero and profile introduction |
| `/about` | About | Bio, education, skills |
| `/projects` | Projects | Project case study list |
| `/projects/:slug` | Project Detail | Individual case study with gallery |
| `/notes` | Developer Notes | Technical notes and cheatsheets |
| `/notes/:slug` | Note Detail | Markdown note reader |
| `/contact` | Contact | Contact channels |
| `/search` | Search | Crawlable site index (noindex when `?q=` present) |
| `/admin` | CMS | Better Auth-guarded backoffice (noindex) |
| `/preview/*` | Draft previews | Token-guarded, noindex |

---

## SEO

- **Metadata** — every page exports `generateMetadata` built through `buildPageMetadata()` (`src/lib/metadata.ts`): canonical URLs, Open Graph, Twitter cards, robots directives, geo tags.
- **Social images** — `/api/og` renders branded 1200×630 cards per page via `next/og` with the Prompt font (Thai supported). Real content images (CMS `seo.image`, project screenshots) take precedence over generated cards.
- **Structured data** — JSON-LD `@graph` per page (Person, Organization, WebSite, ProfilePage, CollectionPage, SoftwareApplication, TechArticle, ContactPage, BreadcrumbList) from `src/config/seo.js` and `src/lib/notes.ts`.
- **Crawlers** — dynamic `sitemap.xml` (with `lastModified` from published revisions) and `robots.txt` that disallows `/api/`, `/admin`, and `/preview`.
- **CMS overrides** — every profile/project/note document carries optional `seo.title/description(/image)` fields that flow straight into metadata and JSON-LD.

---

## Deployment

1. Connect the GitHub repository to Vercel
2. Set production env vars (`DATABASE_URL`, `CONTENT_STORAGE=database`, Better Auth secrets, Supabase storage keys)
3. Auto-deploys on push to `main` via the CI/CD workflow (`.github/workflows/deploy.yml`)

---

## License

MIT License

---

## Author

**Napat Pamornsut (ณภัทร ภมรสูตร)**
- GitHub: [@xArmeriumx](https://github.com/xArmeriumx)
- Website: [napatdev.com](https://napatdev.com)
