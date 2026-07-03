/*
  Warnings:

  - You are about to drop the column `accountId` on the `TaxRecord` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TaxRecordType" ADD VALUE 'Federal_State';

-- DropForeignKey
ALTER TABLE "TaxRecord" DROP CONSTRAINT "TaxRecord_accountId_fkey";

-- AlterTable
ALTER TABLE "TaxRecord" DROP COLUMN "accountId";
