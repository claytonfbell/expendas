-- CreateEnum
CREATE TYPE "OrganizationCloudFileUseCase" AS ENUM ('Receipt');

-- CreateEnum
CREATE TYPE "ReceiptType" AS ENUM ('HSA_Eligible', 'Charity', 'Other');

-- CreateTable
CREATE TABLE "CloudFile" (
    "id" SERIAL NOT NULL,
    "md5" VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "contentType" VARCHAR(255) NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "CloudFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationCloudFile" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "cloudFileId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "useCase" "OrganizationCloudFileUseCase" NOT NULL,

    CONSTRAINT "OrganizationCloudFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" SERIAL NOT NULL,
    "organizationCloudFileId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "date" TEXT,
    "datePaid" TEXT,
    "amount" INTEGER NOT NULL,
    "merchant" VARCHAR(255) NOT NULL,
    "notes" VARCHAR(255),
    "receiptType" "ReceiptType" NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CloudFile.md5_unique" ON "CloudFile"("md5");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationCloudFile.cloudFileId_useCase_organizationId_unique" ON "OrganizationCloudFile"("cloudFileId", "useCase", "organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationCloudFile" ADD CONSTRAINT "OrganizationCloudFile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCloudFile" ADD CONSTRAINT "OrganizationCloudFile_cloudFileId_fkey" FOREIGN KEY ("cloudFileId") REFERENCES "CloudFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_organizationCloudFileId_fkey" FOREIGN KEY ("organizationCloudFileId") REFERENCES "OrganizationCloudFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
