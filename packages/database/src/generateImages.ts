import { PrismaClient } from "@prisma/client";
import { createAiClient } from "ai-client";
import { uploadBase64Image } from "cdn";

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
    try {
      const image = await aiClient.agents.worldImageGenerator({
        worldName: world.name,
        worldDescription: world.description,
      });
      const convertedImage =
        image && (await uploadBase64Image(world.name, image));

      if (convertedImage) {
        await prisma.world.update({
          where: {
            id: world.id,
          },
          data: {
            previewImg: convertedImage.url,
          },
        });
      }
    } catch (e) {
      console.error(e);
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
    try {
      const image = await aiClient.agents.mysteryImageGenerator({
        mysteryTitle: mystery.title,
        crime: mystery.crime,
        worldDescription: mystery.World.description,
        worldName: mystery.World.name,
      });
      const convertedImage =
        image && (await uploadBase64Image(mystery.title, image));

      if (convertedImage) {
        await prisma.mystery.update({
          where: {
            id: mystery.id,
          },
          data: {
            previewImg: convertedImage.url,
          },
        });
      }
    } catch (e) {
      console.error(e);
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
