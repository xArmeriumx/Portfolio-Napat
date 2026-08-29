import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveAuthBaseURL, resolveAuthTrustedOrigins } from "./auth";

afterEach(() => vi.unstubAllEnvs());

describe("Better Auth base URL", () => {
  it("keeps the local default outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("BETTER_AUTH_URL", "");

    expect(resolveAuthBaseURL()).toBe("http://localhost:3000");
  });

  it("requires an explicit HTTPS URL in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_URL", "");

    expect(() => resolveAuthBaseURL()).toThrow("BETTER_AUTH_URL must be configured in production");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    expect(() => resolveAuthBaseURL()).toThrow("BETTER_AUTH_URL must use HTTPS in production");
  });

  it("requires explicit HTTPS trusted origins in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "");

    expect(() => resolveAuthTrustedOrigins()).toThrow("BETTER_AUTH_TRUSTED_ORIGINS must be configured in production");
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "http://localhost:3000");
    expect(() => resolveAuthTrustedOrigins()).toThrow("BETTER_AUTH_TRUSTED_ORIGINS must use HTTPS in production");
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "https://napatdev.com");
    expect(resolveAuthTrustedOrigins()).toEqual(["https://napatdev.com"]);
  });
});
