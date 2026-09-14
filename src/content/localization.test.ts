import { describe, expect, it } from "vitest";
import { noteDraftSchema } from "./input-schema";
import { StaticContentRepository } from "./static-adapter";
import { getNoteLocales, toPresentationNote } from "./presentation";
import { buildSitemap } from "@/lib/sitemap";
import { buildPageMetadata } from "@/lib/metadata";

describe("published note language contract", () => {
  it("indexes the declared source locale without falsely claiming a translation", async () => {
    const repository = new StaticContentRepository();
    const note = (await repository.listPublishedNotes()).find(
      (item) => item.slug === "sql-query-examples",
    );

    expect(note).toBeDefined();
    expect(noteDraftSchema.safeParse(note).success).toBe(true);
    expect(getNoteLocales(note!)).toEqual(["th"]);

    expect(toPresentationNote(note!, "th")).toMatchObject({
      content: note!.bodyMarkdown,
      contentLocale: "th",
      isFallback: false,
    });
    expect(toPresentationNote(note!, "en")).toMatchObject({
      content: note!.bodyMarkdown,
      contentLocale: "th",
      isFallback: true,
    });
  });

  it("emits indexable Thai metadata and noindex English metadata for Thai-only notes", async () => {
    const repository = new StaticContentRepository();
    const note = (await repository.listPublishedNotes()).find(
      (item) => item.slug === "playwright-thai-guide",
    )!;

    const th = buildPageMetadata({
      title: note.title.th,
      description: note.excerpt.th,
      path: `/th/notes/${note.slug}`,
      availableLocales: getNoteLocales(note),
      locale: "th",
    });
    const en = buildPageMetadata({
      title: note.title.en,
      description: note.excerpt.en,
      path: `/notes/${note.slug}`,
      availableLocales: getNoteLocales(note),
      locale: "en",
    });

    expect(th.robots).toMatchObject({ index: true, follow: true });
    expect(th.alternates?.canonical).toBe(
      "https://napatdev.com/th/notes/playwright-thai-guide",
    );
    expect(th.alternates?.languages).toEqual({
      th: "https://napatdev.com/th/notes/playwright-thai-guide",
      "x-default": "https://napatdev.com/th/notes/playwright-thai-guide",
    });
    expect(en.robots).toMatchObject({ index: false, follow: false });
    expect(en.alternates).toBeUndefined();
  });

  it("resolves explicit bilingual content and marks neither locale as fallback", async () => {
    const base = (await new StaticContentRepository().listPublishedNotes())[0];
    const note = {
      ...base,
      title: { en: "Test", th: "ทดสอบ" },
      bodyMarkdownByLocale: {
        en: "# Test\n\nEnglish content",
        th: "# ทดสอบ\n\nเนื้อหาไทย",
      },
    };

    expect(toPresentationNote(note, "th")).toMatchObject({
      displayTitle: "ทดสอบ",
      contentLocale: "th",
      isFallback: false,
    });
    expect(toPresentationNote(note, "en")).toMatchObject({
      displayTitle: "Test",
      contentLocale: "en",
      isFallback: false,
    });
  });

  it("validates unsafe Markdown in either translation without losing the legacy body", async () => {
    const note = (await new StaticContentRepository().listPublishedNotes())[0];

    for (const locale of ["en", "th"] as const) {
      expect(
        noteDraftSchema.safeParse({
          ...note,
          bodyMarkdownByLocale: {
            [locale]: "[run](javascript:alert(1))",
          },
        }).success,
      ).toBe(false);
    }

    const parsed = noteDraftSchema.parse({
      ...note,
      bodyMarkdownByLocale: { en: "# Test" },
    });
    expect(parsed.bodyMarkdownByLocale?.en).toBe("# Test");
    expect(parsed.bodyMarkdown).toBe(note.bodyMarkdown);
  });

  it("includes every indexable Thai SEO note and populated topic hub in the sitemap", async () => {
    const repository = new StaticContentRepository();
    const notes = await repository.listPublishedNotes();
    const sitemap = await buildSitemap(repository);

    for (const note of notes) {
      if (!getNoteLocales(note).includes("th")) continue;

      expect(
        sitemap.some(
          (entry) =>
            entry.url === `https://napatdev.com/th/notes/${note.slug}`,
        ),
      ).toBe(true);

      if (!getNoteLocales(note).includes("en")) {
        expect(
          sitemap.some(
            (entry) =>
              entry.url === `https://napatdev.com/notes/${note.slug}`,
          ),
        ).toBe(false);
      }
    }

    expect(
      sitemap.some((entry) => entry.url === "https://napatdev.com/th/notes"),
    ).toBe(true);
    expect(
      sitemap.some((entry) => entry.url === "https://napatdev.com/notes"),
    ).toBe(false);

    for (const topic of ["odoo", "testing", "nextjs", "prisma", "sql", "typescript"]) {
      expect(
        sitemap.some(
          (entry) =>
            entry.url === `https://napatdev.com/th/notes/${topic}`,
        ),
      ).toBe(true);
    }

    const playwright = sitemap.find(
      (entry) =>
        entry.url ===
        "https://napatdev.com/th/notes/playwright-thai-guide",
    );
    expect(playwright?.alternates?.languages).toEqual({
      th: "https://napatdev.com/th/notes/playwright-thai-guide",
      "x-default": "https://napatdev.com/th/notes/playwright-thai-guide",
    });
    expect(playwright?.lastModified).toEqual(
      new Date("2026-09-14T00:00:00.000Z"),
    );
  });

  it("keeps unknown legacy notes readable but out of the sitemap until a locale is declared", async () => {
    const repository = new StaticContentRepository();
    const source = (await repository.listPublishedNotes())[0];
    const legacy = {
      ...source,
      id: "legacy",
      slug: "legacy",
      rawName: "legacy.md",
      bodyMarkdownByLocale: undefined,
    };

    repository.listPublishedNotes = async () => [legacy];

    expect(getNoteLocales(legacy)).toEqual([]);
    expect(toPresentationNote(legacy, "th")).toMatchObject({
      isFallback: true,
      content: legacy.bodyMarkdown,
    });

    const sitemap = await buildSitemap(repository);
    expect(
      sitemap.some((entry) => entry.url.endsWith("/notes/legacy")),
    ).toBe(false);
  });
});
