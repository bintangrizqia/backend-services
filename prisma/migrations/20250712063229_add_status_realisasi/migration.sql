-- AlterEnum
ALTER TYPE "Resource" ADD VALUE 'OVERVIEW_DIVISION';

-- CreateTable
CREATE TABLE "StatusRealisasi" (
    "id" SERIAL NOT NULL,
    "nama_status_realisasi" TEXT NOT NULL,
    "kode_warna_realisasi" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusRealisasi_pkey" PRIMARY KEY ("id")
);
