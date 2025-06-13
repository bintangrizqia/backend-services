/*
  Warnings:

  - You are about to drop the `Mandatory_Talenta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Mandatory_Talenta";

-- CreateTable
CREATE TABLE "MandatoryTalenta" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MandatoryTalenta_pkey" PRIMARY KEY ("id")
);
