/*
  Warnings:

  - You are about to drop the `ContentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserInGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupPermission" DROP CONSTRAINT "GroupPermission_group_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupPermission" DROP CONSTRAINT "GroupPermission_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_content_type_id_fkey";

-- DropForeignKey
ALTER TABLE "UserInGroup" DROP CONSTRAINT "UserInGroup_group_id_fkey";

-- DropForeignKey
ALTER TABLE "UserInGroup" DROP CONSTRAINT "UserInGroup_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_user_id_fkey";

-- DropTable
DROP TABLE "ContentType";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "GroupPermission";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "UserInGroup";

-- DropTable
DROP TABLE "UserPermission";

-- DropEnum
DROP TYPE "PermissionOperation";
