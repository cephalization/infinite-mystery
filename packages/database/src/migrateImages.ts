import { PrismaClient } from "@prisma/client";
import { cdnClient, makeImgUrl, uploadBase64Image } from "cdn";

const prisma = new PrismaClient();
async function main() {
  const worlds = await prisma.world.findMany({
    where: {
      previewImg: {
        not: null,
      },
    },
    take: 100,
  });

  worlds.forEach(async (world) => {
    try {
      if (world.previewImg) {
        const image = await uploadBase64Image(world.name, world.previewImg);

        if (image) {
          await prisma.world.update({
            where: {
              id: world.id,
            },
            data: {
              previewImg: image.url,
            },
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  const mysteries = await prisma.mystery.findMany({
    where: {
      previewImg: {
        not: null,
      },
    },
    include: { World: true },
    take: 100,
  });

  mysteries.forEach(async (mystery) => {
    try {
      if (mystery.previewImg) {
        const image = await uploadBase64Image(
          mystery.title,
          mystery.previewImg
        );

        if (image) {
          await prisma.mystery.update({
            where: {
              id: mystery.id,
            },
            data: {
              previewImg: image.url,
            },
          });
        }
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
