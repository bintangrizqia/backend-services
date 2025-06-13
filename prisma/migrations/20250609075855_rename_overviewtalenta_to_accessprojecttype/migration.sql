/*
  Warnings:

  - You are about to drop the `overview_talenta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "overview_talenta" DROP CONSTRAINT "overview_talenta_project_id_fkey";

-- DropForeignKey
ALTER TABLE "overview_talenta" DROP CONSTRAINT "overview_talenta_type_id_fkey";

-- DropForeignKey
ALTER TABLE "overview_talenta" DROP CONSTRAINT "overview_talenta_unit_id_fkey";

-- DropTable
DROP TABLE "overview_talenta";

-- CreateTable
CREATE TABLE "access_project_type" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "type_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "information" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_project_type_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "access_project_type" ADD CONSTRAINT "access_project_type_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Performance_Management_Plan_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_project_type" ADD CONSTRAINT "access_project_type_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_project_type" ADD CONSTRAINT "access_project_type_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "Performance_Management_Plan_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
