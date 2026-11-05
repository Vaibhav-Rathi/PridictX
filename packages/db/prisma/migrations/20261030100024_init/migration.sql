-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "Action" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'PARTIAL', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TxType" AS ENUM ('BONUS', 'ORDER_LOCK', 'REFUND', 'PAYOUT');

-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('MINT', 'TRANSFER', 'BURN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "balance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Market" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "status" "MarketStatus" NOT NULL DEFAULT 'OPEN',
    "result" "Side",
    "creatorId" INTEGER NOT NULL,
    "resolvedById" INTEGER NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "side" "Side" NOT NULL,
    "action" "Action" NOT NULL DEFAULT 'BUY',
    "price" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "filledQty" INTEGER NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "userId" INTEGER NOT NULL,
    "marketId" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TradeType" NOT NULL DEFAULT 'MINT',
    "marketId" INTEGER NOT NULL,
    "yesOrderId" INTEGER NOT NULL,
    "noOrderId" INTEGER NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "yesQty" INTEGER NOT NULL DEFAULT 0,
    "noQty" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,
    "marketId" INTEGER NOT NULL,
    "lockedYesQty" INTEGER NOT NULL DEFAULT 0,
    "lockedNoQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Market_status_closesAt_idx" ON "Market"("status", "closesAt");

-- CreateIndex
CREATE INDEX "Order_marketId_status_idx" ON "Order"("marketId", "status");

-- CreateIndex
CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

-- CreateIndex
CREATE INDEX "Trade_marketId_createdAt_idx" ON "Trade"("marketId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Position_userId_marketId_key" ON "Position"("userId", "marketId");

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_yesOrderId_fkey" FOREIGN KEY ("yesOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_noOrderId_fkey" FOREIGN KEY ("noOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
