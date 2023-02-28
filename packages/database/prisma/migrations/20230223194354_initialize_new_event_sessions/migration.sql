-- AlterTable
ALTER TABLE "MysteryEventSession" ADD COLUMN     "initialized" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorldEventSession" ADD COLUMN     "initialized" BOOLEAN NOT NULL DEFAULT false;
