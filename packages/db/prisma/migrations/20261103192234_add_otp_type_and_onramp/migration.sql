/*
  Warnings:

  - Added the required column `type` to the `VerificationCode` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('REGISTER', 'RESET');

-- AlterTable
ALTER TABLE "Market" ALTER COLUMN "resolvedById" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "VerificationCode" ADD COLUMN     "type" "OtpType" NOT NULL;

-- CreateTable
CREATE TABLE "OnRamp" (
    "id" SERIAL NOT NULL,
    "type" "TxType" NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "OnRamp_pkey" PRIMARY KEY ("id")
);
