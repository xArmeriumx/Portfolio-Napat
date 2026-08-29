import { describe, expect, it } from "vitest";
import { searchPathHasSchema } from "../../scripts/portfolio-target.mjs";

describe("Portfolio database target search path", () => {
  it("matches exact schema tokens and rejects substrings", () => {
    expect(searchPathHasSchema('"portfolio_cms_preview", public', "portfolio_cms_preview")).toBe(true);
    expect(searchPathHasSchema("portfolio_cms_preview, public", "portfolio_cms_preview")).toBe(true);
    expect(searchPathHasSchema("portfolio_cms_preview_evil, public", "portfolio_cms_preview")).toBe(false);
    expect(searchPathHasSchema("public, portfolio_cms_preview_evil", "portfolio_cms_preview")).toBe(false);
  });
});
