-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "repeatsUntilDate" TEXT,
    "repeatsOnDaysOfMonth" INTEGER[],
    "repeatsOnMonthsOfYear" INTEGER[],
    "repeatsWeekly" INTEGER,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
