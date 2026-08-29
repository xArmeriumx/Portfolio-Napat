-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "__PORTFOLIO_SCHEMA__";

-- CreateEnum
CREATE TYPE "__PORTFOLIO_SCHEMA__"."ContentType" AS ENUM ('PROFILE', 'PROJECT', 'NOTE');

-- CreateEnum
CREATE TYPE "__PORTFOLIO_SCHEMA__"."DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "__PORTFOLIO_SCHEMA__"."RevisionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."Account" (
    "id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."ContentDocument" (
    "id" TEXT NOT NULL,
    "contentType" "__PORTFOLIO_SCHEMA__"."ContentType" NOT NULL,
    "slug" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "__PORTFOLIO_SCHEMA__"."DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedRevisionId" TEXT,
    "draftRevisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."ContentRevision" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "status" "__PORTFOLIO_SCHEMA__"."RevisionStatus" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."MediaAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altEn" TEXT NOT NULL,
    "altTh" TEXT NOT NULL,
    "captionEn" TEXT,
    "captionTh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."MediaReference" (
    "revisionId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "MediaReference_pkey" PRIMARY KEY ("revisionId","mediaId")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."SlugRedirect" (
    "id" TEXT NOT NULL,
    "contentType" "__PORTFOLIO_SCHEMA__"."ContentType" NOT NULL,
    "fromSlug" TEXT NOT NULL,
    "toSlug" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlugRedirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "__PORTFOLIO_SCHEMA__"."AuditEvent" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "contentType" "__PORTFOLIO_SCHEMA__"."ContentType",
    "documentId" TEXT,
    "revisionId" TEXT,
    "actorId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "__PORTFOLIO_SCHEMA__"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "__PORTFOLIO_SCHEMA__"."Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "__PORTFOLIO_SCHEMA__"."Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "__PORTFOLIO_SCHEMA__"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "__PORTFOLIO_SCHEMA__"."Account"("issuer", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_key_key" ON "__PORTFOLIO_SCHEMA__"."RateLimit"("key");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "__PORTFOLIO_SCHEMA__"."Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "ContentDocument_publishedRevisionId_key" ON "__PORTFOLIO_SCHEMA__"."ContentDocument"("publishedRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentDocument_draftRevisionId_key" ON "__PORTFOLIO_SCHEMA__"."ContentDocument"("draftRevisionId");

-- CreateIndex
CREATE INDEX "ContentDocument_contentType_status_displayOrder_idx" ON "__PORTFOLIO_SCHEMA__"."ContentDocument"("contentType", "status", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ContentDocument_contentType_slug_key" ON "__PORTFOLIO_SCHEMA__"."ContentDocument"("contentType", "slug");

-- CreateIndex
CREATE INDEX "ContentRevision_documentId_status_createdAt_idx" ON "__PORTFOLIO_SCHEMA__"."ContentRevision"("documentId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentRevision_documentId_revisionNumber_key" ON "__PORTFOLIO_SCHEMA__"."ContentRevision"("documentId", "revisionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "__PORTFOLIO_SCHEMA__"."MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "__PORTFOLIO_SCHEMA__"."MediaAsset"("createdAt");

-- CreateIndex
CREATE INDEX "MediaReference_mediaId_idx" ON "__PORTFOLIO_SCHEMA__"."MediaReference"("mediaId");

-- CreateIndex
CREATE INDEX "SlugRedirect_documentId_idx" ON "__PORTFOLIO_SCHEMA__"."SlugRedirect"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "SlugRedirect_contentType_fromSlug_key" ON "__PORTFOLIO_SCHEMA__"."SlugRedirect"("contentType", "fromSlug");

-- CreateIndex
CREATE INDEX "AuditEvent_documentId_createdAt_idx" ON "__PORTFOLIO_SCHEMA__"."AuditEvent"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "__PORTFOLIO_SCHEMA__"."AuditEvent"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "__PORTFOLIO_SCHEMA__"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "__PORTFOLIO_SCHEMA__"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."ContentDocument" ADD CONSTRAINT "ContentDocument_publishedRevisionId_fkey" FOREIGN KEY ("publishedRevisionId") REFERENCES "__PORTFOLIO_SCHEMA__"."ContentRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."ContentDocument" ADD CONSTRAINT "ContentDocument_draftRevisionId_fkey" FOREIGN KEY ("draftRevisionId") REFERENCES "__PORTFOLIO_SCHEMA__"."ContentRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."ContentRevision" ADD CONSTRAINT "ContentRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "__PORTFOLIO_SCHEMA__"."ContentDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."ContentRevision" ADD CONSTRAINT "ContentRevision_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "__PORTFOLIO_SCHEMA__"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."ContentRevision" ADD CONSTRAINT "ContentRevision_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "__PORTFOLIO_SCHEMA__"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."MediaAsset" ADD CONSTRAINT "MediaAsset_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "__PORTFOLIO_SCHEMA__"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."MediaReference" ADD CONSTRAINT "MediaReference_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "__PORTFOLIO_SCHEMA__"."ContentRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."MediaReference" ADD CONSTRAINT "MediaReference_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "__PORTFOLIO_SCHEMA__"."MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."SlugRedirect" ADD CONSTRAINT "SlugRedirect_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "__PORTFOLIO_SCHEMA__"."ContentDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "__PORTFOLIO_SCHEMA__"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "__PORTFOLIO_SCHEMA__"."AuditEvent" ADD CONSTRAINT "AuditEvent_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "__PORTFOLIO_SCHEMA__"."ContentRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
