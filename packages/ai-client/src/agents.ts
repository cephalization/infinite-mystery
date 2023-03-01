import { Handlers } from ".";
import { replacer } from "./replacer";
import { z } from "zod";
import { ChatCompletionRequestMessage } from "openai";

const mysteryDungeonMasterVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z
    .array(z.string())
    .transform((a) => a.map((b) => b.replaceAll("summary:", "dm:"))),
  crime: z.string(),
  brief: z.string(),
  action: z.string().transform((a) => (a ? `- player: ${a}` : a)),
});

type MysteryDungeonMasterVariables = z.infer<
  typeof mysteryDungeonMasterVariablesSchema
>;

export const createMysteryDungeonMaster =
  (handlers: Handlers) =>
  (variables: MysteryDungeonMasterVariables, customTemplate?: string) => {
    const validatedVariables =
      mysteryDungeonMasterVariablesSchema.parse(variables);

    const prompt = replacer({
      template:
        customTemplate ||
        `
You are the dungeon master (DM) for a whodunnit role-playing game. The player will add actions they want to
take in the world to the timeline, and you will describe what happens when those actions are taken. Then you will write a brief but complete summary of the action and the description, at the end of the "- dm:" line, delineated by "SUM:"
Never say no to the player, your job is only to describe what happens next. Never make decisions or take actions for the player in your descriptions.
Your descriptions should be complete, informative, interesting and well written.

As the player explores, they will slowly come across clues that will help them piece together the who, how, and why of the crime.
Never give information to the player that they didn't find directly by exploring the world and asking witnesses.

This game takes place in a world called {worldName}.
World description: {worldDescription}
This is the crime that the player will be trying to solve: {crime}
This is the brief of the crime that the player can see: {brief}

Start sample timeline entries:
- player: I enter the room
- dm: You walk into a small, gray stone room smelling of dirt and old leather. Ahead, three beds sit tight against the wall. Two bandits snore loudly as the dim light from the torches bounces off the walls. One shifts in bed and grumbles to himself. SUM: The player walks into the room. It is gray, stone, and smells like dirt. It contains three beds, two sleeping bandits, torches.
- player: What do I see?
- dm: To your left are two small wooden doors, and at the end of the hall you can see a set of large steel double doors. It smells like smoke. SUM: The player sees two small wooden doors to their left, and large steel double doors at the end of the hall. It smells like smoke.
End sample timeline entries

The DM's first timeline entry should introduce the world, and the "brief" to the player.

Timeline:
[timeline]
{action}
`,
      variables: validatedVariables,
      canShorten: "timeline",
      endText: "\n- dm:",
    });

    console.log("Mystery Dungeon Master Prompt Length:", prompt.length);

    return handlers.completion(prompt);
  };

const exploreDungeonMasterVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(z.string()),
  action: z.string().transform((a) => (a ? `- player: ${a}` : a)),
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
You are the dungeon master (DM) for a role-playing game. The player will add actions they want to
take in the world to the timeline, and you will describe what happens when those actions are taken. 
Your description should be detailed but you should include a short summary of the description at the end of the "- dm:" line, delineated by "SUM:". 
Never say no to the player, your job is only to describe what happens next. 
Your descriptions should be complete, informative, interesting and well written. 
The player can also ask you questions about what they see in the world, and you should give full descriptions of what their character would be seeing or experiencing.
You should not ask the player any questions.

This particular game takes place in a world called {worldName}.
{worldName} is described like "{worldDescription}".

Sample actions and responses:

- player: I enter the room
- dm: You walk into a small, gray stone room smelling of dirt and old leather. Ahead, three beds sit tight against the wall. Two bandits snore loudly as the dim light from the torches bounces off the walls. One shifts in bed and grumbles to himself. SUM: The player walks into the room. It is gray, stone, and smells like dirt. It contains three beds, two sleeping bandits, torches.

- player: What do I see?
- dm: To your left are two small wooden doors, and at the end of the hall you can see a set of large steel double doors.  SUM: The player sees two small wooden doors to their left, and large steel double doors at the end of the hall. It smells like smoke.

- player: I jump across the alley and try to hit him with my hammer
- dm: You vault across the alley while winding back your hammer, and the perp can barely turn their head before you've brought it down on their head. They slump on the ground, motionless. SUM: The player jumps across the alley and hits the perp in the back of the head with a hammer, knocking them unconsious.

End sample actions and responses

The DM's first timeline entry should be a detailed introduction to the world, interesting enough for the player to want to take action in.
Remember, you should not ask the player any questions, you just describe what occurs as a result of their actions.

Timeline:
[timeline]
{action}`,
      variables: validatedVariables,
      canShorten: "timeline",
      endText: "\n- dm:",
    });

    console.log("Explore Dungeon Master Prompt Length:", prompt.length);

    return handlers.completion(prompt);
  };

const evaluatorVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(z.string()).transform((timeline) => {
    if (!timeline.length) {
      return [];
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

    const systemPrompt = replacer({
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

The player is in a place called {worldName}.
This is a description of {worldName}: {worldDescription}

This is a timeline of events that have happened in the game so far:

[timeline]

End timeline
`,
      variables: validatedVariables,
      canShorten: "timeline",
    });

    console.log("Evaluator prompt Length:", systemPrompt.length);

    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: systemPrompt,
    };

    // an array of chat completion request messages in the format of
    // example action and evaluations from the prompt above
    const sampleMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: "The following is a sample set of actions and evaluations",
      },
      { role: "user", content: "I fly towards the far end of the building" },
      {
        role: "assistant",
        content:
          "Invalid. You cannot fly to the end of the building, because you do not possess the ability to fly.",
      },
      { role: "user", content: "I walk towards the far end of the building" },
      { role: "assistant", content: "Valid." },
      { role: "user", content: "I jump up onto the concrete barricade" },
      { role: "assistant", content: "Valid." },
      { role: "user", content: "I smash through the concrete barricade" },
      {
        role: "assistant",
        content:
          "Invalid. You do not have super-strength, you cannot smash through the concrete barricade.",
      },
      { role: "user", content: "I enter the presidential chambers" },
      {
        role: "assistant",
        content:
          "Invalid. You cannot enter the presidential chambers because you are at home depot.",
      },
      { role: "user", content: "I suckerpunch Frederick" },
      { role: "assistant", content: "Valid." },
      {
        role: "system",
        content: "End of sample set of actions and evaluations",
      },
    ];

    const actionMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: "Now, evaluate the following action" },
      { role: "user", content: validatedVariables.action },
    ];

    const result = await handlers.chat([
      systemMessage,
      ...sampleMessages,
      ...actionMessages,
    ]);

    console.log(result.data.choices, result.data.usage);
    const resultText = result.data.choices.at(0)?.message?.content ?? "";

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

const worldImageGeneratorVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
});

type WorldImageGeneratorVariables = z.infer<
  typeof worldImageGeneratorVariablesSchema
>;

export const createWorldImageGenerator =
  (handlers: Handlers) =>
  async (variables: WorldImageGeneratorVariables, customTemplate?: string) => {
    const validatedVariables =
      worldImageGeneratorVariablesSchema.parse(variables);

    const promptGeneratorPrompt = replacer({
      template:
        customTemplate ||
        `
You are an artistic director who is making an intriguing image that will represent a particular 
world. You will be given the name of the world, and description of the world,

You will use this information to describe a unique image that should give the feeling of the world.
Your image description should include the medium of art, the style, and a detailed description of 
what is in the image. Use lots of evocative adjectives.

This is a description of the world, called {worldName}: 
- {worldDescription}

This is your description of the image:
`,
      variables: validatedVariables,
    });

    console.log(
      "World Image Prompt Generator Prompt Length:",
      promptGeneratorPrompt.length
    );

    const promptResult = await handlers.completion(promptGeneratorPrompt);
    const prompt = promptResult.data.choices.at(0)?.text ?? "";

    console.log("World Image Generator Prompt:", prompt);

    const result = await handlers.image(prompt, {
      response_format: "b64_json",
    });

    const b64Image = result.data.data.at(0)?.b64_json;

    if (!b64Image) {
      return null;
    }

    return b64Image;
  };

const mysteryImageGeneratorVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  mysteryTitle: z.string(),
  crime: z.string(),
});

type MysteryImageGeneratorVariables = z.infer<
  typeof mysteryImageGeneratorVariablesSchema
>;

export const createmysteryImageGenerator =
  (handlers: Handlers) =>
  async (
    variables: MysteryImageGeneratorVariables,
    customTemplate?: string
  ) => {
    const validatedVariables =
      worldImageGeneratorVariablesSchema.parse(variables);

    const promptGeneratorPrompt = replacer({
      template:
        customTemplate ||
        `
You are an artistic director who is making an intriguing image that will represent a particular 
mystery adventure. You will be given the name of the mystery, a description of the world the mystery
will take place in, and a description of the crime. 

You will use this information to describe a unique image that should give the feeling of the crime 
and introduce the key elements of the mystery. Your image description should include the medium of 
art, the style, and a detailed description of what is in the image. Use lots of evocative adjectives.

This is the title of the mystery: 
- {mysteryTitle}

This is a description of the world, called {worldName}, that the mystery takes place in: 
- {worldDescription}

This is a description of the crime: 
- {crime}

This is your description of the image to go with the mystery:`,
      variables: validatedVariables,
    });

    console.log(
      "Mystery Image Prompt Generator Prompt Length:",
      promptGeneratorPrompt.length
    );

    const promptResult = await handlers.completion(promptGeneratorPrompt);
    const prompt = promptResult.data.choices.at(0)?.text ?? "";

    console.log("Mystery Image Generator Prompt:", prompt);

    const result = await handlers.image(prompt, {
      response_format: "b64_json",
    });

    const b64Image = result.data.data.at(0)?.b64_json;

    if (!b64Image) {
      return null;
    }

    return b64Image;
  };
