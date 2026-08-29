import { createHmac, timingSafeEqual } from "node:crypto";

type PreviewClaims = {
  contentType: "PROFILE" | "PROJECT" | "NOTE";
  documentId: string;
  revisionId: string;
  exp: number;
};

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";
}

function previewSecret() {
  const dedicatedSecret = process.env.PREVIEW_SIGNING_SECRET;
  if (isProductionRuntime() && !dedicatedSecret) {
    throw new Error("PREVIEW_SIGNING_SECRET must be configured separately in production");
  }
  const secret = dedicatedSecret || process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Preview signing secret is not configured");
  return secret;
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function signature(payload: string) {
  return createHmac("sha256", previewSecret()).update(payload).digest("base64url");
}

export function createPreviewToken(claims: Omit<PreviewClaims, "exp"> & { ttlSeconds?: number }) {
  const payload: PreviewClaims = {
    contentType: claims.contentType,
    documentId: claims.documentId,
    revisionId: claims.revisionId,
    exp: Math.floor(Date.now() / 1000) + (claims.ttlSeconds || 15 * 60),
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${signature(encodedPayload)}`;
}

export function verifyPreviewToken(token: string): PreviewClaims | null {
  try {
    const [encodedPayload, encodedSignature] = token.split(".");
    if (!encodedPayload || !encodedSignature) return null;
    const expected = signature(encodedPayload);
    const actualBuffer = Buffer.from(encodedSignature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
    const claims = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as PreviewClaims;
    if (!claims.documentId || !claims.revisionId || !claims.contentType || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}
