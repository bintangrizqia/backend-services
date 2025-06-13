/*
  Warnings:

  - You are about to drop the column `description` on the `MandatoryTalenta` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `MandatoryTalenta` table. All the data in the column will be lost.
  - You are about to drop the column `plan_type_id` on the `MandatoryTalenta` table. All the data in the column will be lost.
  - Added the required column `key` to the `MandatoryTalenta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project` to the `MandatoryTalenta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `MandatoryTalenta` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MandatoryTalenta" DROP CONSTRAINT "MandatoryTalenta_plan_type_id_fkey";

-- DropIndex
DROP INDEX "MandatoryTalenta_plan_type_id_idx";

-- AlterTable
ALTER TABLE "MandatoryTalenta" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "plan_type_id",
ADD COLUMN     "information" TEXT,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "project" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "MandatoryTalenta_key_idx" ON "MandatoryTalenta"("key");

-- AddForeignKey
ALTER TABLE "MandatoryTalenta" ADD CONSTRAINT "MandatoryTalenta_key_fkey" FOREIGN KEY ("key") REFERENCES "Performance_Management_Plan_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
