-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_position_id_fkey";

-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_unit_id_fkey";

-- AlterTable
ALTER TABLE "Personnels" ALTER COLUMN "position_id" DROP NOT NULL,
ALTER COLUMN "unit_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
