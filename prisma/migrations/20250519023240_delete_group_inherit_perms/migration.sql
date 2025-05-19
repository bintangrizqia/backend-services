-- DropForeignKey
ALTER TABLE "GroupPermissions" DROP CONSTRAINT "GroupPermissions_group_id_fkey";

-- AddForeignKey
ALTER TABLE "GroupPermissions" ADD CONSTRAINT "GroupPermissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
