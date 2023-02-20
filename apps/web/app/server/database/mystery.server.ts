import { prisma, Prisma } from "../prisma.server";

export const defaultMysterySelect = Prisma.validator<Prisma.MysterySelect>()({
  id: true,
  title: true,
  crime: true,
  previewImg: true,
  World: true,
});

export const getMysterys = () => {
  return prisma.mystery.findMany({
    select: defaultMysterySelect,
    take: 10,
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getMysterysByWorldId = (
  id: Prisma.WorldWhereUniqueInput["id"]
) => {
  return prisma.mystery.findMany({
    select: {
      ...defaultMysterySelect,
      World: true,
    },
    where: {
      worldId: id,
    },
  });
};
