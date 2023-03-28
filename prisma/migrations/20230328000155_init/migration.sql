-- CreateEnum
CREATE TYPE "AccountBucket" AS ENUM ('Roth_And_HSA', 'Traditional', 'After_Tax');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "accountBucket" "AccountBucket";
