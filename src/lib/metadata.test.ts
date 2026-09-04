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

  it("treats the pinned favicon image as missing and generates a card", () => {
    const metadata = buildPageMetadata({
      title: "Contact Napat Pamornsut",
      description: "Contact page",
      ogImage: "/favicon.png",
      path: "/contact",
    });
    const images = metadata.openGraph?.images as Array<{ url: string }>;

    expect(images[0].url).toContain("/api/og?");
    expect(images[0].url).toContain("kind=contact");
  });
});
