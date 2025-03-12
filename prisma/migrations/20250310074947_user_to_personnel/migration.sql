/*
  Warnings:

  - The values [USER] on the enum `Resource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Resource_new" AS ENUM ('PERSONNEL', 'PROJECT');
ALTER TABLE "GroupPermissions" ALTER COLUMN "resource" TYPE "Resource_new" USING ("resource"::text::"Resource_new");
ALTER TABLE "PersonnelPermissions" ALTER COLUMN "resource" TYPE "Resource_new" USING ("resource"::text::"Resource_new");
ALTER TYPE "Resource" RENAME TO "Resource_old";
ALTER TYPE "Resource_new" RENAME TO "Resource";
DROP TYPE "Resource_old";
COMMIT;
