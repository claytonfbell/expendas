/*
  Warnings:

  - You are about to drop the column `tagName` on the `Ping` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Ping` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ping" DROP COLUMN "tagName",
DROP COLUMN "title",
ADD COLUMN     "tag" VARCHAR(255);
