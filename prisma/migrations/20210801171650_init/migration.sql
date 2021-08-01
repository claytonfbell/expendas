/*
  Warnings:

  - A unique constraint covering the columns `[lastPingId]` on the table `PingSetup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lastSuccessfulPingId]` on the table `PingSetup` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PingSetup" ADD COLUMN     "lastPingId" INTEGER,
ADD COLUMN     "lastSuccessfulPingId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "PingSetup_lastPingId_unique" ON "PingSetup"("lastPingId");

-- CreateIndex
CREATE UNIQUE INDEX "PingSetup_lastSuccessfulPingId_unique" ON "PingSetup"("lastSuccessfulPingId");

-- AddForeignKey
ALTER TABLE "PingSetup" ADD FOREIGN KEY ("lastPingId") REFERENCES "Ping"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PingSetup" ADD FOREIGN KEY ("lastSuccessfulPingId") REFERENCES "Ping"("id") ON DELETE SET NULL ON UPDATE CASCADE;
