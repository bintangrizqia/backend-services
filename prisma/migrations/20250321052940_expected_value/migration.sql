-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_position_type_id_fkey";

-- AlterTable
ALTER TABLE "Positions" ALTER COLUMN "position_type_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_position_type_id_fkey" FOREIGN KEY ("position_type_id") REFERENCES "PositionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
