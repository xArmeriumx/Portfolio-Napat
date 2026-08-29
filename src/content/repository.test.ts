import { describe, expect, it } from "vitest";
import { StaticContentRepository } from "./static-adapter";
import { projectContentSchema, resolveLocalizedText } from "./schema";

describe("StaticContentRepository contract", () => {
  const repository = new StaticContentRepository();

  it("delivers the published profile with ordered localized fields", async () => {
    const profile = await repository.getPublishedProfile();

    expect(profile.id).toBe("profile");
    expect(profile.revision.status).toBe("PUBLISHED");
    expect(profile.identity.name.en).toBe("Napat Pamornsut");
    expect(profile.biography.th).toContain("Web Developer");
    expect(profile.skillCategories.map((category) => category.order)).toEqual([0, 1, 2]);
    expect(profile.skillCategories[0].skills[0].name.en).toBe("HTML");
  });

  it("preserves project ordering, stable slugs, media, and published-only reads", async () => {
    const projects = await repository.listPublishedProjects();

    expect(projects).toHaveLength(7);
    expect(projects.map((project) => project.slug)).toEqual([
      "shop-inventory-management",
      "jodbill-expense-tracker",
      "clean-water-monitoring",
      "automate-test-pipeline",
      "stock-management-system",
      "pharmacy-store",
      "uat-testkit",
    ]);
    expect(projects.every((project) => project.revision.status === "PUBLISHED")).toBe(true);
    expect(projects[0].media).toHaveLength(32);
    expect((await repository.getPublishedProjectBySlug("missing-project"))).toBeNull();
  });

  it("preserves note markdown, order, and slug lookup", async () => {
    const notes = await repository.listPublishedNotes();

    expect(notes).toHaveLength(4);
    expect(notes[0].bodyMarkdown).toContain("#");
    expect(notes.map((note) => note.order)).toEqual([0, 1, 2, 3]);
    expect((await repository.getPublishedNoteBySlug(notes[0].slug))?.rawName).toBe(notes[0].rawName);
    expect((await repository.getPublishedNoteBySlug("missing-note"))).toBeNull();
  });

  it("uses English as the explicit fallback when Thai content is absent", () => {
    expect(resolveLocalizedText({ en: "English", th: "" }, "th")).toBe("English");
  });

  it("rejects protocol-relative URLs at the public content boundary", async () => {
    const source = new StaticContentRepository();
    const project = structuredClone((await source.listPublishedProjects())[0]);
    project.links.demo = "//attacker.example/demo";

    expect(projectContentSchema.safeParse(project).success).toBe(false);
  });
});
