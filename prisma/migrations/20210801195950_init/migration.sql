-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('Cash', 'Credit_Card', 'Checking_Account', 'Savings_Account', 'CD', 'Investment', 'Line_of_Credit', 'Loan', 'Home_Market_Value', 'Car_Value');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "balance" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Account" ADD FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
