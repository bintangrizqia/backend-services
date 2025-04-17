/*
  Warnings:

  - The `position_type` column on the `Personnels` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `position_type` column on the `Units` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Personnels" DROP COLUMN "position_type",
ADD COLUMN     "position_type" TEXT;

-- AlterTable
ALTER TABLE "Units" DROP COLUMN "position_type",
ADD COLUMN     "position_type" TEXT;

-- DropEnum
DROP TYPE "PositionTypes";
