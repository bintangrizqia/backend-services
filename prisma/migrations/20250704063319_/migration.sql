-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'CAN_CREATE_MANDATORY_TALENTA';
ALTER TYPE "Permission" ADD VALUE 'CAN_READ_MANDATORY_TALENTA';
ALTER TYPE "Permission" ADD VALUE 'CAN_UPDATE_MANDATORY_TALENTA';
ALTER TYPE "Permission" ADD VALUE 'CAN_DELETE_MANDATORY_TALENTA';
ALTER TYPE "Permission" ADD VALUE 'CAN_CREATE_ACCESS_PROJECT_TYPE';
ALTER TYPE "Permission" ADD VALUE 'CAN_READ_ACCESS_PROJECT_TYPE';
ALTER TYPE "Permission" ADD VALUE 'CAN_UPDATE_ACCESS_PROJECT_TYPE';
ALTER TYPE "Permission" ADD VALUE 'CAN_DELETE_ACCESS_PROJECT_TYPE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Resource" ADD VALUE 'MANDATORY_TALENTA';
ALTER TYPE "Resource" ADD VALUE 'ACCESS_PROJECT_TYPE';

-- CreateTable
CREATE TABLE "MandatoryTalenta" (
    "id" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "information" TEXT,
    "key" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MandatoryTalenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_project_type" (
    "id" TEXT NOT NULL,
    "keys" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "information" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_project_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverviewDivision" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "due_date" TIMESTAMP(3),
    "information" TEXT,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OverviewDivision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MandatoryTalenta_key_idx" ON "MandatoryTalenta"("key");

-- AddForeignKey
ALTER TABLE "MandatoryTalenta" ADD CONSTRAINT "MandatoryTalenta_key_fkey" FOREIGN KEY ("key") REFERENCES "Performance_Management_Plan_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_project_type" ADD CONSTRAINT "access_project_type_keys_fkey" FOREIGN KEY ("keys") REFERENCES "Performance_Management_Plan_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_project_type" ADD CONSTRAINT "access_project_type_type_fkey" FOREIGN KEY ("type") REFERENCES "Performance_Management_Plan_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverviewDivision" ADD CONSTRAINT "OverviewDivision_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverviewDivision" ADD CONSTRAINT "OverviewDivision_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Performance_Management_Plan_Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverviewDivision" ADD CONSTRAINT "OverviewDivision_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Performance_Management_Plan_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverviewDivision" ADD CONSTRAINT "OverviewDivision_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Performance_Management_Plan_Transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
