/*
  Warnings:

  - You are about to drop the column `resource` on the `GroupPermissions` table. All the data in the column will be lost.
  - You are about to drop the column `resource` on the `PersonnelPermissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GroupPermissions" DROP COLUMN "resource";

-- AlterTable
ALTER TABLE "PersonnelPermissions" DROP COLUMN "resource";

-- DropEnum
DROP TYPE "Resource";
