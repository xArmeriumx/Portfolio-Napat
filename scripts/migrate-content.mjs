/* global process, URL, console */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const allowedSchemas = new Set(["portfolio_cms_dev", "portfolio_cms_preview", "portfolio_cms_prod"]);
const schema = process.env.PORTFOLIO_CMS_SCHEMA;
const databaseUrlValue = process.env.DATABASE_URL;

if (!schema || !allowedSchemas.has(schema)) {
  throw new Error("PORTFOLIO_CMS_SCHEMA must be one of portfolio_cms_dev, portfolio_cms_preview, portfolio_cms_prod");
}
if (!databaseUrlValue) throw new Error("DATABASE_URL is required");

const databaseUrl = new URL(databaseUrlValue);
if (databaseUrl.searchParams.get("schema") !== schema) {
  throw new Error("DATABASE_URL schema does not match PORTFOLIO_CMS_SCHEMA");
}

const migrationPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../prisma/migrations/20260829000000_portfolio_cms_initial/migration.sql");
const migrationSql = await fs.readFile(migrationPath, "utf8");
if (!migrationSql.includes('"__PORTFOLIO_SCHEMA__"')) throw new Error("Migration template is missing its schema placeholder");

const migrationId = "20260829000000_portfolio_cms_initial";
const sqlStatements = migrationSql
  .replaceAll('"__PORTFOLIO_SCHEMA__"', `"${schema}"`)
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);
const prisma = new PrismaClient();

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function verifyTarget() {
  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));
  const target = await prisma.$queryRawUnsafe("SELECT current_database() AS database, current_schema() AS schema");
  const searchPath = await prisma.$queryRawUnsafe("SHOW search_path");
  const namespace = await prisma.$queryRawUnsafe("SELECT nspname FROM pg_namespace WHERE nspname = $1", schema);
  const connectedDatabase = target[0]?.database;
  const connectedSearchPath = String(searchPath[0]?.search_path || "");

  if (databaseName && connectedDatabase !== databaseName) {
    throw new Error("Connected database verification failed");
  }
  // A first install legitimately has no schema yet. For an existing schema,
  // require the connection's search path/current schema to resolve it too.
  if (namespace.length > 0 && !connectedSearchPath.includes(schema) && target[0]?.schema !== schema) {
    throw new Error("Connected schema verification failed");
  }
}

async function main() {
  await verifyTarget();
  const historyTable = `${quoteIdentifier(schema)}."_portfolio_cms_migrations"`;
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(schema)}`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS ${historyTable} ("id" TEXT PRIMARY KEY, "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`);

  const existing = await prisma.$queryRawUnsafe(`SELECT "id" FROM ${historyTable} WHERE "id" = $1`, migrationId);
  if (existing.length > 0) {
    console.log(JSON.stringify({ schema, migration: migrationId, status: "already_applied" }));
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const statement of sqlStatements) await tx.$executeRawUnsafe(statement);
    await tx.$executeRawUnsafe(`INSERT INTO ${historyTable} ("id") VALUES ($1)`, migrationId);
  });
  console.log(JSON.stringify({ schema, migration: migrationId, status: "applied" }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Portfolio migration failed");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
