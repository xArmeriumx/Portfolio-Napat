import { describe, expect, it } from "vitest";
import { getProjectSeoMeta, getSiteSeoDefaults } from "./seo.js";
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
    expect(projectSeo.description).toBe("Custom project description");
    expect(projectSeo.ogImage).toBe("/custom-project.png");

    const noteSeo = getNoteSeoMeta({
      path: "/notes/cms-note",
      id: "cms-note",
      content: "# Visible note",
      name: "Visible note",
      rawName: "cms-note.md",
      seo: {
        title: { en: "Custom note title", th: "ชื่อโน้ต" },
        description: { en: "Custom note description", th: "คำอธิบายโน้ต" },
      },
    });
    expect(noteSeo.title).toBe("Custom note title");
    expect(noteSeo.description).toBe("Custom note description");
    expect(noteSeo.schemaTitle).toBe("Custom note title");
  });
});
