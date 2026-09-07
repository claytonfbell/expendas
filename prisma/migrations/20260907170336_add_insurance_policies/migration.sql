-- AlterEnum
ALTER TYPE "OrganizationCloudFileUseCase" ADD VALUE 'InsurancePolicy';

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "policyNumber" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "termYears" INTEGER,
    "termEnd" TEXT,
    "amount" INTEGER NOT NULL,
    "premium" INTEGER,
    "notes" VARCHAR(255),

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePolicyFile" (
    "id" SERIAL NOT NULL,
    "insurancePolicyId" INTEGER NOT NULL,
    "organizationCloudFileId" INTEGER NOT NULL,

    CONSTRAINT "InsurancePolicyFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsPolicyFile.policyId_orgFileId_unique" ON "InsurancePolicyFile"("insurancePolicyId", "organizationCloudFileId");

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicyFile" ADD CONSTRAINT "InsurancePolicyFile_insurancePolicyId_fkey" FOREIGN KEY ("insurancePolicyId") REFERENCES "InsurancePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicyFile" ADD CONSTRAINT "InsurancePolicyFile_organizationCloudFileId_fkey" FOREIGN KEY ("organizationCloudFileId") REFERENCES "OrganizationCloudFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
