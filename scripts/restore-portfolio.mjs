/* global process, console, URL */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const allowedSchemas = new Set(["portfolio_cms_dev", "portfolio_cms_preview"]);
const schema = process.env.PORTFOLIO_CMS_SCHEMA;
const databaseUrlValue = process.env.DATABASE_URL;
const backupFile = process.env.PORTFOLIO_BACKUP_FILE;
if (!schema || !allowedSchemas.has(schema)) throw new Error("Restore is limited to portfolio_cms_dev or portfolio_cms_preview");
if (!databaseUrlValue || !backupFile) throw new Error("DATABASE_URL and PORTFOLIO_BACKUP_FILE are required");
if (process.env.PORTFOLIO_RESTORE_CONFIRM !== "RESTORE_PORTFOLIO_CMS_NONPROD") throw new Error("Restore requires explicit non-production confirmation");

const databaseUrl = new URL(databaseUrlValue);
if (databaseUrl.searchParams.get("schema") !== schema) throw new Error("DATABASE_URL schema does not match PORTFOLIO_CMS_SCHEMA");

async function main() {
  const backupDirectory = path.resolve(process.env.PORTFOLIO_BACKUP_DIR || "artifacts/backups");
  const resolvedBackup = path.resolve(backupFile);
  if (!resolvedBackup.startsWith(`${backupDirectory}${path.sep}`)) throw new Error("Backup file must be inside PORTFOLIO_BACKUP_DIR");
  await fs.access(resolvedBackup);
  const database = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));
  if (!database || !databaseUrl.hostname || !databaseUrl.username) throw new Error("DATABASE_URL must contain a PostgreSQL host, user, and database");
  const args = ["--host", databaseUrl.hostname, "--port", databaseUrl.port || "5432", "--username", decodeURIComponent(databaseUrl.username), "--dbname", database, "--schema", schema, "--no-owner", "--no-privileges", "--clean", "--if-exists", "--exit-on-error", "--single-transaction", resolvedBackup];
  await new Promise((resolve, reject) => {
    const child = spawn("pg_restore", args, { env: { ...process.env, PGPASSWORD: decodeURIComponent(databaseUrl.password || "") }, stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `pg_restore exited with ${code}`)));
  });
  console.log(JSON.stringify({ status: "restored", schema, backupFile: resolvedBackup, productionDataUntouched: true }));
}

main().catch(() => {
  console.error("Portfolio restore failed; connection values were not printed");
  process.exitCode = 1;
});
