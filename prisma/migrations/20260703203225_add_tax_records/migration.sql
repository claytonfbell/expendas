-- CreateEnum
CREATE TYPE "TaxRecordType" AS ENUM ('Federal', 'State', 'Local', 'Property', 'Estimated', 'Other');

-- AlterEnum
ALTER TYPE "OrganizationCloudFileUseCase" ADD VALUE 'TaxRecord';

-- CreateTable
CREATE TABLE "TaxRecord" (
    "id" SERIAL NOT NULL,
    "organizationCloudFileId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "taxYear" VARCHAR(4) NOT NULL,
    "amount" INTEGER NOT NULL,
    "notes" VARCHAR(255),
    "taxRecordType" "TaxRecordType" NOT NULL,

    CONSTRAINT "TaxRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaxRecord" ADD CONSTRAINT "TaxRecord_organizationCloudFileId_fkey" FOREIGN KEY ("organizationCloudFileId") REFERENCES "OrganizationCloudFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRecord" ADD CONSTRAINT "TaxRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRecord" ADD CONSTRAINT "TaxRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
