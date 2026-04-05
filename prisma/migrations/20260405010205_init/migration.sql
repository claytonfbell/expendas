-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" VARCHAR(255),
ADD COLUMN     "socialSecurityEstimates" INTEGER[] DEFAULT ARRAY[0, 0, 0, 0, 0, 0, 0, 0, 0]::INTEGER[];

-- CreateTable
CREATE TABLE "RetirementPlan" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "desiredIncome" INTEGER NOT NULL,
    "healthInsuranceEstimate" INTEGER NOT NULL,
    "stockAppreciationEstimate" INTEGER NOT NULL,
    "dividendYieldEstimate" INTEGER NOT NULL,
    "inflationRateEstimate" INTEGER NOT NULL,
    "withdrawalRateEstimate" INTEGER NOT NULL,

    CONSTRAINT "RetirementPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetirementPlanUser" (
    "id" SERIAL NOT NULL,
    "retirementPlanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "collectSocialSecurityAge" INTEGER NOT NULL DEFAULT 62,

    CONSTRAINT "RetirementPlanUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetirementPlanContribution" (
    "id" SERIAL NOT NULL,
    "retirementPlanId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "RetirementPlanContribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RetirementPlan" ADD CONSTRAINT "RetirementPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetirementPlanUser" ADD CONSTRAINT "RetirementPlanUser_retirementPlanId_fkey" FOREIGN KEY ("retirementPlanId") REFERENCES "RetirementPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetirementPlanUser" ADD CONSTRAINT "RetirementPlanUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetirementPlanContribution" ADD CONSTRAINT "RetirementPlanContribution_retirementPlanId_fkey" FOREIGN KEY ("retirementPlanId") REFERENCES "RetirementPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetirementPlanContribution" ADD CONSTRAINT "RetirementPlanContribution_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
