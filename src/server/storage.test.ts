import { describe, expect, it } from "vitest";
import { detectImageMime, imageDimensions, isPortfolioStorageKey, MAX_MEDIA_BYTES } from "./storage";

describe("portfolio media validation", () => {
  it("recognizes the supported image signatures", () => {
    expect(detectImageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(detectImageMime(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(detectImageMime(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("image/webp");
    expect(detectImageMime(Uint8Array.from([0x3c, 0x73, 0x76, 0x67, 0x3e]))).toBeNull();
  });

  it("reads PNG dimensions and exposes the upload limit", () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    new DataView(png.buffer).setUint32(16, 1920);
    new DataView(png.buffer).setUint32(20, 1080);
    expect(imageDimensions(png, "image/png")).toEqual({ width: 1920, height: 1080 });
    expect(MAX_MEDIA_BYTES).toBe(10 * 1024 * 1024);
  });

  it("keeps storage operations inside the managed Portfolio namespace", () => {
    expect(isPortfolioStorageKey("projects/project-1/123e4567-e89b-12d3-a456-426614174000.png")).toBe(true);
    expect(isPortfolioStorageKey("avatars/123e4567-e89b-12d3-a456-426614174000.png")).toBe(false);
    expect(isPortfolioStorageKey("projects/project-1/../../other.png")).toBe(false);
  });
});
