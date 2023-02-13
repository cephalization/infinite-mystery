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
