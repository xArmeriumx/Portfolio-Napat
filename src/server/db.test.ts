import { afterEach, describe, expect, it } from "vitest";
import { assertPortfolioDatabaseTarget } from "./db";

const environmentKeys = ["DATABASE_URL", "PORTFOLIO_CMS_SCHEMA", "VERCEL_ENV"];
const originalEnvironment = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of environmentKeys) {
    if (originalEnvironment[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnvironment[key];
  }
});

describe("Portfolio database runtime target", () => {
  it("requires the Preview runtime to use the Preview schema", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.PORTFOLIO_CMS_SCHEMA = "portfolio_cms_preview";
    process.env.DATABASE_URL = "postgresql://user:placeholder@localhost:5432/db?schema=portfolio_cms_preview";

    expect(assertPortfolioDatabaseTarget()).toBe("portfolio_cms_preview");
  });

  it("rejects a schema that does not match the runtime", () => {
    process.env.VERCEL_ENV = "production";
    process.env.PORTFOLIO_CMS_SCHEMA = "portfolio_cms_preview";
    process.env.DATABASE_URL = "postgresql://user:placeholder@localhost:5432/db?schema=portfolio_cms_preview";

    expect(() => assertPortfolioDatabaseTarget()).toThrow("Portfolio database target is not configured for this runtime");
  });
});
