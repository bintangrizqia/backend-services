/*
  Warnings:

  - You are about to drop the column `program_id` on the `PerformanceManagementPlan` table. All the data in the column will be lost.
  - Added the required column `project_management_program_id` to the `PerformanceManagementPlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PerformanceManagementPlan" DROP CONSTRAINT "PerformanceManagementPlan_program_id_fkey";

-- AlterTable
ALTER TABLE "PerformanceManagementPlan" DROP COLUMN "program_id",
ADD COLUMN     "project_management_program_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PerformanceManagementPlanTransaction" (
    "id" TEXT NOT NULL,
    "personnel_tujuan" TEXT NOT NULL,
    "code_position_target" INTEGER NOT NULL,
    "performance_management_plan_id" TEXT NOT NULL,
    "performance_management_plan_transaction_id" TEXT,
    "status_approved" BOOLEAN NOT NULL,
    "realisasi" BOOLEAN NOT NULL,
    "status_realisasi" BOOLEAN NOT NULL,
    "keterangan" TEXT,
    "personnel_dari" TEXT NOT NULL,
    "code_position_from" INTEGER NOT NULL,
    "batas_pengerjaan" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_date" TIMESTAMP(3),
    "tahun" INTEGER NOT NULL,
    "activity_project" TEXT,
    "target_activity" TEXT,
    "satuan_activity" TEXT,
    "realisasi_atasan_pembuat_activity" BOOLEAN,
    "deskripsi" TEXT,
    "status_active_project" BOOLEAN,
    "status_active_realisasi" BOOLEAN,
    "project_management_program_id" TEXT,
    "realisasi_atasan_pembuat_activity_prosentase" DOUBLE PRECISION,
    "realisasi_pribadi_prosentase" DOUBLE PRECISION,
    "catatan" TEXT,
    "realisasi_pribadi_prosentase_asli" DOUBLE PRECISION,
    "realisasi_atasan_pembuat_activity_prosentase_asli" DOUBLE PRECISION,
    "modified_by" TEXT,
    "modified_date" TIMESTAMP(3),
    "personnelsNpp" TEXT,

    CONSTRAINT "PerformanceManagementPlanTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlan" ADD CONSTRAINT "PerformanceManagementPlan_project_management_program_id_fkey" FOREIGN KEY ("project_management_program_id") REFERENCES "ProjectManagementPlanProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" ADD CONSTRAINT "PerformanceManagementPlanTransaction_performance_managemen_fkey" FOREIGN KEY ("performance_management_plan_id") REFERENCES "PerformanceManagementPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" ADD CONSTRAINT "PMPTransaction_parent_fkey" FOREIGN KEY ("performance_management_plan_transaction_id") REFERENCES "PerformanceManagementPlanTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" ADD CONSTRAINT "PerformanceManagementPlanTransaction_personnel_tujuan_fkey" FOREIGN KEY ("personnel_tujuan") REFERENCES "Personnels"("npp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" ADD CONSTRAINT "PerformanceManagementPlanTransaction_personnel_dari_fkey" FOREIGN KEY ("personnel_dari") REFERENCES "Personnels"("npp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" ADD CONSTRAINT "PerformanceManagementPlanTransaction_code_position_target_fkey" FOREIGN KEY ("code_position_target") REFERENCES "Positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" ADD CONSTRAINT "PerformanceManagementPlanTransaction_code_position_from_fkey" FOREIGN KEY ("code_position_from") REFERENCES "Positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlanTransaction" ADD CONSTRAINT "PerformanceManagementPlanTransaction_personnelsNpp_fkey" FOREIGN KEY ("personnelsNpp") REFERENCES "Personnels"("npp") ON DELETE SET NULL ON UPDATE CASCADE;
