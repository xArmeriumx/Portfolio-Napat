import { describe, expect, it, beforeEach } from "vitest";
import { createPreviewToken, verifyPreviewToken } from "./preview-token";

beforeEach(() => {
  process.env.PREVIEW_SIGNING_SECRET = "test-preview-secret-with-more-than-32-characters";
});

describe("preview grants", () => {
  it("is scoped to the exact content revision and rejects expired or tampered grants", () => {
    const token = createPreviewToken({ contentType: "PROFILE", documentId: "profile", revisionId: "draft-1", ttlSeconds: 60 });
    expect(verifyPreviewToken(token)).toMatchObject({ contentType: "PROFILE", documentId: "profile", revisionId: "draft-1" });
    expect(verifyPreviewToken(`${token}tampered`)).toBeNull();
    expect(verifyPreviewToken(createPreviewToken({ contentType: "PROFILE", documentId: "profile", revisionId: "draft-1", ttlSeconds: -1 }))).toBeNull();
  });
});
