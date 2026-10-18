/*
  Warnings:

  - The values [PLANNED] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `body` on the `ChangelogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `ChangelogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ChangelogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `alt` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `placement` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `lane` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `SiteConfig` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `changes` to the `ChangelogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `ChangelogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `ChangelogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'ARCHIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('CONCEPT', 'IN_DEVELOPMENT', 'BETA', 'LIVE', 'ARCHIVED');
ALTER TABLE "Product" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
COMMIT;

-- DropIndex
DROP INDEX "Product_name_key";

-- AlterTable
ALTER TABLE "ChangelogEntry" DROP COLUMN "body",
DROP COLUMN "published",
DROP COLUMN "type",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "changes" JSONB NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "version" TEXT NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "alt",
DROP COLUMN "meta",
DROP COLUMN "placement",
ADD COLUMN     "altText" TEXT;

-- AlterTable
ALTER TABLE "OwnerAccount" ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "lane",
DROP COLUMN "link",
DROP COLUMN "name",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "internalRoute" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'IN_DEVELOPMENT',
ALTER COLUMN "sortOrder" SET DEFAULT 0;

-- DropTable
DROP TABLE "SiteConfig";

-- DropEnum
DROP TYPE "ChangelogType";

-- DropEnum
DROP TYPE "Lane";

-- CreateTable
CREATE TABLE "ProductUpdate" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "registrationUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductUpdate_productId_idx" ON "ProductUpdate"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioEvent_slug_key" ON "StudioEvent"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- AddForeignKey
ALTER TABLE "ProductUpdate" ADD CONSTRAINT "ProductUpdate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
