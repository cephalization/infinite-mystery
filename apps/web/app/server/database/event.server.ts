import { prisma } from "../prisma.server";

export const getEventsByMysteryId = (mysterySessionId: number) =>
  prisma.event.findMany({
    where: {
      mysteryEventSessionId: mysterySessionId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
