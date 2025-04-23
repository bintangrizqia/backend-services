/*
  Warnings:

  - You are about to drop the `Performance_Managelement_Plan_Types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Performance_Managelement_Plan_Types";

-- CreateTable
CREATE TABLE "Performance_Management_Plan_Types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_Management_Plan_Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance_Management_Plan_Projects" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "project_status" TEXT NOT NULL,
    "approval_status" INTEGER NOT NULL,
    "description" TEXT,
    "created_by" TEXT,
    "year" INTEGER NOT NULL,
    "performance_management_plan_type_id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "performance_management_plan_program_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_Management_Plan_Projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance_Management_Plan_Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "program_code" TEXT NOT NULL,
    "active" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_Management_Plan_Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance_Management_Plan_Transactions" (
    "id" TEXT NOT NULL,
    "personnel_target_id" TEXT NOT NULL,
    "position_target_id" INTEGER NOT NULL,
    "performance_management_project_id" TEXT NOT NULL,
    "performance_management_project_parent_id" TEXT NOT NULL,
    "approved_status" INTEGER NOT NULL,
    "realization" TEXT NOT NULL,
    "realization_status" INTEGER NOT NULL,
    "description" TEXT,
    "personnel_from_id" TEXT NOT NULL,
    "position_from_id" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "activity_project" TEXT NOT NULL,
    "activity_target" TEXT NOT NULL,
    "activity_unit" TEXT NOT NULL,
    "boss_who_creating_an_activity" TEXT NOT NULL,
    "project_active_status" TEXT NOT NULL,
    "realization_active_status" TEXT NOT NULL,
    "performance_management_plan_program_id" TEXT NOT NULL,
    "realization_boss_who_create_an_activity_percentage" INTEGER NOT NULL,
    "realization_self_percentage" INTEGER NOT NULL,
    "note" TEXT,
    "realization_boss_who_create_an_activity_percentage_real" INTEGER NOT NULL,
    "realization_self_percentage_real" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_Management_Plan_Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Performance_Management_Plan_Types_name_key" ON "Performance_Management_Plan_Types"("name");

-- CreateIndex
CREATE INDEX "Performance_Management_Plan_Types_name_idx" ON "Performance_Management_Plan_Types"("name");

-- CreateIndex
CREATE INDEX "MasterTypePositions_name_f_name_s_idx" ON "MasterTypePositions"("name_f", "name_s");

-- CreateIndex
CREATE INDEX "Personnels_name_email_idx" ON "Personnels"("name", "email");

-- CreateIndex
CREATE INDEX "Positions_name_active_idx" ON "Positions"("name", "active");

-- CreateIndex
CREATE INDEX "Units_name_position_type_idx" ON "Units"("name", "position_type");

-- AddForeignKey
ALTER TABLE "Performance_Management_Plan_Projects" ADD CONSTRAINT "fk_plan_type" FOREIGN KEY ("performance_management_plan_type_id") REFERENCES "Performance_Management_Plan_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance_Management_Plan_Projects" ADD CONSTRAINT "fk_plan_program" FOREIGN KEY ("performance_management_plan_program_id") REFERENCES "Performance_Management_Plan_Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance_Management_Plan_Transactions" ADD CONSTRAINT "fk_personnel_target" FOREIGN KEY ("personnel_target_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance_Management_Plan_Transactions" ADD CONSTRAINT "fk_personnel_from" FOREIGN KEY ("personnel_from_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance_Management_Plan_Transactions" ADD CONSTRAINT "fk_position_target" FOREIGN KEY ("position_target_id") REFERENCES "Positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance_Management_Plan_Transactions" ADD CONSTRAINT "fk_position_from" FOREIGN KEY ("position_from_id") REFERENCES "Positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance_Management_Plan_Transactions" ADD CONSTRAINT "fk_pmp_project" FOREIGN KEY ("performance_management_project_id") REFERENCES "Performance_Management_Plan_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance_Management_Plan_Transactions" ADD CONSTRAINT "fk_pmp_project_parent" FOREIGN KEY ("performance_management_project_id") REFERENCES "Performance_Management_Plan_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
