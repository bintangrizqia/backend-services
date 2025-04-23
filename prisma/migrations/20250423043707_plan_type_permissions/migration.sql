-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'CAN_CREATE_PLAN_TYPE';
ALTER TYPE "Permission" ADD VALUE 'CAN_DELETE_PLAN_TYPE';
ALTER TYPE "Permission" ADD VALUE 'CAN_UPDATE_PLAN_TYPE';
ALTER TYPE "Permission" ADD VALUE 'CAN_READ_PLAN_TYPE';

-- AlterEnum
ALTER TYPE "Resource" ADD VALUE 'PLAN_TYPES';
