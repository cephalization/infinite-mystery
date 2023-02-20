/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[providerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `displayName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "providerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "Mystery" (
    "title" TEXT NOT NULL,
    "crime" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "worldName" TEXT,
    "userId" INTEGER,
    "previewImg" TEXT
);

-- CreateTable
CREATE TABLE "World" (
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER,
    "previewImg" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Mystery_title_key" ON "Mystery"("title");

-- CreateIndex
CREATE UNIQUE INDEX "World_name_key" ON "World"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_providerId_key" ON "User"("providerId");

-- AddForeignKey
ALTER TABLE "Mystery" ADD CONSTRAINT "Mystery_worldName_fkey" FOREIGN KEY ("worldName") REFERENCES "World"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mystery" ADD CONSTRAINT "Mystery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "World" ADD CONSTRAINT "World_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
