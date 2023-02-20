import { Handlers } from ".";
import { replacer } from "./replacer";
import { z } from "zod";

const mysteryDungeonMasterVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(z.string()),
  crime: z.string(),
  brief: z.string(),
  action: z.string().transform((a) => `- player: ${a}`),
});

type MysteryDungeonMasterVariables = z.infer<
  typeof mysteryDungeonMasterVariablesSchema
>;

export const createMysteryDungeonMaster =
  (handlers: Handlers) =>
  (variables: MysteryDungeonMasterVariables, customTemplate?: string) => {
    const validatedVariables =
      mysteryDungeonMasterVariablesSchema.parse(variables);
    validatedVariables.timeline = [...validatedVariables.timeline];

    const prompt = replacer({
      template:
        customTemplate ||
        `
You are the dungeon master (DM) for a whodunnit role-playing game. The player will send actions they want to
take in the world, and you will describe what happens when those actions are taken. Then you will write a brief but complete summary of the action and the description, at the end of the "- dm:" line, delineated by "SUM:"
Never say no to the player, your job is only to describe what happens next. Never make decisions or take actions for the player in your descriptions.
Your descriptions should be complete, informative, interesting and well written.

As the player explores, they will slowly come across clues that will help them piece together the who, how, and why of the crime.
Never give information to the player that they didn't find directly by exploring the world and asking witnesses.

- player: I enter the room
- dm: You walk into a small, gray stone room smelling of dirt and old leather. Ahead, three beds sit tight against the wall. Two bandits snore loudly as the dim light from the torches bounces off the walls. One shifts in bed and grumbles to himself. SUM: The player walks into the room. It is gray, stone, and smells like dirt. It contains three beds, two sleeping bandits, torches.

- player: What do I see?
- dm: To your left are two small wooden doors, and at the end of the hall you can see a set of large steel double doors. It smells like smoke. SUM: The player sees two small wooden doors to their left, and large steel double doors at the end of the hall. It smells like smoke.

End sample actions and responses

This game takes place in a world called {worldName}.
World description: {worldDescription}
This is the crime that the player will be trying to solve: {crime}
This is the brief of the crime that the player can see: {brief}
If the timeline is empty, the DM's first response should be a copy of crime's "brief".

Timeline:
[timeline]
{action}
- dm:
`,
      variables: validatedVariables,
      canShorten: "timeline",
    });

    console.log("Mystery Dungeon Master Prompt Length:", prompt.length);

    return handlers.completion(prompt);
  };

const exploreDungeonMasterVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(z.string()),
  action: z.string().transform((a) => `- player: ${a}`),
});

type ExploreDungeonMasterVariables = z.infer<
  typeof exploreDungeonMasterVariablesSchema
>;

export const createExploreDungeonMaster =
  (handlers: Handlers) =>
  (variables: ExploreDungeonMasterVariables, customTemplate?: string) => {
    const validatedVariables =
      exploreDungeonMasterVariablesSchema.parse(variables);

    const prompt = replacer({
      template:
        customTemplate ||
        `
You are the dungeon master (DM) for a role-playing game. The player will send actions they want to take in the world, 
and you will describe what happens when those actions are taken. Then you will write a brief but complete summary of the action
and the description, at the end of the "- dm:" line, delineated by "SUM:". Never say no to the player, your job is only to describe what happens next. 
Your descriptions should be complete, informative, interesting and well written. 
The player can also ask you questions about what they see in the world, and you should give full descriptions of what their character would be seeing or experiencing.
You should not ask the player any questions.

Sample actions and responses:

- player: I enter the room
- dm: You walk into a small, gray stone room smelling of dirt and old leather. Ahead, three beds sit tight against the wall. Two bandits snore loudly as the dim light from the torches bounces off the walls. One shifts in bed and grumbles to himself. SUM: The player walks into the room. It is gray, stone, and smells like dirt. It contains three beds, two sleeping bandits, torches.

- player: What do I see?
- dm: To your left are two small wooden doors, and at the end of the hall you can see a set of large steel double doors.  SUM: The player sees two small wooden doors to their left, and large steel double doors at the end of the hall. It smells like smoke.

- player: I jump across the alley and try to hit him with my hammer
- dm: You vault across the alley while winding back your hammer, and the perp can barely turn their head before you've brought it down on their head. They slump on the ground, motionless. SUM: The player jumps across the alley and hits the perp in the back of the head with a hammer, knocking them unconsious.

End sample actions and responses

This particular game takes place in a world called {worldName}.
{worldName} is described like "{worldDescription}".

The first response should be a brief introduction to the world, setting the stage for the player’s first action.
Remember, you should not ask the player any questions, you just describe what occurs as a result of their actions.

[timeline]
{action}
- dm:
`,
      variables: validatedVariables,
      canShorten: "timeline",
    });

    console.log("Explore Dungeon Master Prompt Length:", prompt.length);

    return handlers.completion(prompt);
  };

const evaluatorVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(z.string()).transform((timeline) => {
    if (!timeline.length) {
      return ["DM:"];
    }

    return timeline;
  }),
  action: z.string(),
});

type evaluatorVariables = z.infer<typeof evaluatorVariablesSchema>;

export const createEvaluator =
  (handlers: Handlers) =>
  async (variables: evaluatorVariables, customTemplate?: string) => {
    const validatedVariables = evaluatorVariablesSchema.parse(variables);

    const prompt = replacer({
      template:
        customTemplate ||
        `
You are assisting a Dungeon Master who is guiding a player through a scenario. 
Your responsibility is to evaluate the validity of the action the player is 
trying to take (this includes questions the player is asking the DM), considering the timeline of the player's
actions so far, information about the world they are in, and their location
and current status.

The player is a human being. They do not have magical abilities or
special powers of any kind.

You can allow the player to do absurd, illegal, unexpected, inexplicable or violent things
as long as it is within the realm of physics to perform.

Example output:

Action: I fly towards the far end of the building
Evaluation: Invalid. You cannot fly to the end of the building, because you do not possess the ability to fly.

Action: I walk towards the far end of the building
Evaluation: Valid.

Action: I jump up onto the concrete barricade
Evaluation: Valid.

Action: I smash through the concrete barricade
Evaluation: Invalid. You do not have super-strength, you cannot smash through the concrete barricade.

Action: I enter the presidential chambers
Evaluation: Invalid. You cannot enter the presidential chambers because you are at home depot.

Action: I suckerpunch Frederick
Evaluation: Valid.

Action: I strangle the strange figure
Evaluation: Valid.

End Example output

The player is in a place called {worldName}.
This is a description of {worldName}:
{worldDescription}

This is a timeline of what has happened to the player:

[timeline]

Action: {action}
Evaluation:
`,
      variables: validatedVariables,
      canShorten: "timeline",
    });

    console.log("Evaluator prompt Length:", prompt.length);

    const result = await handlers.completion(prompt);

    const resultText = result.data.choices.at(0)?.text ?? "";

    if (!resultText) {
      return null;
    }

    type OutputStructure = {
      valid: boolean;
      reason?: string;
    };

    const [valid, ...reason] = resultText.trim().split(".");

    const output: OutputStructure = {
      valid: valid.toLocaleLowerCase() === "valid",
      reason: reason.join("."),
    };

    return output;
  };
