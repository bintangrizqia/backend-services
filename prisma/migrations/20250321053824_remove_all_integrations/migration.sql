/*
  Warnings:

  - You are about to drop the column `eselon` on the `Personnels` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `Personnels` table. All the data in the column will be lost.
  - You are about to drop the `Organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PositionType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Positions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeUnitOrganization` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Organizations" DROP CONSTRAINT "Organizations_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "Organizations" DROP CONSTRAINT "Organizations_type_unit_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_position_type_id_fkey";

-- AlterTable
ALTER TABLE "Personnels" DROP COLUMN "eselon",
DROP COLUMN "organization_id";

-- DropTable
DROP TABLE "Organizations";

-- DropTable
DROP TABLE "PositionType";

-- DropTable
DROP TABLE "Positions";

-- DropTable
DROP TABLE "TypeUnitOrganization";
