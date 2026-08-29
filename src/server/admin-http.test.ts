import { describe, expect, it } from "vitest";
import { adminErrorResponse, hasExplicitConfirmation } from "./admin-http";

describe("admin destructive-action confirmation", () => {
  it("requires an explicit boolean confirmation in the request body", async () => {
    expect(await hasExplicitConfirmation(new Request("http://localhost", { method: "POST", body: JSON.stringify({ confirm: true }) }))).toBe(true);
    expect(await hasExplicitConfirmation(new Request("http://localhost", { method: "POST", body: JSON.stringify({ confirm: "true" }) }))).toBe(false);
    expect(await hasExplicitConfirmation(new Request("http://localhost", { method: "POST" }))).toBe(false);
  });

  it("maps Storage configuration failures to an unavailable response", async () => {
    const response = adminErrorResponse(new Error("Supabase Storage is not configured"));

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: { code: "STORAGE_UNAVAILABLE" } });
  });
});
