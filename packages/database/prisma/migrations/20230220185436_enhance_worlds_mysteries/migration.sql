/*
  Warnings:

  - You are about to drop the column `worldName` on the `Mystery` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Mystery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `World` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Mystery" DROP CONSTRAINT "Mystery_worldName_fkey";

-- AlterTable
ALTER TABLE "Mystery" DROP COLUMN "worldName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "worldId" INTEGER,
ADD CONSTRAINT "Mystery_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "World" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "World_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Mystery" ADD CONSTRAINT "Mystery_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE SET NULL ON UPDATE CASCADE;
