-- AlterTable
ALTER TABLE "CloudFile" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DataBackup" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "cloudFileId" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataBackup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataBackup" ADD CONSTRAINT "DataBackup_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataBackup" ADD CONSTRAINT "DataBackup_cloudFileId_fkey" FOREIGN KEY ("cloudFileId") REFERENCES "CloudFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataBackup" ADD CONSTRAINT "DataBackup_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
