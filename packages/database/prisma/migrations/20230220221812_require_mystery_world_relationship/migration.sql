/*
  Warnings:

  - Made the column `worldId` on table `Mystery` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Mystery" DROP CONSTRAINT "Mystery_worldId_fkey";

-- AlterTable
ALTER TABLE "Mystery" ALTER COLUMN "worldId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Mystery" ADD CONSTRAINT "Mystery_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
