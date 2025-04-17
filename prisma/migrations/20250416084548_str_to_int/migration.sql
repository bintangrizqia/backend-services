/*
  Warnings:

  - The `position_id` column on the `Personnels` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Positions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `external_id` on the `Positions` table. All the data in the column will be lost.
  - Changed the type of `id` on the `Positions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Personnels" DROP CONSTRAINT "Personnels_position_id_fkey";

-- DropIndex
DROP INDEX "Positions_external_id_key";

-- AlterTable
ALTER TABLE "Personnels" DROP COLUMN "position_id",
ADD COLUMN     "position_id" INTEGER;

-- AlterTable
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_pkey",
DROP COLUMN "external_id",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Positions_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
