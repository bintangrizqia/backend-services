-- CreateTable
CREATE TABLE "Mandatory_Talenta" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mandatory_Talenta_pkey" PRIMARY KEY ("id")
);
