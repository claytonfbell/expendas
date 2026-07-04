-- CreateEnum
CREATE TYPE "MealsOutReason" AS ENUM ('Date_Night', 'Friends', 'Lazy', 'No_Groceries', 'Celebration', 'Family', 'Travel', 'Away_from_Home', 'Other');

-- CreateTable
CREATE TABLE "MealsOut" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "merchant" VARCHAR(255) NOT NULL,
    "reason" "MealsOutReason" NOT NULL,
    "notes" VARCHAR(255),

    CONSTRAINT "MealsOut_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MealsOut" ADD CONSTRAINT "MealsOut_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
