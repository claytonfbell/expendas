-- CreateEnum
CREATE TYPE "RetirementPlanType" AS ENUM ('Lean', 'Traditional', 'Chubby', 'Fat');

-- AlterTable
ALTER TABLE "RetirementPlan" ADD COLUMN     "coastDate" TEXT,
ADD COLUMN     "retirementPlanType" "RetirementPlanType" NOT NULL DEFAULT 'Traditional';
