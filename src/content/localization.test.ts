import { describe, expect, it } from "vitest";
import { noteDraftSchema } from "./input-schema";
import { StaticContentRepository } from "./static-adapter";
import { getNoteLocales, toPresentationNote } from "./presentation";
import { buildSitemap } from "@/lib/sitemap";
import { buildPageMetadata } from "@/lib/metadata";

describe("published note language contract", () => {
  it("keeps legacy payload readable without falsely claiming a translation", async () => {
    const note = (await new StaticContentRepository().listPublishedNotes())[0];
    expect(noteDraftSchema.safeParse(note).success).toBe(true);
    expect(getNoteLocales(note)).toEqual([]);
    expect(toPresentationNote(note, "th")).toMatchObject({ content: note.bodyMarkdown, isFallback: true });
  });
  it("resolves the selected language and marks only the unavailable locale as fallback", async () => {
    const note = { ...(await new StaticContentRepository().listPublishedNotes())[0], title: { en: "Test", th: "ทดสอบ" }, bodyMarkdownByLocale: { th: "# ทดสอบ\n\nเนื้อหาไทย" } };
    expect(toPresentationNote(note, "th")).toMatchObject({ displayTitle: "ทดสอบ", contentLocale: "th", isFallback: false });
    expect(toPresentationNote(note, "en")).toMatchObject({ contentLocale: "th", isFallback: true });
    const metadata = buildPageMetadata({ title: "Test", description: "Test", path: "/notes/test", availableLocales: getNoteLocales(note) });
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates).toBeUndefined();
  });
  it("validates unsafe Markdown in either translation without losing the legacy body", async () => {
    const note = (await new StaticContentRepository().listPublishedNotes())[0];
    for (const locale of ["en", "th"]) {
      expect(noteDraftSchema.safeParse({ ...note, bodyMarkdownByLocale: { [locale]: "[run](javascript:alert(1))" } }).success).toBe(false);
    }
    const parsed = noteDraftSchema.parse({ ...note, bodyMarkdownByLocale: { en: "# Test" } });
    expect(parsed.bodyMarkdownByLocale.en).toBe("# Test");
    expect(parsed.bodyMarkdown).toBe(note.bodyMarkdown);
  });
  it("emits matching sitemap clusters and published dates, excluding untranslated notes and empty topics", async () => {
    const repository = new StaticContentRepository();
    const note = (await repository.listPublishedNotes())[0];
    repository.listPublishedNotes = async () => [{ ...note, slug: "typescript-reference-guide", title: { en: "Types", th: "ชนิดข้อมูล" }, bodyMarkdownByLocale: { en: "# Types", th: "# ชนิดข้อมูล" }, revision: { ...note.revision, publishedAt: "2026-09-01T00:00:00.000Z" } }, { ...note, slug: "legacy" }];
    const sitemap = await buildSitemap(repository);
    expect(sitemap.some(r => r.url.endsWith('/legacy'))).toBe(false);
    expect(sitemap.some(r => r.url.endsWith('/testing'))).toBe(false);
    const en = sitemap.find(r => r.url === "https://napatdev.com/notes/typescript-reference-guide");
    const th = sitemap.find(r => r.url === "https://napatdev.com/th/notes/typescript-reference-guide");
    expect(en.alternates).toEqual(th.alternates);
    expect(en.lastModified).toEqual(th.lastModified);
    expect(th.lastModified).toEqual(new Date("2026-09-01T00:00:00.000Z"));
  });
});
