-- AlterTable
ALTER TABLE "Organizations" ALTER COLUMN "external_id" DROP DEFAULT,
ALTER COLUMN "external_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PositionType" ALTER COLUMN "external_id" DROP DEFAULT,
ALTER COLUMN "external_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Positions" ALTER COLUMN "external_id" DROP DEFAULT,
ALTER COLUMN "external_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Programs" ALTER COLUMN "external_id" DROP DEFAULT,
ALTER COLUMN "external_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TypeUnitOrganization" ALTER COLUMN "external_id" DROP DEFAULT,
ALTER COLUMN "external_id" SET DATA TYPE TEXT;
