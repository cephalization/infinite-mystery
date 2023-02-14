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

    return handlers.completion(
      replacer(
        customTemplate ||
          `
You are the dungeon master (DM) for a role-playing mystery game.
The game takes place in a world called {worldName}.
{worldName} is described like "{worldDescription}".
The player expects you to prompt them with a brief overview of their surroundings.
The player will then respond with the action they would like to take.
If the player has not responded, do not guess their response.

Output:
[timeline]
`,
        validatedVariables
      )
    );
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

    const result = await handlers.completion(
      replacer(
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
        variablesWithAction
      )
    );

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
