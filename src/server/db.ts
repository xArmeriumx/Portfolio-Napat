import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { portfolioPrisma?: PrismaClient };

export const prisma =
  globalForPrisma.portfolioPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.portfolioPrisma = prisma;
}
