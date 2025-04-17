/*
  Warnings:

  - The primary key for the `MasterTypePositions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `external_id` on the `MasterTypePositions` table. All the data in the column will be lost.
  - The primary key for the `MasterTypeUnits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `external_id` on the `MasterTypeUnits` table. All the data in the column will be lost.
  - The `type_unit_id` column on the `Units` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `MasterTypePositions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `MasterTypeUnits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type_position_id` on the `Positions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_type_position_id_fkey";

-- DropForeignKey
ALTER TABLE "Units" DROP CONSTRAINT "Units_type_unit_id_fkey";

-- DropIndex
DROP INDEX "MasterTypePositions_external_id_key";

-- DropIndex
DROP INDEX "MasterTypeUnits_external_id_key";

-- AlterTable
ALTER TABLE "MasterTypePositions" DROP CONSTRAINT "MasterTypePositions_pkey",
DROP COLUMN "external_id",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "MasterTypePositions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MasterTypeUnits" DROP CONSTRAINT "MasterTypeUnits_pkey",
DROP COLUMN "external_id",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "MasterTypeUnits_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Positions" DROP COLUMN "type_position_id",
ADD COLUMN     "type_position_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Units" DROP COLUMN "type_unit_id",
ADD COLUMN     "type_unit_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_type_unit_id_fkey" FOREIGN KEY ("type_unit_id") REFERENCES "MasterTypeUnits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_type_position_id_fkey" FOREIGN KEY ("type_position_id") REFERENCES "MasterTypePositions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
