-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'CAN_CREATE_PROGRAM';
ALTER TYPE "Permission" ADD VALUE 'CAN_DELETE_PROGRAM';
ALTER TYPE "Permission" ADD VALUE 'CAN_UPDATE_PROGRAM';
ALTER TYPE "Permission" ADD VALUE 'CAN_READ_PROGRAM';

-- AlterEnum
ALTER TYPE "Resource" ADD VALUE 'PROGRAM';

-- CreateIndex
CREATE INDEX "Performance_Management_Plan_Program_name_year_status_progra_idx" ON "Performance_Management_Plan_Program"("name", "year", "status", "program_code", "active");
