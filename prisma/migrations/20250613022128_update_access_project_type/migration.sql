/*
  Warnings:

  - You are about to drop the column `project_id` on the `access_project_type` table. All the data in the column will be lost.
  - You are about to drop the column `type_id` on the `access_project_type` table. All the data in the column will be lost.
  - You are about to drop the column `unit_id` on the `access_project_type` table. All the data in the column will be lost.
  - Added the required column `keys` to the `access_project_type` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `access_project_type` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `access_project_type` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "access_project_type" DROP CONSTRAINT "access_project_type_project_id_fkey";

-- DropForeignKey
ALTER TABLE "access_project_type" DROP CONSTRAINT "access_project_type_type_id_fkey";

-- DropForeignKey
ALTER TABLE "access_project_type" DROP CONSTRAINT "access_project_type_unit_id_fkey";

-- AlterTable
ALTER TABLE "access_project_type" DROP COLUMN "project_id",
DROP COLUMN "type_id",
DROP COLUMN "unit_id",
ADD COLUMN     "keys" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "access_project_type" ADD CONSTRAINT "access_project_type_keys_fkey" FOREIGN KEY ("keys") REFERENCES "Performance_Management_Plan_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_project_type" ADD CONSTRAINT "access_project_type_type_fkey" FOREIGN KEY ("type") REFERENCES "Performance_Management_Plan_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
