/* global process, console, URL, fetch */

import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const allowedSchemas = new Set(["portfolio_cms_dev", "portfolio_cms_preview", "portfolio_cms_prod"]);
const schema = process.env.PORTFOLIO_CMS_SCHEMA;
const databaseUrlValue = process.env.DATABASE_URL;
if (!schema || !allowedSchemas.has(schema)) throw new Error("PORTFOLIO_CMS_SCHEMA is not an allowed Portfolio schema");
if (!databaseUrlValue) throw new Error("DATABASE_URL is required");

const databaseUrl = new URL(databaseUrlValue);
if (databaseUrl.searchParams.get("schema") !== schema) throw new Error("DATABASE_URL schema does not match PORTFOLIO_CMS_SCHEMA");

const prisma = new PrismaClient();

async function tableCounts() {
  const tableNames = ["User", "Account", "Session", "Verification"];
  const tables = await prisma.$queryRawUnsafe(
    "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = $1 AND table_name = ANY($2::text[]) ORDER BY table_name",
    schema,
    tableNames,
  );
  const counts = {};
  for (const table of tables) {
    const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "${schema.replaceAll('"', '""')}"."${table.name.replaceAll('"', '""')}"`);
    counts[table.name] = rows[0]?.count || 0;
  }
  return counts;
}

async function migrationHistory() {
  try {
    const rows = await prisma.$queryRawUnsafe(`SELECT "id", "appliedAt" FROM "${schema}"."_portfolio_cms_migrations" ORDER BY "appliedAt"`);
    return { exists: true, migrations: rows.map((row) => ({ id: row.id, appliedAt: row.appliedAt })) };
  } catch {
    return { exists: false, migrations: [] };
  }
}

async function storageInventory() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) return { status: "not_configured", buckets: [], portfolioBucket: false };
  try {
    const response = await fetch(`${baseUrl}/storage/v1/bucket`, { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } });
    if (!response.ok) return { status: `http_${response.status}`, buckets: [], portfolioBucket: false };
    const buckets = await response.json();
    const names = Array.isArray(buckets) ? buckets.map((bucket) => String(bucket.name || bucket.id || "")).filter(Boolean).sort() : [];
    const expected = process.env.PORTFOLIO_STORAGE_BUCKET || "portfolio-cms";
    return { status: "ok", buckets: names, portfolioBucket: names.includes(expected) };
  } catch {
    return { status: "unavailable", buckets: [], portfolioBucket: false };
  }
}

async function main() {
  const target = await prisma.$queryRawUnsafe("SELECT current_database() AS database, current_schema() AS schema");
  const searchPath = await prisma.$queryRawUnsafe("SHOW search_path");
  const schemas = await prisma.$queryRawUnsafe("SELECT nspname AS name FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname <> 'information_schema' ORDER BY nspname");
  const objects = await prisma.$queryRawUnsafe(
    "SELECT c.relname AS name, c.relkind AS kind FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 ORDER BY c.relname",
    schema,
  );
  let policies = [];
  try {
    policies = await prisma.$queryRawUnsafe("SELECT schemaname, tablename, policyname, roles FROM pg_policies ORDER BY schemaname, tablename, policyname");
  } catch {
    policies = [];
  }
  const inventory = {
    generatedAt: new Date().toISOString(),
    target: { requestedSchema: schema, database: target[0]?.database || null, currentSchema: target[0]?.schema || null, searchPath: searchPath[0]?.search_path || null },
    schemas: schemas.map((item) => item.name),
    portfolioObjects: objects.map((item) => ({ name: item.name, kind: item.kind })),
    migrationHistory: await migrationHistory(),
    authTables: await tableCounts(),
    storage: await storageInventory(),
    policies: policies.map((policy) => ({ schema: policy.schemaname, table: policy.tablename, name: policy.policyname, roles: policy.roles })),
  };
  const outputPath = process.env.PORTFOLIO_INVENTORY_OUTPUT;
  if (outputPath) {
    await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify({ ...inventory, outputPath: outputPath || null }));
}

main().catch(() => {
  console.error("Portfolio inventory failed; no credentials or database values were printed");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
