-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authCode" VARCHAR(255),
ADD COLUMN     "authCodeExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User.authCode_index" ON "User"("authCode");
