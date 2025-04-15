/*
  Warnings:

  - A unique constraint covering the columns `[code,name]` on the table `Programs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'CAN_CREATE_GROUP';
ALTER TYPE "Permission" ADD VALUE 'CAN_READ_GROUP';
ALTER TYPE "Permission" ADD VALUE 'CAN_UPDATE_GROUP';
ALTER TYPE "Permission" ADD VALUE 'CAN_DELETE_GROUP';

-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "is_permanent" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Groups_name_idx" ON "Groups"("name");

-- CreateIndex
CREATE INDEX "PerformanceManagementPlan_key_nama_tagret_owner_created_by_idx" ON "PerformanceManagementPlan"("key", "nama", "tagret", "owner", "created_by");

-- CreateIndex
CREATE INDEX "Positions_name_idx" ON "Positions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Programs_code_name_key" ON "Programs"("code", "name");

-- CreateIndex
CREATE INDEX "ProjectManagementPlanProgram_nama_tahun_kode_program_idx" ON "ProjectManagementPlanProgram"("nama", "tahun", "kode_program");

-- CreateIndex
CREATE INDEX "ProjectManagementType_nama_idx" ON "ProjectManagementType"("nama");
