import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

let publicAuth;
let bootstrapAuth;

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";
}

export function resolveAuthBaseURL() {
  const configured = process.env.BETTER_AUTH_URL?.trim();
  if (!configured) {
    if (isProductionRuntime()) throw new Error("BETTER_AUTH_URL must be configured in production");
    return "http://localhost:3000";
  }

  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid absolute URL");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("BETTER_AUTH_URL must use HTTP or HTTPS");
  }
  if (isProductionRuntime() && parsed.protocol !== "https:") {
    throw new Error("BETTER_AUTH_URL must use HTTPS in production");
  }
  return configured;
}

function serverAuthConfig(allowSignUp: boolean) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be configured with at least 32 characters");
  }

  const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "http://localhost:3000,https://napatdev.com")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    database: prismaAdapter(prisma, { provider: "postgresql", transaction: true }),
    secret,
    baseURL: resolveAuthBaseURL(),
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      disableSignUp: !allowSignUp,
      minPasswordLength: 12,
      autoSignIn: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      storage: "database" as const,
      window: 60,
      max: 30,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
      },
    },
    advanced: {
      disableCSRFCheck: false,
      useSecureCookies: process.env.NODE_ENV === "production",
      cookiePrefix: "portfolio-cms",
    },
    plugins: [nextCookies()],
  };
}

export function getAuth(options: { allowSignUp?: boolean } = {}) {
  const allowSignUp = options.allowSignUp === true;
  if (allowSignUp) {
    bootstrapAuth ||= betterAuth(serverAuthConfig(true));
    return bootstrapAuth;
  }
  publicAuth ||= betterAuth(serverAuthConfig(false));
  return publicAuth;
}
