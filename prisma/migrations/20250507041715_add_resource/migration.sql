/*
  Warnings:

  - The values [CAN_CREATE_USER,CAN_DELETE_USER,CAN_UPDATE_USER,CAN_READ_USER] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `resource` to the `GroupPermissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `PersonnelPermissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('PERSONNEL', 'PROJECT', 'ORGANIZATION', 'GROUP', 'PLAN_TYPES');

-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('CAN_READ_PERSONNEL', 'CAN_UPDATE_PERSONNEL', 'CAN_DELETE_PERSONNEL', 'CAN_CREATE_PERSONNEL', 'CAN_CREATE_ORGANIZATION', 'CAN_UPDATE_ORGANIZATION', 'CAN_DELETE_ORGANIZATION', 'CAN_READ_ORGANIZATION', 'CAN_CREATE_PROJECT', 'CAN_DELETE_PROJECT', 'CAN_UPDATE_PROJECT', 'CAN_ASSIGN_PROJECT', 'CAN_REASSIGN_PROJECT', 'CAN_CREATE_GROUP', 'CAN_READ_GROUP', 'CAN_UPDATE_GROUP', 'CAN_DELETE_GROUP', 'CAN_CREATE_PLAN_TYPE', 'CAN_DELETE_PLAN_TYPE', 'CAN_UPDATE_PLAN_TYPE', 'CAN_READ_PLAN_TYPE');
ALTER TABLE "GroupPermissions" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TABLE "PersonnelPermissions" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "Permission_old";
COMMIT;

-- AlterTable
ALTER TABLE "GroupPermissions" ADD COLUMN     "resource" "Resource" NOT NULL;

-- AlterTable
ALTER TABLE "PersonnelPermissions" ADD COLUMN     "resource" "Resource" NOT NULL;
