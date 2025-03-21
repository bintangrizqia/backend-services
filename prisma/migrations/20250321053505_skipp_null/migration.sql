-- DropForeignKey
ALTER TABLE "Organizations" DROP CONSTRAINT "Organizations_type_unit_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Positions" DROP CONSTRAINT "Positions_organization_id_fkey";

-- AlterTable
ALTER TABLE "Organizations" ALTER COLUMN "type_unit_organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Positions" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Organizations" ADD CONSTRAINT "Organizations_type_unit_organization_id_fkey" FOREIGN KEY ("type_unit_organization_id") REFERENCES "TypeUnitOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
