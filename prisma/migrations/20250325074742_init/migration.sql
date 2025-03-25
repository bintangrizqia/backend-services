-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'DELETE', 'UPDATE', 'CREATE');

-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('PERSONNEL', 'PROJECT');

-- CreateEnum
CREATE TYPE "TypeProject" AS ENUM ('STRETCH_ACTIVITY', 'TRAINING', 'KPI_DIVISI');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'OTHER');

-- CreateTable
CREATE TABLE "Personnels" (
    "npp" TEXT NOT NULL,
    "unit_id" INTEGER,
    "position_id" INTEGER,
    "photo" TEXT,
    "eselon" INTEGER NOT NULL DEFAULT 5,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Personnels_pkey" PRIMARY KEY ("npp")
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
CREATE TABLE "Programs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projects" (
    "id" TEXT NOT NULL,
    "type_project" "TypeProject" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "program_id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "information" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Units" (
    "id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Positions" (
    "id" INTEGER NOT NULL,
    "unit_id" INTEGER,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Groups_name_key" ON "Groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Programs_code_key" ON "Programs"("code");

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermissions" ADD CONSTRAINT "GroupPermissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelGroups" ADD CONSTRAINT "PersonnelGroups_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("npp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelGroups" ADD CONSTRAINT "PersonnelGroups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelPermissions" ADD CONSTRAINT "PersonnelPermissions_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("npp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("npp") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
