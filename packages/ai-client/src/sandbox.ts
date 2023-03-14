import { createAiClient } from ".";

const aiClient = createAiClient();

const sandbox = async () => {
  console.log(
    "Running sandbox...",
    `${Object.keys(aiClient.agents).length} agents ready`
  );

  console.log("running characterCreator");
  const characterCreator = await aiClient.agents.characterCreator({
    crime:
      "Who tampered with the ship's kill command? It was George. George is an engine mechanic that was once on his way to become a commander, a powerful man on the ship. A childhood rival of his, Firebrand, snubbed him from his job with subterfuge and nepotism. Enraged, George got access to the ship's central command database, and added a command that would kill the whole population of the ship. He did this in an attempt to frame firebrand, and get him disgraced in the public eye.",
    worldName: "Starship Mega",
    mysteryTitle: "Data Breach Crimson",
    worldDescription:
      "Starship Mega is a generation starship that houses 20,000 humans on their way to alpha centauri. The starship has been in transit for 200 years, and many grudges, power struggles, and criminal networks roil under the pristine sterile surface.",
  });
  console.log("characterCreator result", characterCreator);
};

sandbox();
