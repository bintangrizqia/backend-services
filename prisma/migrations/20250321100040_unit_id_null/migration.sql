-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_unit_id_fkey";

-- AlterTable
ALTER TABLE "Positions" ALTER COLUMN "unit_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
