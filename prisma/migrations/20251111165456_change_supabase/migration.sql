-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "SchoolSettings" ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "featureFlags" JSONB,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "tier" "SubscriptionTier" NOT NULL DEFAULT 'BASIC';
