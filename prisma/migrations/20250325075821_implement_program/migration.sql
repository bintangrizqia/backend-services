-- CreateTable
CREATE TABLE "ProjectManagementType" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectManagementType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectManagementPlanProgram" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "description" TEXT,
    "tahun" INTEGER NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL,
    "kode_program" TEXT NOT NULL,
    "active" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectManagementPlanProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceManagementPlan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tagret" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "status_project_kpi" TEXT NOT NULL,
    "status_approved" INTEGER NOT NULL,
    "description" TEXT,
    "created_by" TEXT,
    "tahun" INTEGER NOT NULL,
    "project_management_type_id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceManagementPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlan" ADD CONSTRAINT "PerformanceManagementPlan_project_management_type_id_fkey" FOREIGN KEY ("project_management_type_id") REFERENCES "ProjectManagementType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceManagementPlan" ADD CONSTRAINT "PerformanceManagementPlan_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "ProjectManagementPlanProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
