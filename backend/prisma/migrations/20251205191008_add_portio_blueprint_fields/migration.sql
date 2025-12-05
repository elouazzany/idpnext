/*
  Warnings:

  - You are about to drop the column `icon` on the `CatalogFolder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blueprint" ADD COLUMN     "changelogDestination" JSONB,
ADD COLUMN     "team" JSONB,
ADD COLUMN     "teamInheritance" JSONB;

-- AlterTable
ALTER TABLE "CatalogFolder" DROP COLUMN "icon";
