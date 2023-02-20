import { prisma, Prisma } from "../prisma.server";

export const defaultWorldSelect = Prisma.validator<Prisma.WorldSelect>()({
  id: true,
  name: true,
  description: true,
  previewImg: true,
});

export const getWorlds = () => {
  return prisma.world.findMany({
    select: defaultWorldSelect,
    take: 10,
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getWorldById = (id: Prisma.WorldWhereUniqueInput["id"]) =>
  prisma.world.findFirst({
    where: {
      id,
    },
  });
