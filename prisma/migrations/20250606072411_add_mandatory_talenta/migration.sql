/*
  Warnings:

  - Added the required column `plan_type_id` to the `MandatoryTalenta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MandatoryTalenta" ADD COLUMN     "plan_type_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "MandatoryTalenta_plan_type_id_idx" ON "MandatoryTalenta"("plan_type_id");

-- AddForeignKey
ALTER TABLE "MandatoryTalenta" ADD CONSTRAINT "MandatoryTalenta_plan_type_id_fkey" FOREIGN KEY ("plan_type_id") REFERENCES "Performance_Management_Plan_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
