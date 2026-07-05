/*
  Warnings:

  - You are about to drop the column `fixedIncomeTickerPrice` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `tickerPrice` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `totalFixedIncome` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `fixedIncome` on the `AccountBalanceHistory` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('Equity', 'Fixed_Income');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "fixedIncomeTickerPrice",
DROP COLUMN "tickerPrice",
DROP COLUMN "totalFixedIncome";

-- AlterTable
ALTER TABLE "AccountBalanceHistory" DROP COLUMN "fixedIncome";

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "ticker" VARCHAR(255) NOT NULL,
    "tickerPrice" INTEGER NOT NULL,
    "shares" INTEGER NOT NULL,
    "assetType" "AssetType" NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
