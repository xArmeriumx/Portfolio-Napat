-- Better Auth 1.7 scopes account identities by issuer and persists database rate limits.

ALTER TABLE "__PORTFOLIO_SCHEMA__"."Account"
ADD COLUMN IF NOT EXISTS "issuer" TEXT;

UPDATE "__PORTFOLIO_SCHEMA__"."Account"
SET "issuer" = CASE
  WHEN "providerId" = 'credential' THEN 'local:credential'
  ELSE 'local:' || "providerId"
END
WHERE "issuer" IS NULL;

ALTER TABLE "__PORTFOLIO_SCHEMA__"."Account"
ALTER COLUMN "issuer" SET NOT NULL;

DROP INDEX IF EXISTS "__PORTFOLIO_SCHEMA__"."Account_providerId_accountId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Account_issuer_accountId_key"
ON "__PORTFOLIO_SCHEMA__"."Account"("issuer", "accountId");

CREATE TABLE IF NOT EXISTS "__PORTFOLIO_SCHEMA__"."RateLimit" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "lastRequest" BIGINT NOT NULL,

  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RateLimit_key_key"
ON "__PORTFOLIO_SCHEMA__"."RateLimit"("key");
