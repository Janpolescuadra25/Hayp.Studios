-- AlterTable
ALTER TABLE "AnalyticsEvent" ADD COLUMN "country" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "deviceType" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "ipHash" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN "region" TEXT;

-- CreateTable
CREATE TABLE "ArtistProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "socialLinks" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL,
    "tags" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "artistId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "ArtistProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "caption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "engagementType" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "feedbackRating" INTEGER,
    "feedbackMessage" TEXT,
    "telemetryConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Inquiry" ("brief", "createdAt", "email", "engagementType", "id", "name", "status", "updatedAt") SELECT "brief", "createdAt", "email", "engagementType", "id", "name", "status", "updatedAt" FROM "Inquiry";
DROP TABLE "Inquiry";
ALTER TABLE "new_Inquiry" RENAME TO "Inquiry";
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");
CREATE INDEX "Inquiry_engagementType_createdAt_idx" ON "Inquiry"("engagementType", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ArtistProfile_slug_key" ON "ArtistProfile"("slug");

-- CreateIndex
CREATE INDEX "ArtistProfile_isActive_displayOrder_idx" ON "ArtistProfile"("isActive", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_artistId_idx" ON "Product"("artistId");

-- CreateIndex
CREATE INDEX "Product_isFeatured_displayOrder_idx" ON "Product"("isFeatured", "displayOrder");

-- CreateIndex
CREATE INDEX "Media_productId_idx" ON "Media"("productId");

-- CreateIndex
CREATE INDEX "Media_mediaType_idx" ON "Media"("mediaType");
