/*
  Warnings:

  - The `position_id` column on the `Personnels` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `unit_id` column on the `Personnels` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Positions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Units` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `parent_id` column on the `Units` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `Positions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `unit_id` on the `Positions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Units` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_position_id_fkey";

-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Units" DROP CONSTRAINT "Units_parent_id_fkey";

-- AlterTable
ALTER TABLE "Personnels" DROP COLUMN "position_id",
ADD COLUMN     "position_id" INTEGER,
DROP COLUMN "unit_id",
ADD COLUMN     "unit_id" INTEGER;

-- AlterTable
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
DROP COLUMN "unit_id",
ADD COLUMN     "unit_id" INTEGER NOT NULL,
ADD CONSTRAINT "Positions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Units" DROP CONSTRAINT "Units_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
DROP COLUMN "parent_id",
ADD COLUMN     "parent_id" INTEGER,
ADD CONSTRAINT "Units_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
