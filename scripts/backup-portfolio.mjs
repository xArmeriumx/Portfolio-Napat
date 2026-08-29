/* global process, console, URL */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { searchPathHasSchema } from "./portfolio-target.mjs";

const allowedSchemas = new Set(["portfolio_cms_dev", "portfolio_cms_preview", "portfolio_cms_prod"]);
const schema = process.env.PORTFOLIO_CMS_SCHEMA;
const databaseUrlValue = process.env.DATABASE_URL;
if (!schema || !allowedSchemas.has(schema)) throw new Error("PORTFOLIO_CMS_SCHEMA is not an allowed Portfolio schema");
if (!databaseUrlValue) throw new Error("DATABASE_URL is required");
if (schema === "portfolio_cms_prod" && process.env.PORTFOLIO_BACKUP_CONFIRM !== "BACKUP_PORTFOLIO_PRODUCTION") throw new Error("Production backup requires explicit confirmation");

const databaseUrl = new URL(databaseUrlValue);
if (databaseUrl.searchParams.get("schema") !== schema) throw new Error("DATABASE_URL schema does not match PORTFOLIO_CMS_SCHEMA");

const prisma = new PrismaClient();

async function verifyTarget() {
  const expectedDatabase = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));
  const target = await prisma.$queryRawUnsafe("SELECT current_database() AS database, current_schema() AS schema");
  const searchPath = await prisma.$queryRawUnsafe("SHOW search_path");
  if (expectedDatabase && target[0]?.database !== expectedDatabase) throw new Error("Connected database verification failed");
  const connectedSchema = String(target[0]?.schema || "");
  const connectedSearchPath = String(searchPath[0]?.search_path || "");
  if (connectedSchema !== schema && !searchPathHasSchema(connectedSearchPath, schema)) throw new Error("Connected schema verification failed");
}

function connectionArgs() {
  const database = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));
  if (!database || !databaseUrl.hostname || !databaseUrl.username) throw new Error("DATABASE_URL must contain a PostgreSQL host, user, and database");
  return {
    args: ["--host", databaseUrl.hostname, "--port", databaseUrl.port || "5432", "--username", decodeURIComponent(databaseUrl.username), "--dbname", database, "--schema", schema, "--format", "custom", "--no-owner", "--no-privileges"],
    env: { ...process.env, PGPASSWORD: decodeURIComponent(databaseUrl.password || "") },
  };
}

function runPgDump(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn("pg_dump", [...args.args, "--file", args.output], { env, stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("error", (error) => reject(error));
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `pg_dump exited with ${code}`)));
  });
}

async function main() {
  await verifyTarget();
  const backupDirectory = path.resolve(process.env.PORTFOLIO_BACKUP_DIR || "artifacts/backups");
  await fs.mkdir(backupDirectory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const output = path.join(backupDirectory, `portfolio-${schema}-${stamp}.dump`);
  const target = connectionArgs();
  await runPgDump({ ...target, output }, target.env);
  console.log(JSON.stringify({ status: "captured", schema, backupFile: output, format: "custom" }));
}

main().catch(() => {
  console.error("Portfolio backup failed; connection values were not printed");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
