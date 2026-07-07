-- AlterTable
ALTER TABLE "TaskGroup" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TaskSchedule" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
