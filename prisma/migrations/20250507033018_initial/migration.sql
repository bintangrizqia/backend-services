-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('CAN_READ_PERSONNEL', 'CAN_UPDATE_PERSONNEL', 'CAN_DELETE_PERSONNEL', 'CAN_CREATE_PERSONNEL', 'CAN_CREATE_ORGANIZATION', 'CAN_UPDATE_ORGANIZATION', 'CAN_DELETE_ORGANIZATION', 'CAN_READ_ORGANIZATION', 'CAN_CREATE_PROJECT', 'CAN_DELETE_PROJECT', 'CAN_UPDATE_PROJECT', 'CAN_ASSIGN_PROJECT', 'CAN_REASSIGN_PROJECT', 'CAN_CREATE_GROUP', 'CAN_READ_GROUP', 'CAN_UPDATE_GROUP', 'CAN_DELETE_GROUP', 'CAN_CREATE_PLAN_TYPE', 'CAN_DELETE_PLAN_TYPE', 'CAN_UPDATE_PLAN_TYPE', 'CAN_READ_PLAN_TYPE');

-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('PERSONNEL', 'PROJECT', 'ORGANIZATION', 'GROUP', 'PLAN_TYPES');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'OTHER');

-- CreateTable
CREATE TABLE "Personnels" (
    "id" TEXT NOT NULL,
    "npp" TEXT NOT NULL,
    "unit_id" INTEGER,
    "position_id" INTEGER,
    "position_type" TEXT,
    "photo" TEXT,
    "eselon" INTEGER,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Personnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPermissions" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "resource" "Resource" NOT NULL,
    "permission" "Permission" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonnelGroups" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonnelGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonnelPermissions" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "resource" "Resource" NOT NULL,
    "permission" "Permission" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonnelPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLogs" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "description" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "payload" JSONB,
    "status_code" INTEGER,
    "activity_type" "ActivityType" NOT NULL DEFAULT 'OTHER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterTypeUnits" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level_type_unit" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTypeUnits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Units" (
    "id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "type_unit_id" INTEGER,
    "name" TEXT NOT NULL,
    "position_type" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterTypePositions" (
    "id" INTEGER NOT NULL,
    "name_s" TEXT NOT NULL,
    "name_f" TEXT NOT NULL,
    "eselon" INTEGER NOT NULL,
    "level_type_position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTypePositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Positions" (
    "id" INTEGER NOT NULL,
    "unit_id" INTEGER,
    "type_position_id" INTEGER,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Positions_pkey" PRIMARY KEY ("id")
);

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_Management_Plan_Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Personnels_npp_key" ON "Personnels"("npp");

-- CreateIndex
CREATE INDEX "Personnels_name_email_idx" ON "Personnels"("name", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Groups_name_key" ON "Groups"("name");

-- CreateIndex
CREATE INDEX "Units_name_position_type_idx" ON "Units"("name", "position_type");

-- CreateIndex
CREATE INDEX "MasterTypePositions_name_f_name_s_idx" ON "MasterTypePositions"("name_f", "name_s");

-- CreateIndex
CREATE INDEX "Positions_name_active_idx" ON "Positions"("name", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_Management_Plan_Types_name_key" ON "Performance_Management_Plan_Types"("name");

-- CreateIndex
CREATE INDEX "Performance_Management_Plan_Types_name_idx" ON "Performance_Management_Plan_Types"("name");

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermissions" ADD CONSTRAINT "GroupPermissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelGroups" ADD CONSTRAINT "PersonnelGroups_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelGroups" ADD CONSTRAINT "PersonnelGroups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_type_position_id_fkey" FOREIGN KEY ("type_position_id") REFERENCES "MasterTypePositions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Performance_Management_Plan_Transactions" ADD CONSTRAINT "fk_pmp_project_parent" FOREIGN KEY ("performance_management_project_parent_id") REFERENCES "Performance_Management_Plan_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
