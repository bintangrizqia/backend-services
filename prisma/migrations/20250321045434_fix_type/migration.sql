/*
  Warnings:

  - You are about to drop the column `exnternal_id` on the `PositionType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[external_id]` on the table `PositionType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_id` to the `PositionType` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PositionType_exnternal_id_key";

-- AlterTable
ALTER TABLE "PositionType" DROP COLUMN "exnternal_id",
ADD COLUMN     "external_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PositionType_external_id_key" ON "PositionType"("external_id");
