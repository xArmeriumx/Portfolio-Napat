import { randomUUID } from "node:crypto";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const extensionByMime = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;

export function isPortfolioStorageKey(storageKey: string) {
  return /^projects\/[^/]+\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(storageKey);
}

function storageConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.PORTFOLIO_STORAGE_BUCKET || "portfolio-cms";
  if (!baseUrl || !serviceKey) throw new Error("Supabase Storage is not configured");
  return { baseUrl, serviceKey, bucket };
}

function storageUrl(bucket: string, storageKey: string) {
  if (!isPortfolioStorageKey(storageKey)) throw new Error("INVALID_PORTFOLIO_STORAGE_KEY");
  return `${storageConfig().baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

export function detectImageMime(bytes: Uint8Array) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export function imageDimensions(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/png" && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  return { width: null, height: null };
}

export async function uploadPortfolioMedia(input: {
  projectId: string;
  file: File;
  altEn: string;
  altTh: string;
  captionEn?: string | null;
  captionTh?: string | null;
}) {
  if (!allowedMimeTypes.has(input.file.type)) throw new Error("UNSUPPORTED_MEDIA_TYPE");
  if (input.file.size <= 0 || input.file.size > MAX_MEDIA_BYTES) throw new Error("MEDIA_TOO_LARGE");
  const bytes = new Uint8Array(await input.file.arrayBuffer());
  const detectedMime = detectImageMime(bytes);
  if (!detectedMime || detectedMime !== input.file.type) throw new Error("MEDIA_SIGNATURE_MISMATCH");
  const { baseUrl, serviceKey, bucket } = storageConfig();
  const storageKey = `projects/${input.projectId}/${randomUUID()}.${extensionByMime[detectedMime]}`;
  const headers = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": detectedMime, "x-upsert": "false" };
  let upload: Response;
  try {
    upload = await fetch(storageUrl(bucket, storageKey), { method: "POST", headers, body: bytes });
  } catch {
    throw new Error("STORAGE_UPLOAD_FAILED");
  }
  if (!upload.ok) throw new Error("STORAGE_UPLOAD_FAILED");
  const publicBase = (process.env.SUPABASE_STORAGE_PUBLIC_BASE_URL || `${baseUrl}/storage/v1/object/public/${bucket}`).replace(/\/$/, "");
  return {
    storageKey,
    publicUrl: `${publicBase}/${storageKey.split("/").map(encodeURIComponent).join("/")}`,
    mimeType: detectedMime,
    sizeBytes: input.file.size,
    ...imageDimensions(bytes, detectedMime),
    altEn: input.altEn,
    altTh: input.altTh || input.altEn,
    captionEn: input.captionEn || null,
    captionTh: input.captionTh || input.captionEn || null,
  };
}

export async function deletePortfolioMedia(storageKey: string) {
  const { bucket, serviceKey } = storageConfig();
  let response: Response;
  try {
    response = await fetch(storageUrl(bucket, storageKey), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    });
  } catch {
    throw new Error("STORAGE_DELETE_FAILED");
  }
  if (!response.ok && response.status !== 404) throw new Error("STORAGE_DELETE_FAILED");
}
