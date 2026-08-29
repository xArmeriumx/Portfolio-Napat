import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPreviewToken, verifyPreviewToken } from "./preview-token";

beforeEach(() => {
  vi.stubEnv("PREVIEW_SIGNING_SECRET", "test-preview-secret-with-more-than-32-characters");
});

afterEach(() => vi.unstubAllEnvs());

describe("preview grants", () => {
  it("is scoped to the exact content revision and rejects expired or tampered grants", () => {
    const token = createPreviewToken({ contentType: "PROFILE", documentId: "profile", revisionId: "draft-1", ttlSeconds: 60 });
    expect(verifyPreviewToken(token)).toMatchObject({ contentType: "PROFILE", documentId: "profile", revisionId: "draft-1" });
    expect(verifyPreviewToken(`${token}tampered`)).toBeNull();
    expect(verifyPreviewToken(createPreviewToken({ contentType: "PROFILE", documentId: "profile", revisionId: "draft-1", ttlSeconds: -1 }))).toBeNull();
  });

  it("requires a dedicated signing secret in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PREVIEW_SIGNING_SECRET", "");
    vi.stubEnv("BETTER_AUTH_SECRET", "fallback-auth-secret-with-more-than-32-characters");

    expect(() => createPreviewToken({ contentType: "PROFILE", documentId: "profile", revisionId: "draft-1" })).toThrow(
      "PREVIEW_SIGNING_SECRET must be configured separately in production",
    );
  });
});
