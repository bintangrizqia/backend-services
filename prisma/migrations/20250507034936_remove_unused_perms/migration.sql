/*
  Warnings:

  - The values [CAN_UPDATE_PERSONNEL,CAN_DELETE_PERSONNEL,CAN_CREATE_PERSONNEL,CAN_CREATE_ORGANIZATION,CAN_UPDATE_ORGANIZATION,CAN_DELETE_ORGANIZATION,CAN_CREATE_GROUP,CAN_READ_GROUP,CAN_UPDATE_GROUP,CAN_DELETE_GROUP] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('CAN_READ_PERSONNEL', 'CAN_READ_ORGANIZATION', 'CAN_CREATE_PROJECT', 'CAN_DELETE_PROJECT', 'CAN_UPDATE_PROJECT', 'CAN_ASSIGN_PROJECT', 'CAN_REASSIGN_PROJECT', 'CAN_CREATE_PLAN_TYPE', 'CAN_DELETE_PLAN_TYPE', 'CAN_UPDATE_PLAN_TYPE', 'CAN_READ_PLAN_TYPE');
ALTER TABLE "GroupPermissions" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TABLE "PersonnelPermissions" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "Permission_old";
COMMIT;
