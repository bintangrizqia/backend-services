-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_personnel_id_fkey";

-- AlterTable
ALTER TABLE "ActivityLogs" ALTER COLUMN "personnel_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("npp") ON DELETE SET NULL ON UPDATE CASCADE;
