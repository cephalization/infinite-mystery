import { createAiClient } from ".";

const aiClient = createAiClient();

const sandbox = async () => {
  console.log(
    "Running sandbox...",
    `${Object.keys(aiClient.agents).length} agents ready`
  );

  console.log("running crimeExpander");
  const crimeExpander = await aiClient.agents.crimeExpander({
    crime: "Stealing a loaf of bread",
    worldName: "Earth",
    mysteryTitle: "The Mystery of the Missing Bread",
    worldDescription: "A world where bread is scarce, and tempers run hot",
  });
  console.log("crimeExpander result", crimeExpander);
};

sandbox();
