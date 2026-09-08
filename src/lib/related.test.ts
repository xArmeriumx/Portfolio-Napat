import { describe, expect, it } from "vitest";
import {
  NOTE_TOPICS,
  getRelatedNotes,
  getRelatedProjects,
  getTopicHub,
  isNoteTopicKey,
} from "./related";
import type { PresentationNote, PresentationProject } from "@/content/presentation";

function makeNote(overrides: Partial<PresentationNote> = {}): PresentationNote {
  return {
    path: "/src/data/notes/nextjs-app-router-guide.md",
    slug: "nextjs-app-router-guide",
    content: "# Next.js Mastery",
    name: "Nextjs App Router Guide",
    displayTitle: "Next.js Mastery: The Complete App Router Guide",
    rawName: "nextjs-app-router-guide.md",
    publishedAt: null,
    updatedAt: null,
    seo: { title: null, description: null },
    ...overrides,
  };
}

function makeProject(overrides: Partial<PresentationProject> = {}): PresentationProject {
  return {
    slug: "shop-inventory-management",
    title: "Shop Inventory & Sales Management System",
    title_th: "ระบบจัดการสต็อก",
    images: [],
    role: ["Full Stack"],
    description: "Multi-tenant inventory with Next.js and Prisma",
    description_th: "",
    technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    keyFeatures: [],
    keyFeatures_th: [],
    highlights: [],
    highlights_th: [],
    responsibilities: [],
    responsibilities_th: [],
    links: { demo: null, repo: null },
    featured: true,
    metrics: [],
    publishedAt: null,
    updatedAt: null,
    seo: { title: null, description: null, image: null },
    ...overrides,
  };
}

describe("related links", () => {
  it("matches a Next.js note to Next.js/React projects", () => {
    const related = getRelatedProjects(makeNote(), [
      makeProject(),
      makeProject({
        slug: "clean-water-monitoring",
        title: "Clean Water Monitoring",
        description: "IoT water quality dashboard with Flutter",
        technologies: ["Flutter"],
      }),
    ]);

    expect(related.map((project) => project.slug)).toContain("shop-inventory-management");
    expect(related.map((project) => project.slug)).not.toContain("clean-water-monitoring");
  });

  it("matches an SQL note to Prisma/PostgreSQL projects", () => {
    const sqlNote = makeNote({
      slug: "sql-basics",
      name: "Sql Basics",
      displayTitle: "SQL พื้นฐานสำหรับงานจริง",
    });
    const related = getRelatedProjects(sqlNote, [makeProject()]);

    expect(related.map((project) => project.slug)).toEqual(["shop-inventory-management"]);
  });

  it("matches notes back from a project", () => {
    const related = getRelatedNotes(makeProject(), [
      makeNote(),
      makeNote({ slug: "sql-basics", name: "Sql Basics", displayTitle: "SQL พื้นฐาน" }),
    ]);

    expect(related.map((note) => note.slug)).toContain("nextjs-app-router-guide");
  });

  it("returns empty when nothing overlaps", () => {
    const related = getRelatedProjects(makeNote(), [
      makeProject({ slug: "x", title: "Solar Panel Layout", description: "Rooftop panel arrangement drawings", technologies: ["AutoCAD"] }),
    ]);

    expect(related).toEqual([]);
  });
});

describe("topic hubs", () => {
  it("resolves hub notes in configured order for populated topics", () => {
    const notes = [
      makeNote({ slug: "sql-query-examples" }),
      makeNote({ slug: "sql-basics" }),
      makeNote(),
    ];

    expect(getTopicHub("sql", notes).map((note) => note.slug)).toEqual(["sql-basics", "sql-query-examples"]);
    expect(getTopicHub("nextjs", notes).map((note) => note.slug)).toEqual(["nextjs-app-router-guide"]);
  });

  it("recognizes topic routes independently of published content availability", () => {
    expect(isNoteTopicKey("nextjs")).toBe(true);
    expect(isNoteTopicKey("testing")).toBe(true);
    expect(isNoteTopicKey("nope")).toBe(false);
    expect(NOTE_TOPICS.testing.notes).toEqual([]);
  });
});

it("includes new published CMS testing notes without hardcoding their slugs", () => {
  const note = makeNote({ slug: "testing-seo-beyond-build", name: "Testing SEO", displayTitle: "Testing SEO" });
  expect(getTopicHub("testing", [note])).toEqual([note]);
});
