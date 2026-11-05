/*
  Warnings:

  - Added the required column `userId` to the `OnRamp` table without a default value. This is not possible if the table is not empty.

*/
-- User: cash locked by open BUY orders (balance is the total, including it)
ALTER TABLE "User" ADD COLUMN "lockedBalance" INTEGER NOT NULL DEFAULT 0;

-- Order: time priority for orders at the same price
ALTER TABLE "Order" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Trade: yes/no order -> neutral taker/maker order (renamed, so existing rows are kept)
ALTER TABLE "Trade" RENAME COLUMN "yesOrderId" TO "takerOrderId";
ALTER TABLE "Trade" RENAME COLUMN "noOrderId" TO "makerOrderId";
ALTER TABLE "Trade" RENAME CONSTRAINT "Trade_yesOrderId_fkey" TO "Trade_takerOrderId_fkey";
ALTER TABLE "Trade" RENAME CONSTRAINT "Trade_noOrderId_fkey" TO "Trade_makerOrderId_fkey";

-- OnRamp: owned by a user
ALTER TABLE "OnRamp" ADD COLUMN "userId" INTEGER NOT NULL;
ALTER TABLE "OnRamp" ADD CONSTRAINT "OnRamp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Check constraints (not expressible in schema.prisma; Prisma leaves them alone)
ALTER TABLE "User" ADD CONSTRAINT "User_balance_check"
  CHECK ("balance" >= 0 AND "lockedBalance" >= 0 AND "lockedBalance" <= "balance");

ALTER TABLE "Position" ADD CONSTRAINT "Position_qty_check"
  CHECK ("yesQty" >= 0 AND "noQty" >= 0
     AND "lockedYesQty" >= 0 AND "lockedNoQty" >= 0
     AND "lockedYesQty" <= "yesQty" AND "lockedNoQty" <= "noQty");

ALTER TABLE "Order" ADD CONSTRAINT "Order_qty_check"
  CHECK ("qty" >= 0 AND "filledQty" >= 0);

ALTER TABLE "Trade" ADD CONSTRAINT "Trade_qty_check"
  CHECK ("qty" >= 0);
