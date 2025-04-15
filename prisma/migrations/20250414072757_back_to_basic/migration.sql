/*
  Warnings:

  - You are about to drop the column `is_permanent` on the `Groups` table. All the data in the column will be lost.
  - Added the required column `resource` to the `GroupPermissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `PersonnelPermissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('PERSONNEL', 'PROJECT', 'ORGANIZATION');

-- DropIndex
DROP INDEX "Groups_name_idx";

-- DropIndex
DROP INDEX "PerformanceManagementPlan_key_nama_tagret_owner_created_by_idx";

-- DropIndex
DROP INDEX "Positions_name_idx";

-- DropIndex
DROP INDEX "Programs_code_name_key";

-- DropIndex
DROP INDEX "ProjectManagementPlanProgram_nama_tahun_kode_program_idx";

-- DropIndex
DROP INDEX "ProjectManagementType_nama_idx";

-- AlterTable
ALTER TABLE "GroupPermissions" ADD COLUMN     "resource" "Resource" NOT NULL;

-- AlterTable
ALTER TABLE "Groups" DROP COLUMN "is_permanent";

-- AlterTable
ALTER TABLE "PersonnelPermissions" ADD COLUMN     "resource" "Resource" NOT NULL;
