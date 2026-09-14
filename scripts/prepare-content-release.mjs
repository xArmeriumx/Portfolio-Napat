/* global process, console */

import { spawnSync } from "node:child_process";

const isVercel = process.env.VERCEL === "1";
const vercelEnv = process.env.VERCEL_ENV || "";
const isVercelProduction = isVercel && vercelEnv === "production";
const manualSync = process.env.PORTFOLIO_CMS_AUTO_IMPORT === "true";
const storage =
  process.env.CONTENT_STORAGE ||
  (isVercelProduction || manualSync ? "database" : "static");

if (storage !== "database" || (!isVercel && !manualSync)) {
  console.log(
    JSON.stringify({
      contentRelease: "skipped",
      reason:
        storage !== "database"
          ? "content storage is not database"
          : "not a Vercel release and manual sync is disabled",
    }),
  );
  process.exit(0);
}

const schema = process.env.PORTFOLIO_CMS_SCHEMA;
const databaseUrl = process.env.DATABASE_URL;

if (!schema || !databaseUrl) {
  throw new Error(
    "Database content release requires PORTFOLIO_CMS_SCHEMA and DATABASE_URL",
  );
}

if (isVercel) {
  const expectedSchemas = {
    production: "portfolio_cms_prod",
    preview: "portfolio_cms_preview",
    development: "portfolio_cms_dev",
  };
  const expectedSchema = expectedSchemas[vercelEnv];

  if (!expectedSchema) {
    throw new Error(
      `Unsupported VERCEL_ENV for content release: ${vercelEnv || "missing"}`,
    );
  }

  if (schema !== expectedSchema) {
    throw new Error(
      `Vercel ${vercelEnv} must use ${expectedSchema}; received ${schema}`,
    );
  }
}

const result = spawnSync(process.execPath, ["scripts/import-content.mjs"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log(
  JSON.stringify({
    contentRelease: "verified",
    schema,
    environment: isVercel ? vercelEnv : "manual",
  }),
);
