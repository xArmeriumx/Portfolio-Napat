import { describe, expect, it } from "vitest";
import { hasExplicitConfirmation } from "./admin-http";

describe("admin destructive-action confirmation", () => {
  it("requires an explicit boolean confirmation in the request body", async () => {
    expect(await hasExplicitConfirmation(new Request("http://localhost", { method: "POST", body: JSON.stringify({ confirm: true }) }))).toBe(true);
    expect(await hasExplicitConfirmation(new Request("http://localhost", { method: "POST", body: JSON.stringify({ confirm: "true" }) }))).toBe(false);
    expect(await hasExplicitConfirmation(new Request("http://localhost", { method: "POST" }))).toBe(false);
  });
});
