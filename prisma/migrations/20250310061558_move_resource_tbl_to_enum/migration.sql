/*
  Warnings:

  - You are about to drop the column `resource_id` on the `GroupPermissions` table. All the data in the column will be lost.
  - You are about to drop the column `resource_id` on the `PersonnelPermissions` table. All the data in the column will be lost.
  - You are about to drop the `Resources` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `resource` to the `GroupPermissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `PersonnelPermissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('USER', 'PROJECT');

-- DropForeignKey
ALTER TABLE "GroupPermissions" DROP CONSTRAINT "GroupPermissions_resource_id_fkey";

-- DropForeignKey
ALTER TABLE "PersonnelPermissions" DROP CONSTRAINT "PersonnelPermissions_resource_id_fkey";

-- AlterTable
ALTER TABLE "GroupPermissions" DROP COLUMN "resource_id",
ADD COLUMN     "resource" "Resource" NOT NULL;

-- AlterTable
ALTER TABLE "PersonnelPermissions" DROP COLUMN "resource_id",
ADD COLUMN     "resource" "Resource" NOT NULL;

-- DropTable
DROP TABLE "Resources";
