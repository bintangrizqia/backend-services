/*
  Warnings:

  - The values [READ,DELETE,UPDATE,CREATE] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `resource` on the `GroupPermissions` table. All the data in the column will be lost.
  - You are about to drop the column `resource` on the `PersonnelPermissions` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('CAN_READ_PERSONNEL', 'CAN_UPDATE_PERSONNEL', 'CAN_DELETE_PERSONNEL', 'CAN_CREATE_PERSONNEL', 'CAN_CREATE_ORGANIZATION', 'CAN_UPDATE_ORGANIZATION', 'CAN_DELETE_ORGANIZATION', 'CAN_READ_ORGANIZATION', 'CAN_CREATE_PROJECT', 'CAN_DELETE_PROJECT', 'CAN_UPDATE_PROJECT', 'CAN_ASSIGN_PROJECT', 'CAN_REASSIGN_PROJECT');
ALTER TABLE "GroupPermissions" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TABLE "PersonnelPermissions" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "Permission_old";
COMMIT;

-- AlterTable
ALTER TABLE "GroupPermissions" DROP COLUMN "resource";

-- AlterTable
ALTER TABLE "PersonnelPermissions" DROP COLUMN "resource";

-- DropEnum
DROP TYPE "Resource";
