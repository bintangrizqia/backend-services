/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `Organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `Programs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_id` to the `Organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_unit_organization_id` to the `Organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_id` to the `Programs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `due_date` to the `Projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program_id` to the `Projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `Projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_project` to the `Projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organizations" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "external_id" TEXT NOT NULL,
ADD COLUMN     "type_unit_organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Programs" ADD COLUMN     "external_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "due_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "information" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "program_id" TEXT NOT NULL,
ADD COLUMN     "target" TEXT NOT NULL,
ADD COLUMN     "type_project" "TypeProject" NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "TypeUnitOrganization" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeUnitOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TypeUnitOrganization_external_id_key" ON "TypeUnitOrganization"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "TypeUnitOrganization_name_key" ON "TypeUnitOrganization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organizations_external_id_key" ON "Organizations"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Programs_external_id_key" ON "Programs"("external_id");

-- AddForeignKey
ALTER TABLE "Organizations" ADD CONSTRAINT "Organizations_type_unit_organization_id_fkey" FOREIGN KEY ("type_unit_organization_id") REFERENCES "TypeUnitOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
