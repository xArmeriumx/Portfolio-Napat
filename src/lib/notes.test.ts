import { describe, expect, it } from "vitest";
import { getNoteSchema, getNotesCollectionSchema } from "./notes";
import type { PresentationNote } from "@/content/presentation";

const profile = {
  name: "Napat Pamornsut",
  name_th: "ณภัทร ภมรสูตร",
  headline: "Web Developer | Software Tester",
  headline_th: "นักพัฒนาเว็บ",
  tagline: "tagline",
  tagline_th: "แท็กไลน์",
  about: "about",
  about_th: "เกี่ยวกับ",
  education: ["KMUTNB"],
  education_th: ["มจพ."],
  contact: { location: "Bangkok", location_th: "กรุงเทพ", phone: "0" },
  links: { email: "n@e.com", github: "https://github.com/x", linkedin: null, resume: null },
  skillCategories: [],
  skills: [],
  seo: { title: null, description: null, image: null },
};

function makeNote(overrides: Partial<PresentationNote> = {}): PresentationNote {
  return {
    path: "/src/data/notes/example.md",
    slug: "example-note",
    content: "# Example",
    name: "Example Note",
    rawName: "example.md",
    publishedAt: null,
    seo: { title: null, description: null },
    ...overrides,
  };
}

describe("getNoteSchema", () => {
  it("builds article URLs from the note slug", () => {
    const schema = getNoteSchema(makeNote(), profile);
    const article = schema["@graph"].find((node) => node["@type"] === "TechArticle") as Record<string, any>;

    expect(article.url).toBe("https://napatdev.com/notes/example-note");
    expect(article.image).toContain("/api/og?");
  });

  it("includes article dates when the revision was published", () => {
    const published = makeNote({ publishedAt: "2026-01-15T00:00:00.000Z" });
    const schema = getNoteSchema(published, profile);
    const article = schema["@graph"].find((node) => node["@type"] === "TechArticle") as Record<string, any>;

    expect(article.datePublished).toBe("2026-01-15T00:00:00.000Z");
    expect(article.dateModified).toBe("2026-01-15T00:00:00.000Z");
  });

  it("omits article dates when unknown", () => {
    const schema = getNoteSchema(makeNote(), profile);
    const article = schema["@graph"].find((node) => node["@type"] === "TechArticle") as Record<string, any>;

    expect(article.datePublished).toBeUndefined();
  });
});

describe("getNotesCollectionSchema", () => {
  it("lists note URLs by slug", () => {
    const schema = getNotesCollectionSchema([makeNote()], profile);
    const collection = schema["@graph"].find((node) => node["@type"] === "CollectionPage") as Record<string, any>;

    expect(collection.mainEntity.itemListElement[0].url).toBe("https://napatdev.com/notes/example-note");
  });
});
