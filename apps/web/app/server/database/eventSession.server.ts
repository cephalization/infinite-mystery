import type { Prisma } from "../prisma.server";
import { prisma } from "../prisma.server";

export const getWorldEventSessionById = ({
  id,
}: Prisma.WorldEventSessionWhereUniqueInput) => {
  return prisma.worldEventSession.findUnique({
    where: {
      id,
    },
    include: {
      Event: true,
    },
  });
};

export const getEventSessionByWorldId = ({
  worldId,
  userId,
}: Prisma.WorldEventSessionWhereInput) => {
  return prisma.worldEventSession.findFirst({
    where: {
      worldId,
      userId,
    },
    include: {
      Event: true,
    },
  });
};

export const getMysteryEventSessionById = ({
  id,
}: Prisma.MysteryEventSessionWhereUniqueInput) => {
  return prisma.mysteryEventSession.findUnique({
    where: {
      id,
    },
    include: {
      Event: true,
    },
  });
};

export const getEventSessionByMysteryId = async ({
  mysteryId,
  userId,
}: {
  mysteryId: number;
  userId: number;
}) => {
  const session = await prisma.mysteryEventSession.findFirst({
    where: {
      userId,
      mysteryId,
    },
    include: {
      Event: true,
    },
  });

  if (!session) {
    const newSession = await prisma.mysteryEventSession.create({
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
        Mystery: {
          connect: {
            id: mysteryId,
          },
        },
      },
      include: {
        Event: true,
      },
    });

    return newSession;
  }

  return session;
};

export const addEventToMysteryEventSession = ({
  input,
  mysteryEventSessionId,
}: {
  mysteryEventSessionId: Prisma.MysteryEventSessionWhereUniqueInput["id"];
  input: Prisma.EventCreateInput;
}) => {
  return prisma.event.create({
    data: {
      ...input,
      MysteryEventSession: {
        connect: {
          id: mysteryEventSessionId,
        },
      },
    },
  });
};

export const addEventToWorldEventSession = ({
  input,
  worldEventSessionId,
}: {
  worldEventSessionId: Prisma.WorldEventSessionWhereUniqueInput["id"];
  input: Prisma.EventCreateInput;
}) => {
  return prisma.event.create({
    data: {
      ...input,
      WorldEventSession: {
        connect: {
          id: worldEventSessionId,
        },
      },
    },
  });
};
