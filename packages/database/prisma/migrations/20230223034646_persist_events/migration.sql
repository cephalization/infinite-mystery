-- CreateTable
CREATE TABLE "WorldEventSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "worldId" INTEGER NOT NULL,

    CONSTRAINT "WorldEventSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryEventSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mysteryId" INTEGER NOT NULL,

    CONSTRAINT "MysteryEventSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "invalidAction" BOOLEAN,
    "worldEventSessionId" INTEGER,
    "mysteryEventSessionId" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorldEventSession" ADD CONSTRAINT "WorldEventSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldEventSession" ADD CONSTRAINT "WorldEventSession_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryEventSession" ADD CONSTRAINT "MysteryEventSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryEventSession" ADD CONSTRAINT "MysteryEventSession_mysteryId_fkey" FOREIGN KEY ("mysteryId") REFERENCES "Mystery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_worldEventSessionId_fkey" FOREIGN KEY ("worldEventSessionId") REFERENCES "WorldEventSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_mysteryEventSessionId_fkey" FOREIGN KEY ("mysteryEventSessionId") REFERENCES "MysteryEventSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
