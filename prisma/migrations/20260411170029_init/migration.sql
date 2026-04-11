-- CreateEnum
CREATE TYPE "FixedIncomeAssetDurationUnit" AS ENUM ('Weeks', 'Months');

-- CreateEnum
CREATE TYPE "FixedIncomeAssetType" AS ENUM ('US_Treasury_T_Bill', 'CD', 'Money_Market_Fund', 'Bond_Fund');

-- CreateTable
CREATE TABLE "FixedIncomeAsset" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "originalCostBasis" INTEGER,
    "apr" INTEGER,
    "duration" INTEGER,
    "durationUnit" "FixedIncomeAssetDurationUnit",
    "type" "FixedIncomeAssetType" NOT NULL,
    "institution" VARCHAR(255),
    "settlementDate" TEXT,
    "matureDate" TEXT,

    CONSTRAINT "FixedIncomeAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FixedIncomeAsset" ADD CONSTRAINT "FixedIncomeAsset_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
