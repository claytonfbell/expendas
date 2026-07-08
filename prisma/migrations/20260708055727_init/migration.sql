-- AlterTable
ALTER TABLE "User" ADD COLUMN     "digestEmailDays" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::INTEGER[],
ADD COLUMN     "digestEmailTimes" INTEGER[] DEFAULT ARRAY[6, 18]::INTEGER[],
ADD COLUMN     "receiveDigestEmails" BOOLEAN NOT NULL DEFAULT true;
