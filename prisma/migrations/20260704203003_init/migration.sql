/*
  Warnings:

  - You are about to drop the column `shares` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `balance` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "shares",
ADD COLUMN     "balance" INTEGER NOT NULL;
