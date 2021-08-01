-- DropIndex
DROP INDEX "Ping.pingSetupId_success_time_index";

-- CreateIndex
CREATE INDEX "Ping.pingSetupId_success_index" ON "Ping"("pingSetupId", "success");
