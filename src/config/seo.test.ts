import { describe, expect, it } from "vitest";
import { getNotesListSeoMeta, getProjectSeoMeta, getSiteSeoDefaults } from "./seo.js";
import { getNoteSeoMeta } from "@/lib/notes";

describe("CMS SEO overrides", () => {
  it("uses the published Profile SEO override for site defaults", () => {
    const seo = getSiteSeoDefaults({
      name: "Napat Pamornsut",
      seo: {
        title: { en: "Custom portfolio title", th: "ชื่อพอร์ตโฟลิโอ" },
        description: { en: "Custom portfolio description", th: "คำอธิบาย" },
        image: "/custom-profile.png",
      },
    });

    expect(seo.title).toBe("Custom portfolio title");
    expect(seo.description).toBe("Custom portfolio description");
    expect(seo.ogImage).toBe("/custom-profile.png");
  });

  it("keeps titles concise in English with the Thai name in the description", () => {
    const seo = getSiteSeoDefaults({
      name: "Napat Pamornsut",
      seo: { title: null, description: null, image: null },
    });

    expect(seo.title).toBe("Napat Pamornsut — Web Developer & Software Tester");
    expect(seo.title.length).toBeLessThanOrEqual(60);
    expect(seo.description).toContain("ณภัทร ภมรสูตร");
  });

  it("uses Project and Note SEO overrides for derived metadata", () => {
    const projectSeo = getProjectSeoMeta(
      {
        slug: "cms-project",
        title: "Visible title",
        title_th: "ชื่อที่แสดง",
        description: "Visible description",
        description_th: "คำอธิบายที่แสดง",
        images: ["/visible.png"],
        technologies: [],
        seo: {
          title: { en: "Custom project title", th: "ชื่อโปรเจค" },
          description: { en: "Custom project description", th: "คำอธิบายโปรเจค" },
          image: "/custom-project.png",
        },
      },
      (project, field) => project[field],
      { name: "Napat Pamornsut" },
    );
    expect(projectSeo.title).toContain("Custom project title");
    expect(projectSeo.title).toContain("Case Study");
    expect(projectSeo.description).toBe("Custom project description");
    expect(projectSeo.ogImage).toBe("/custom-project.png");

    const noteSeo = getNoteSeoMeta({
      path: "/notes/cms-note",
      slug: "cms-note",
      content: "# Visible note",
      name: "Visible note",
      rawName: "cms-note.md",
      publishedAt: null,
      seo: {
        title: { en: "Custom note title", th: "ชื่อโน้ต" },
        description: { en: "Custom note description", th: "คำอธิบายโน้ต" },
      },
    });
    expect(noteSeo.title).toBe("Custom note title");
    expect(noteSeo.description).toBe("Custom note description");
    expect(noteSeo.schemaTitle).toBe("Custom note title");
  });

  it("derives the Notes index metadata from the published Profile", () => {
    const seo = getNotesListSeoMeta({
      name: "Published Profile Name",
      seo: { title: null, description: null, image: "/published-profile.png" },
    });

    expect(seo.title).toBe("Developer Notes & Cheatsheets");
    expect(seo.ogImage).toBe("/published-profile.png");
  });

  it("falls back to the generated OG card when the profile image is the favicon", () => {
    const seo = getNotesListSeoMeta({
      name: "Napat Pamornsut",
      seo: { title: null, description: null, image: "/favicon.png" },
    });

    expect(seo.ogImage).toBeUndefined();
  });
});
