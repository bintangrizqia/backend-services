/*
  Warnings:

  - The `unit_id` column on the `Personnels` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `unit_id` column on the `Positions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Units` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `external_id` on the `Units` table. All the data in the column will be lost.
  - The `parent_id` column on the `Units` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `Units` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "Units" DROP CONSTRAINT "Units_parent_id_fkey";

-- DropIndex
DROP INDEX "Units_external_id_key";

-- AlterTable
ALTER TABLE "Personnels" DROP COLUMN "unit_id",
ADD COLUMN     "unit_id" INTEGER;

-- AlterTable
ALTER TABLE "Positions" DROP COLUMN "unit_id",
ADD COLUMN     "unit_id" INTEGER;

-- AlterTable
ALTER TABLE "Units" DROP CONSTRAINT "Units_pkey",
DROP COLUMN "external_id",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
DROP COLUMN "parent_id",
ADD COLUMN     "parent_id" INTEGER,
ADD CONSTRAINT "Units_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
