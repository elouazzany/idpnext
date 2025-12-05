/*
  Warnings:

  - You are about to drop the column `team` on the `Blueprint` table. All the data in the column will be lost.
  - You are about to drop the column `teamInheritance` on the `Blueprint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blueprint" DROP COLUMN "team",
DROP COLUMN "teamInheritance";
