/*
  Warnings:

  - You are about to drop the column `tickerPriceId` on the `Account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_tickerPriceId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "tickerPriceId",
ADD COLUMN     "tickerPrice" INTEGER;
