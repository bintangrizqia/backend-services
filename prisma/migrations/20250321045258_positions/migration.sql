-- AlterTable
ALTER TABLE "Personnels" ADD COLUMN     "eselon" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "PositionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PositionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Positions" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "position_type_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Positions_external_id_key" ON "Positions"("external_id");

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_position_type_id_fkey" FOREIGN KEY ("position_type_id") REFERENCES "PositionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
