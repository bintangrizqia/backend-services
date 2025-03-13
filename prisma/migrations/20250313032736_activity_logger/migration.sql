-- CreateEnum
CREATE TYPE "TypeProject" AS ENUM ('STRETCH_ACTIVITY', 'TRAINING', 'KPI_DIVISI');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'OTHER');

-- CreateTable
CREATE TABLE "Organizations" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonnelOrganizations" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonnelOrganizations_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Programs_code_key" ON "Programs"("code");

-- AddForeignKey
ALTER TABLE "Organizations" ADD CONSTRAINT "Organizations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelOrganizations" ADD CONSTRAINT "PersonnelOrganizations_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelOrganizations" ADD CONSTRAINT "PersonnelOrganizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
