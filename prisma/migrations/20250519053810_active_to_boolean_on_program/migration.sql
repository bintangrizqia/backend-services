/*
  Warnings:

  - The `active` column on the `Performance_Management_Plan_Program` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Performance_Management_Plan_Program" DROP COLUMN "active",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
