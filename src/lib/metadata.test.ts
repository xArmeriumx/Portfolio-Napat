import { describe, expect, it } from "vitest";
import { buildOgImageUrl, buildPageMetadata } from "./metadata";

describe("buildOgImageUrl", () => {
  it("encodes kind, title, and subtitle into the /api/og endpoint", () => {
    const url = buildOgImageUrl("project", "Shop Inventory — Case Study", "Web Developer | Software Tester");
    const params = new URLSearchParams(url.split("?")[1]);

    expect(url).toMatch(/^\/api\/og\?/);
    expect(params.get("kind")).toBe("project");
    expect(params.get("title")).toBe("Shop Inventory — Case Study");
    expect(params.get("subtitle")).toBe("Web Developer | Software Tester");
  });

  it("omits empty params", () => {
    expect(buildOgImageUrl("site")).toBe("/api/og?kind=site");
  });
});

describe("buildPageMetadata social image resolution", () => {
  it("generates a dynamic OG card when no image is provided", () => {
    const metadata = buildPageMetadata({
      title: "About Napat Pamornsut",
      description: "About page",
      path: "/about",
    });
    const images = metadata.openGraph?.images as Array<{ url: string; width: number; height: number }>;

    expect(images[0].url).toContain("/api/og?");
    expect(images[0].url).toContain("kind=about");
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
    expect(metadata.twitter?.images).toEqual([images[0].url]);
  });

  it("uses a real content image when provided", () => {
    const metadata = buildPageMetadata({
      title: "Project — Case Study",
      description: "Project page",
      ogImage: "/images/shop-inventory-1.png",
      path: "/projects/shop-inventory-management",
      ogKind: "project",
    });
    const images = metadata.openGraph?.images as Array<{ url: string }>;

    expect(images[0].url).toBe("https://napatdev.com/images/shop-inventory-1.png");
  });

  it("treats the pinned favicon image as missing and generates a card", () => {    const metadata = buildPageMetadata({
      title: "Contact Napat Pamornsut",
      description: "Contact page",
      ogImage: "/favicon.png",
      path: "/contact",
    });
    const images = metadata.openGraph?.images as Array<{ url: string }>;

    expect(images[0].url).toContain("/api/og?");
    expect(images[0].url).toContain("kind=contact");
  });

  it("emits article published/modified times when provided", () => {
    const metadata = buildPageMetadata({
      title: "Example Note",
      description: "Note page",
      ogType: "article",
      path: "/notes/example",
      publishedTime: "2026-01-15T00:00:00.000Z",
      modifiedTime: "2026-02-01T00:00:00.000Z",
    });
    const openGraph = metadata.openGraph as Record<string, unknown>;

    expect(openGraph.publishedTime).toBe("2026-01-15T00:00:00.000Z");
    expect(openGraph.modifiedTime).toBe("2026-02-01T00:00:00.000Z");
  });

  it("omits article times when unknown", () => {
    const metadata = buildPageMetadata({
      title: "Example Note",
      description: "Note page",
      ogType: "article",
      path: "/notes/example",
    });
    const openGraph = metadata.openGraph as Record<string, unknown>;

    expect(openGraph.publishedTime).toBeUndefined();
    expect(openGraph.modifiedTime).toBeUndefined();
  });

  it("emits reciprocal en/th hreflang with a self canonical", () => {
    const en = buildPageMetadata({ title: "About", description: "About page", path: "/about" });
    const th = buildPageMetadata({ title: "เกี่ยวกับ", description: "หน้าเกี่ยวกับ", path: "/th/about", locale: "th" });

    expect(en.alternates?.canonical).toBe("https://napatdev.com/about");
    expect(en.alternates?.languages).toEqual({
      en: "https://napatdev.com/about",
      th: "https://napatdev.com/th/about",
      "x-default": "https://napatdev.com/about",
    });
    expect(th.alternates?.canonical).toBe("https://napatdev.com/th/about");
    expect(th.alternates?.languages).toEqual(en.alternates?.languages);
    expect((th.openGraph as Record<string, unknown>).locale).toBe("th_TH");
  });
});
