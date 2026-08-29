/* global process, console, fetch, URL */

const baseUrlValue = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.PORTFOLIO_STORAGE_BUCKET || "portfolio-cms";
const createConfirmation = process.env.PORTFOLIO_STORAGE_CONFIRM;
const maxBytes = 10 * 1024 * 1024;

if (!baseUrlValue || !serviceKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
if (bucket !== "portfolio-cms") throw new Error("PORTFOLIO_STORAGE_BUCKET must be portfolio-cms for this guarded setup");

const baseUrl = new URL(baseUrlValue).toString().replace(/\/$/, "");
const headers = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" };

async function getBucket() {
  const response = await fetch(`${baseUrl}/storage/v1/bucket/${encodeURIComponent(bucket)}`, { headers });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Storage bucket verification failed with HTTP ${response.status}`);
  return response.json();
}

function publicConfig(value) {
  return {
    id: String(value?.id || bucket),
    name: String(value?.name || bucket),
    public: Boolean(value?.public),
    fileSizeLimit: value?.file_size_limit || null,
    allowedMimeTypes: Array.isArray(value?.allowed_mime_types) ? value.allowed_mime_types : null,
  };
}

async function main() {
  const existing = await getBucket();
  if (existing) {
    const config = publicConfig(existing);
    if (!config.public) throw new Error("The portfolio-cms bucket exists but is not public-read; no bucket was modified");
    console.log(JSON.stringify({ status: "verified", bucket: config }));
    return;
  }

  if (createConfirmation !== "CREATE_PORTFOLIO_CMS_BUCKET") {
    throw new Error("portfolio-cms bucket is missing; set explicit confirmation to create only this bucket");
  }

  const response = await fetch(`${baseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: maxBytes,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
    }),
  });
  if (!response.ok) throw new Error(`Portfolio storage bucket creation failed with HTTP ${response.status}`);

  const created = await getBucket();
  if (!created || !publicConfig(created).public) throw new Error("Portfolio storage bucket could not be verified after creation");
  console.log(JSON.stringify({ status: "created_and_verified", bucket: publicConfig(created) }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Portfolio storage setup failed; secret values were not printed");
  process.exitCode = 1;
});
