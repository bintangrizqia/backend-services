/*
  Warnings:

  - You are about to drop the `PersonnelOrganizations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PersonnelOrganizations" DROP CONSTRAINT "PersonnelOrganizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "PersonnelOrganizations" DROP CONSTRAINT "PersonnelOrganizations_personnel_id_fkey";

-- AlterTable
ALTER TABLE "Personnels" ADD COLUMN     "organization_id" TEXT;

-- DropTable
DROP TABLE "PersonnelOrganizations";

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
