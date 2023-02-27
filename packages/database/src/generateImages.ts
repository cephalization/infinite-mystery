import { PrismaClient } from "@prisma/client";
import { createAiClient } from "ai-client";

const prisma = new PrismaClient();
async function main() {
  const aiClient = createAiClient();

  const worlds = await prisma.world.findMany({
    where: {
      previewImg: null,
    },
    take: 100,
  });

  worlds.forEach(async (world) => {
    const image = await aiClient.agents.worldImageGenerator({
      worldName: world.name,
      worldDescription: world.description,
    });

    if (image) {
      await prisma.world.update({
        where: {
          id: world.id,
        },
        data: {
          previewImg: image,
        },
      });
    }
  });

  const mysteries = await prisma.mystery.findMany({
    where: {
      previewImg: null,
    },
    include: { World: true },
    take: 100,
  });

  mysteries.forEach(async (mystery) => {
    const image = await aiClient.agents.mysteryImageGenerator({
      mysteryTitle: mystery.title,
      crime: mystery.crime,
      worldDescription: mystery.World.description,
      worldName: mystery.World.name,
    });

    if (image) {
      await prisma.mystery.update({
        where: {
          id: mystery.id,
        },
        data: {
          previewImg: image,
        },
      });
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
