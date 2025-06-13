-- CreateTable
CREATE TABLE "overview_talenta" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "type_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "information" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overview_talenta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "overview_talenta" ADD CONSTRAINT "overview_talenta_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Performance_Management_Plan_Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overview_talenta" ADD CONSTRAINT "overview_talenta_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overview_talenta" ADD CONSTRAINT "overview_talenta_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "Performance_Management_Plan_Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
