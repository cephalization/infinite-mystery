import { Handlers } from ".";
import { replacer } from "./replacer";
import { z } from "zod";

const dungeonMasterVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(z.string()).transform((timeline) => {
    if (!timeline.length) {
      return ["DM:"];
    }

    return timeline;
  }),
});

type DungeonMasterVariables = z.infer<typeof dungeonMasterVariablesSchema>;

export const createDungeonMaster =
  (handlers: Handlers) =>
  (variables: DungeonMasterVariables, customTemplate?: string) => {
    const validatedVariables = dungeonMasterVariablesSchema.parse(variables);
    validatedVariables.timeline = [...validatedVariables.timeline, "dm:"];

    const prompt = replacer({
      template:
        customTemplate ||
        `
You are the dungeon master (DM) for a role-playing game. The player will send actions they want to take in the world, 
and you will describe what happens when those actions are taken. Never say no to the player, they can take whatever 
action they like, your job is only to describe what happens next. Your descriptions should be complete, informative, 
interesting and well written. The player can also ask you questions about what they see in the world, and you should 
give full descriptions of what their character would be seeing or experiencing.

Sample actions and responses:

- player: I walk through the carnival and look around
- dm: Walking through the carnival grounds, you hear infectious laughter as children play the various games. The 
smell of fruit and sugar wafts through the air as the workers peddle their foods, and up ahead the big tent looms over 
the rest of the ensemble. A woman on painted stilts, smiling at you.

- player: I enter the room
- dm: You walk into a small, gray stone room smelling of dirt and old leather. Ahead, three beds sit tight against the 
wall. Two bandits snore loudly as the dim light from the torches bounces off the walls. One shifts in bed and grumbles 
to himself.

- player: What do I see?
- dm: To your left are two small wooden doors, and at the end of the hall you can see a set of large steel double doors.
 It smells like smoke.

- player: I jump across the alley and try to hit him with my hammer
- dm: You vault across the alley while winding back your hammer, and the perp can barely turn their head before you’ve
brought it down on their head. They slump on the ground, motionless.

End sample actions and responses

This particular game takes place in a world called {worldName}.
{worldName} is described like "{worldDescription}".

The first response should be a brief introduction to the world, setting the stage for the player’s first action.

[timeline]
`,
      variables: validatedVariables,
      canShorten: "timeline",
    });

    console.log({ prompt, length: prompt.length });

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
});

type evaluatorVariables = z.infer<typeof evaluatorVariablesSchema>;

export const createEvaluator =
  (handlers: Handlers) =>
  async (variables: evaluatorVariables, customTemplate?: string) => {
    const validatedVariables = dungeonMasterVariablesSchema.parse(variables);
    const variablesWithAction = {
      ...validatedVariables,
      action:
        [...validatedVariables.timeline]
          .reverse()
          .find((evt) => evt.toLowerCase().startsWith("player")) ?? "",
    };

    const prompt = replacer({
      template:
        customTemplate ||
        `
You are assisting a Dungeon Master who is guiding a player through a scenario. 
Your responsibility is to evaluate the validity of the action the player is 
trying to take, considering the timeline of the player's
actions so far, information about the world they are in, and their location
and current status.

The player is a normal human being. They do not have magical abilities or
special powers of any kind.

Your evaluation should be fair, but you shouldn't let the player take any action that a real
human wouldn't physically be able to take in that particular scenario.

You can allow the player to do absurd, illegal, unexpected, inexplicable or violent things
as long as they are physically possible in the situation they are in.

Example output:

Action: I fly towards the far end of the building
Evaluation: Invalid. You cannot fly to the end of the building, because you are a normal human

Action: I walk towards the far end of the building
Evaluation: Valid.

Action: I jump up onto the concrete barricade
Evaluation: Valid.

Action: I smash through the concrete barricade
Evaluation: Invalid. You do not have super-strength, you cannot smash through the concrete barricade

Action: I enter the presidential chambers
Evaluation: Invalid. You cannot enter the presidential chambers because you are at home depot

End Example output

The player is in a place called {worldName}.
This is a description of {worldName}:
{worldDescription}

This is a timeline of what has happened to the player:

[timeline]

Action: {action}
Evaluation:
`,
      variables: variablesWithAction,
    });

    console.log({ prompt, length: prompt.length });

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
