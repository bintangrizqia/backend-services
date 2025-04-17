-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_type_position_id_fkey";

-- AlterTable
ALTER TABLE "Positions" ALTER COLUMN "type_position_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_type_position_id_fkey" FOREIGN KEY ("type_position_id") REFERENCES "MasterTypePositions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
