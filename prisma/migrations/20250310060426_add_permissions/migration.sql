/*
  Warnings:

  - You are about to drop the column `is_staff` on the `Personnels` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'DELETE', 'UPDATE', 'CREATE');

-- AlterTable
ALTER TABLE "Personnels" DROP COLUMN "is_staff";

-- CreateTable
CREATE TABLE "Resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPermissions" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonnelGroups" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonnelGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonnelPermissions" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonnelPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resources_name_key" ON "Resources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Groups_name_key" ON "Groups"("name");

-- AddForeignKey
ALTER TABLE "GroupPermissions" ADD CONSTRAINT "GroupPermissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermissions" ADD CONSTRAINT "GroupPermissions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelGroups" ADD CONSTRAINT "PersonnelGroups_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelGroups" ADD CONSTRAINT "PersonnelGroups_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelPermissions" ADD CONSTRAINT "PersonnelPermissions_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "Personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelPermissions" ADD CONSTRAINT "PersonnelPermissions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
