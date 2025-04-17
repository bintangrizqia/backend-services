/*
  Warnings:

  - The primary key for the `Personnels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Positions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Units` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `PerformanceManagementPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PerformanceManagementPlanTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Programs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectManagementPlanProgram` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectManagementType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Projects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[npp]` on the table `Personnels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `Positions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `Units` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Personnels` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `external_id` to the `Positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_position_id` to the `Positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_id` to the `Units` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PositionTypes" AS ENUM ('F', 'S');

-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_personnel_id_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlan" DROP CONSTRAINT "PerformanceManagementPlan_project_management_program_id_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlan" DROP CONSTRAINT "PerformanceManagementPlan_project_management_type_id_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" DROP CONSTRAINT "PMPTransaction_parent_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" DROP CONSTRAINT "PerformanceManagementPlanTransaction_code_position_from_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" DROP CONSTRAINT "PerformanceManagementPlanTransaction_code_position_target_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" DROP CONSTRAINT "PerformanceManagementPlanTransaction_performance_managemen_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" DROP CONSTRAINT "PerformanceManagementPlanTransaction_personnel_dari_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" DROP CONSTRAINT "PerformanceManagementPlanTransaction_personnel_tujuan_fkey";

-- DropForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" DROP CONSTRAINT "PerformanceManagementPlanTransaction_personnelsNpp_fkey";

-- DropForeignKey
ALTER TABLE "PersonnelGroups" DROP CONSTRAINT "PersonnelGroups_personnel_id_fkey";

-- DropForeignKey
ALTER TABLE "PersonnelPermissions" DROP CONSTRAINT "PersonnelPermissions_personnel_id_fkey";

-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_position_id_fkey";

-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_program_id_fkey";

-- DropForeignKey
ALTER TABLE "Units" DROP CONSTRAINT "Units_parent_id_fkey";

-- AlterTable
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "position_type" "PositionTypes" NOT NULL DEFAULT 'F',
ALTER COLUMN "unit_id" SET DATA TYPE TEXT,
ALTER COLUMN "position_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Personnels_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_pkey",
ADD COLUMN     "external_id" INTEGER NOT NULL,
ADD COLUMN     "type_position_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "unit_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Positions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Units" DROP CONSTRAINT "Units_pkey",
ADD COLUMN     "external_id" INTEGER NOT NULL,
ADD COLUMN     "position_type" "PositionTypes" NOT NULL DEFAULT 'F',
ADD COLUMN     "type_unit_id" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "parent_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Units_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "PerformanceManagementPlan";

-- DropTable
DROP TABLE "PerformanceManagementPlanTransaction";

-- DropTable
DROP TABLE "Programs";

-- DropTable
DROP TABLE "ProjectManagementPlanProgram";

-- DropTable
DROP TABLE "ProjectManagementType";

-- DropTable
DROP TABLE "Projects";

-- DropEnum
DROP TYPE "TypeProject";

-- CreateTable
CREATE TABLE "MasterTypeUnits" (
    "id" TEXT NOT NULL,
    "external_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level_type_unit" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTypeUnits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterTypePositions" (
    "id" TEXT NOT NULL,
    "external_id" INTEGER NOT NULL,
    "name_s" TEXT NOT NULL,
    "name_f" TEXT NOT NULL,
    "eselon" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTypePositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance_Managelement_Plan_Types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_Managelement_Plan_Types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterTypeUnits_external_id_key" ON "MasterTypeUnits"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "MasterTypePositions_external_id_key" ON "MasterTypePositions"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_Managelement_Plan_Types_name_key" ON "Performance_Managelement_Plan_Types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Personnels_npp_key" ON "Personnels"("npp");

-- CreateIndex
CREATE UNIQUE INDEX "Positions_external_id_key" ON "Positions"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Units_external_id_key" ON "Units"("external_id");

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelGroups" ADD CONSTRAINT "PersonnelGroups_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelPermissions" ADD CONSTRAINT "PersonnelPermissions_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_type_unit_id_fkey" FOREIGN KEY ("type_unit_id") REFERENCES "MasterTypeUnits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_type_position_id_fkey" FOREIGN KEY ("type_position_id") REFERENCES "MasterTypePositions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
