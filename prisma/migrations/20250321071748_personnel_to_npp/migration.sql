/*
  Warnings:

  - The primary key for the `Personnels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Personnels` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `Positions` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `Programs` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `Units` table. All the data in the column will be lost.
  - Made the column `personnel_id` on table `ActivityLogs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_personnel_id_fkey";

-- DropForeignKey
ALTER TABLE "PersonnelGroups" DROP CONSTRAINT "PersonnelGroups_personnel_id_fkey";

-- DropForeignKey
ALTER TABLE "PersonnelPermissions" DROP CONSTRAINT "PersonnelPermissions_personnel_id_fkey";

-- DropIndex
DROP INDEX "Personnels_npp_key";

-- DropIndex
DROP INDEX "Positions_external_id_key";

-- DropIndex
DROP INDEX "Programs_external_id_key";

-- DropIndex
DROP INDEX "Units_external_id_key";

-- AlterTable
ALTER TABLE "ActivityLogs" ALTER COLUMN "personnel_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Personnels_pkey" PRIMARY KEY ("npp");

-- AlterTable
ALTER TABLE "Positions" DROP COLUMN "external_id";

-- AlterTable
ALTER TABLE "Programs" DROP COLUMN "external_id";

-- AlterTable
ALTER TABLE "Units" DROP COLUMN "external_id";

-- AddForeignKey
ALTER TABLE "PersonnelGroups" ADD CONSTRAINT "PersonnelGroups_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("npp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelPermissions" ADD CONSTRAINT "PersonnelPermissions_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("npp") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("npp") ON DELETE RESTRICT ON UPDATE CASCADE;
