/*
  Warnings:

  - The `external_id` column on the `Organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `external_id` column on the `PositionType` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `external_id` column on the `Positions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `external_id` column on the `Programs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `external_id` column on the `TypeUnitOrganization` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Organizations" DROP COLUMN "external_id",
ADD COLUMN     "external_id" INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE "PositionType" DROP COLUMN "external_id",
ADD COLUMN     "external_id" INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE "Positions" DROP COLUMN "external_id",
ADD COLUMN     "external_id" INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE "Programs" DROP COLUMN "external_id",
ADD COLUMN     "external_id" INTEGER NOT NULL DEFAULT -1;

-- AlterTable
ALTER TABLE "TypeUnitOrganization" DROP COLUMN "external_id",
ADD COLUMN     "external_id" INTEGER NOT NULL DEFAULT -1;

-- CreateIndex
CREATE UNIQUE INDEX "Organizations_external_id_key" ON "Organizations"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "PositionType_external_id_key" ON "PositionType"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Positions_external_id_key" ON "Positions"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Programs_external_id_key" ON "Programs"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "TypeUnitOrganization_external_id_key" ON "TypeUnitOrganization"("external_id");
