/*
  Warnings:

  - You are about to drop the `Ping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PingSetup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ping" DROP CONSTRAINT "Ping_pingSetupId_fkey";

-- DropForeignKey
ALTER TABLE "PingSetup" DROP CONSTRAINT "PingSetup_lastPingId_fkey";

-- DropForeignKey
ALTER TABLE "PingSetup" DROP CONSTRAINT "PingSetup_lastSuccessfulPingId_fkey";

-- DropForeignKey
ALTER TABLE "PingSetup" DROP CONSTRAINT "PingSetup_organizationId_fkey";

-- DropTable
DROP TABLE "Ping";

-- DropTable
DROP TABLE "PingSetup";
