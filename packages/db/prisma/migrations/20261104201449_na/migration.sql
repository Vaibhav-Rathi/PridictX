-- DropForeignKey
ALTER TABLE "Market" DROP CONSTRAINT "Market_resolvedById_fkey";

-- AlterTable
ALTER TABLE "Market" ALTER COLUMN "resolvedById" DROP NOT NULL,
ALTER COLUMN "resolvedById" DROP DEFAULT;
