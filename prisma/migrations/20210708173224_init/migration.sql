/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,name]` on the table `PingSetup` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PingSetup.name_index";

-- CreateIndex
CREATE INDEX "Ping.groupName_index" ON "Ping"("groupName");

-- CreateIndex
CREATE UNIQUE INDEX "PingSetup.organizationId_name_unique" ON "PingSetup"("organizationId", "name");
