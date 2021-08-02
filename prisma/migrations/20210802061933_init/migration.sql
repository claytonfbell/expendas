-- CreateEnum
CREATE TYPE "CreditCardType" AS ENUM ('Mastercard', 'Visa', 'American_Express', 'Discover');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "creditCardType" "CreditCardType";
