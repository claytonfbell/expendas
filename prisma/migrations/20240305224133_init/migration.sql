-- CreateEnum
CREATE TYPE "PlaidEnvironment" AS ENUM ('Development', 'Sandbox', 'Production');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "plaidAccountId" VARCHAR(255),
ADD COLUMN     "plaidCredentialId" INTEGER;

-- CreateTable
CREATE TABLE "PlaidCredential" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "accessToken" VARCHAR(255) NOT NULL,
    "lastUpdated" TIMESTAMP(3),
    "metadata" TEXT NOT NULL,
    "plaidItemId" VARCHAR(255) NOT NULL,
    "plaidRequestId" VARCHAR(255) NOT NULL,
    "plaidEnvironment" "PlaidEnvironment" NOT NULL,

    CONSTRAINT "PlaidCredential_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlaidCredential" ADD CONSTRAINT "PlaidCredential_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_plaidCredentialId_fkey" FOREIGN KEY ("plaidCredentialId") REFERENCES "PlaidCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
