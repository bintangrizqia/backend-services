/*
  Warnings:

  - Added the required column `level_type_position` to the `MasterTypePositions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MasterTypePositions" ADD COLUMN     "level_type_position" INTEGER NOT NULL;
