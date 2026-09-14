import { describe, expect, it } from "vitest";
import { StaticContentRepository, parseNoteFrontmatter } from "./static-adapter";
import { noteDraftSchema } from "./input-schema";
import { getNoteLocales, toPresentationNote } from "./presentation";
import { buildSitemap } from "@/lib/sitemap";
import { buildPageMetadata } from "@/lib/metadata";
import { NOTE_TOPICS, getTopicHub } from "@/lib/related";

const NEW_SLUGS = [
  "odoo-automated-action-store-attr",
  "odoo-automated-action-import-name",
  "odoo-qweb-report-page-break",
  "odoo-qweb-table-border",
  "odoo-19-certification-guide",
  "playwright-thai-guide",
  "playwright-page-object-model",
  "nextjs-server-actions",
  "nextjs-server-actions-security",
  "nextjs-prisma-transaction",
];

describe("low-competition SEO clusters", () => {
  it("parses paired locale files with frontmatter", () => {
    const { meta, body } = parseNoteFrontmatter('---\ntitle: "T"\norder: 10\n---\n\n# Hello\n');
    expect(meta).toMatchObject({ title: "T", order: 10 });
    expect(body.trim()).toBe("# Hello");
    expect(parseNoteFrontmatter("# No frontmatter\n").body).toContain("# No frontmatter");
  });

  it("publishes all ten P0 slugs as bilingual notes", async () => {
    const repository = new StaticContentRepository();
    const notes = await repository.listPublishedNotes();
    const bySlug = new Map(notes.map((note) => [note.slug, note]));
    for (const slug of NEW_SLUGS) {
      const note = bySlug.get(slug);
      expect(note, `missing note ${slug}`).toBeDefined();
      expect(getNoteLocales(note!)).toEqual(["en", "th"]);
      expect(noteDraftSchema.safeParse(note).success).toBe(true);
    }
  });

  it("reserves the odoo topic slug in the CMS editor", () => {
    const note = {
      slug: "odoo",
      title: { en: "x", th: "x" },
      bodyMarkdown: "# x",
      excerpt: { en: "x", th: "x" },
      order: 0,
      rawName: "odoo.md",
      seo: { title: null, description: null },
    };
    expect(noteDraftSchema.safeParse(note).success).toBe(false);
  });

  it("fills the odoo, testing and nextjs hubs in both locales", async () => {
    const repository = new StaticContentRepository();
    const rawNotes = await repository.listPublishedNotes();
    for (const locale of ["en", "th"] as const) {
      const presented = rawNotes.map((note) => toPresentationNote(note, locale));
      expect(getTopicHub("odoo", presented).length).toBeGreaterThanOrEqual(5);
      expect(getTopicHub("testing", presented).map((note) => note.slug)).toEqual(
        expect.arrayContaining(["playwright-thai-guide", "playwright-page-object-model"]),
      );
      expect(getTopicHub("nextjs", presented).map((note) => note.slug)).toEqual(
        expect.arrayContaining(["nextjs-server-actions", "nextjs-server-actions-security", "nextjs-prisma-transaction"]),
      );
    }
    expect(Object.keys(NOTE_TOPICS)).toContain("odoo");
  });

  it("emits reciprocal sitemap entries and indexable metadata for the new clusters", async () => {
    const repository = new StaticContentRepository();
    const sitemap = await buildSitemap(repository);
    for (const slug of NEW_SLUGS) {
      const en = sitemap.find((entry) => entry.url === `https://napatdev.com/notes/${slug}`);
      const th = sitemap.find((entry) => entry.url === `https://napatdev.com/th/notes/${slug}`);
      expect(en, `missing sitemap en ${slug}`).toBeDefined();
      expect(th, `missing sitemap th ${slug}`).toBeDefined();
      expect(en!.alternates).toEqual(th!.alternates);
    }
    expect(sitemap.some((entry) => entry.url === "https://napatdev.com/notes/odoo")).toBe(true);
    expect(sitemap.some((entry) => entry.url === "https://napatdev.com/th/notes/odoo")).toBe(true);

    const rawNotes = await repository.listPublishedNotes();
    const raw = rawNotes.find((note) => note.slug === "playwright-thai-guide")!;
    for (const locale of ["en", "th"] as const) {
      const note = toPresentationNote(raw, locale);
      expect(note.isFallback).toBe(false);
      const metadata = buildPageMetadata({
        title: note.displayTitle,
        description: "test",
        path: `${locale === "th" ? "/th" : ""}/notes/${note.slug}`,
        availableLocales: note.availableLocales,
        locale,
      });
      expect(metadata.robots).toMatchObject({ index: true });
      expect(metadata.alternates).toBeDefined();
    }
  });
});
