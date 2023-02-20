import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  await prisma.world.upsert({
    where: { name: "Starship Mega" },
    update: {},
    create: {
      name: "Starship Mega",
      description:
        "Starship Mega is a generation starship that houses 20,000 humans on their way to alpha centauri. The starship has been in transit for 200 years, and many grudges, power struggles, and criminal networks roil under the pristine sterile surface.",
      mysteries: {
        create: {
          title: "Data Breach Crimson",
          brief:
            "You are an up and coming detective working directly under the starship captain, Marcus. A data breach was discovered in the highest levels of the ship’s command system, but the ship administration doesn’t know what was changed, who did it, or why. You have been tasked with investigating the data breach to discover what happened immediately. The safety of the whole ship could be at stake.",
          crime:
            "George is an engine mechanic that was once on his way to become a commander, a powerful man on the ship. A childhood rival of his, Firebrand, snubbed him from his job with subterfuge and nepotism. Enraged, George got access to the ship’s central command database, and added a command that would kill the whole population of the ship. He did this in an attempt to frame firebrand, and get him disgraced in the public eye.",
        },
      },
    },
    include: {
      mysteries: true,
    },
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
