/*
  Warnings:

  - A unique constraint covering the columns `[exnternal_id]` on the table `PositionType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `exnternal_id` to the `PositionType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PositionType" ADD COLUMN     "exnternal_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PositionType_exnternal_id_key" ON "PositionType"("exnternal_id");
