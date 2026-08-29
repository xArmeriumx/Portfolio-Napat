import { PrismaClient } from "@prisma/client";

const expectedSchemaByRuntime = {
  development: "portfolio_cms_dev",
  preview: "portfolio_cms_preview",
  production: "portfolio_cms_prod",
} as const;

const globalForPrisma = globalThis as unknown as { portfolioPrisma?: PrismaClient };

export const prisma =
  globalForPrisma.portfolioPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.portfolioPrisma = prisma;
}

export function assertPortfolioDatabaseTarget() {
  const schema = process.env.PORTFOLIO_CMS_SCHEMA;
  const databaseUrlValue = process.env.DATABASE_URL;
  const runtime = process.env.VERCEL_ENV || (process.env.NODE_ENV === "production" ? "production" : "development");
  const expectedSchema = expectedSchemaByRuntime[runtime as keyof typeof expectedSchemaByRuntime];

  if (!schema || !expectedSchema || !databaseUrlValue || schema !== expectedSchema) {
    throw new Error("Portfolio database target is not configured for this runtime");
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(databaseUrlValue);
  } catch {
    throw new Error("Portfolio database target is not configured for this runtime");
  }
  if (databaseUrl.searchParams.get("schema") !== schema) {
    throw new Error("Portfolio database target is not configured for this runtime");
  }
  return schema;
}
