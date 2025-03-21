/*
  Warnings:

  - Added the required column `position_id` to the `Personnels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_id` to the `Personnels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Personnels" ADD COLUMN     "position_id" TEXT NOT NULL,
ADD COLUMN     "unit_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Units" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "external_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Positions" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "external_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Units_external_id_key" ON "Units"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Positions_external_id_key" ON "Positions"("external_id");

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personnels" ADD CONSTRAINT "Personnels_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
