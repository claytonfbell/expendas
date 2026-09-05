-- CreateTable
CREATE TABLE "TaxRecordFile" (
    "id" SERIAL NOT NULL,
    "taxRecordId" INTEGER NOT NULL,
    "organizationCloudFileId" INTEGER NOT NULL,

    CONSTRAINT "TaxRecordFile_pkey" PRIMARY KEY ("id")
);

-- Backfill: migrate existing single-file relationships into the joiner table
INSERT INTO "TaxRecordFile" ("taxRecordId", "organizationCloudFileId")
SELECT "id", "organizationCloudFileId"
FROM "TaxRecord"
WHERE "organizationCloudFileId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "TaxRecordFile" ADD CONSTRAINT "TaxRecordFile_taxRecordId_fkey" FOREIGN KEY ("taxRecordId") REFERENCES "TaxRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRecordFile" ADD CONSTRAINT "TaxRecordFile_organizationCloudFileId_fkey" FOREIGN KEY ("organizationCloudFileId") REFERENCES "OrganizationCloudFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddUniqueConstraint
ALTER TABLE "TaxRecordFile" ADD CONSTRAINT "TaxRecordFile.taxRecordId_organizationCloudFileId_unique" UNIQUE ("taxRecordId", "organizationCloudFileId");

-- DropForeignKey (old TaxRecord -> OrganizationCloudFile relation)
ALTER TABLE "TaxRecord" DROP CONSTRAINT "TaxRecord_organizationCloudFileId_fkey";

-- DropColumn: organizationCloudFileId
ALTER TABLE "TaxRecord" DROP COLUMN "organizationCloudFileId";

-- DropColumn: taxRecordType
ALTER TABLE "TaxRecord" DROP COLUMN "taxRecordType";

-- DropEnum
DROP TYPE "TaxRecordType";