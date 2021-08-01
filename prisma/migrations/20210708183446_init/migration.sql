/*
  Warnings:

  - You are about to drop the column `groupName` on the `Ping` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organizationId,name,groupName]` on the table `PingSetup` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Ping.groupName_index";

-- DropIndex
DROP INDEX "PingSetup.organizationId_name_unique";

-- AlterTable
ALTER TABLE "Ping" DROP COLUMN "groupName";

-- AlterTable
ALTER TABLE "PingSetup" ADD COLUMN     "groupName" VARCHAR(255) NOT NULL DEFAULT E'';

-- CreateIndex
CREATE UNIQUE INDEX "PingSetup.organizationId_name_groupName_unique" ON "PingSetup"("organizationId", "name", "groupName");
