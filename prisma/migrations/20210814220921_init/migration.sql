/*
  Warnings:

  - You are about to drop the column `carryOver` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "carryOver";

-- CreateTable
CREATE TABLE "CarryOver" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarryOver.accountId_date_unique" ON "CarryOver"("accountId", "date");

-- AddForeignKey
ALTER TABLE "CarryOver" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
