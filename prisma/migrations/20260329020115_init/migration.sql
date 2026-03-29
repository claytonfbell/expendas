-- CreateTable
CREATE TABLE "AccountBalanceHistory" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "AccountBalanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalanceHistory.accountId_date_unique" ON "AccountBalanceHistory"("accountId", "date");

-- AddForeignKey
ALTER TABLE "AccountBalanceHistory" ADD CONSTRAINT "AccountBalanceHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
