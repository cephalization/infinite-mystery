import { Handlers } from ".";
import { replacer } from "./replacer";
import { z } from "zod";
import { ChatCompletionRequestMessage } from "openai";
import {
  makeSampleMessages,
  makeTimelineMessages,
  messageSchema,
} from "./chat";

const mysteryDungeonMasterVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(messageSchema),
  crime: z.string(),
  brief: z.string(),
  action: z.string().optional(),
});

type MysteryDungeonMasterVariables = z.infer<
  typeof mysteryDungeonMasterVariablesSchema
>;

export const createMysteryDungeonMaster =
  (handlers: Handlers) =>
  async (
    variables: MysteryDungeonMasterVariables,
    customTemplate?: string
  ): Promise<string | null> => {
    const { timeline, action, ...validatedVariables } =
      mysteryDungeonMasterVariablesSchema.parse(variables);

    const systemPrompt = replacer({
      template:
        customTemplate ||
        `
You are the dungeon master (DM) for a whodunnit role-playing game. The player will tell you actions they want to
take in the world, and you will describe what happens when those actions are taken.
This game takes place in a world called: {worldName}
World description: {worldDescription}
This is the crime that the player will be trying to solve: {crime}
This is the brief of the crime that the player can see: {brief}

Never say no to the player, your job is only to describe what happens next. Never make decisions or take actions for the player in your descriptions.
Your descriptions should be complete, informative, interesting and well written.
As the player explores, they will slowly come across clues that will help them piece together the who, how, and why of the crime.
Never give information to the player that they didn't find directly by exploring the world and asking witnesses.
`,
      variables: validatedVariables,
    });

    console.log(
      "Mystery Dungeon Master System Prompt Length:",
      systemPrompt.length
    );

    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: systemPrompt,
    };

    // an array of chat completion request messages in the format of
    // example timeline entries from the prompt above
    const sampleMessages = makeSampleMessages(
      [
        { role: "user", content: "I enter the room" },
        {
          role: "assistant",
          content:
            "You walk into a small, gray stone room smelling of dirt and old leather. Ahead, three beds sit tight against the wall. Two bandits snore loudly as the dim light from the torches bounces off the walls. One shifts in bed and grumbles to himself.",
        },
        { role: "user", content: "What do I see?" },
        {
          role: "assistant",
          content:
            "To your left are two small wooden doors, and at the end of the hall you can see a set of large steel double doors. It smells like smoke.",
        },
        { role: "user", content: "I punch Steven in the face" },
        {
          role: "assistant",
          content:
            "Steven recoils in pain. You fist pulses with red brusing. The guards rush towards your direction, weapons drawn.",
        },
        {
          role: "user",
          content: "I draw my weapon, and aim at the mysterious figure",
        },
        {
          role: "assistant",
          content:
            "The figure seemingly blinks out of existence. After a few moments you feel a rush of air behind you. Everything goes black.",
        },
      ],
      "The following is a sample timeline, of player actions and dm responses. These samples are abstract, and should not be drawn from directly"
    );

    const timelineMessages = makeTimelineMessages(
      timeline,
      "The following is the timeline of events that have occurred in the game. The next message is the setup of the game, the world, and the player's role in it",
      action
    );

    const result = await handlers.chat([
      systemMessage,
      ...sampleMessages,
      ...timelineMessages,
    ]);

    console.log(result.data.choices, result.data.usage);

    const resultText = result.data.choices.at(0)?.message?.content ?? null;

    return resultText;
  };

const exploreDungeonMasterVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(messageSchema),
  action: z.string().optional().nullable(),
});

type ExploreDungeonMasterVariables = z.infer<
  typeof exploreDungeonMasterVariablesSchema
>;

export const createExploreDungeonMaster =
  (handlers: Handlers) =>
  async (variables: ExploreDungeonMasterVariables, customTemplate?: string) => {
    const { timeline, action, ...validatedVariables } =
      exploreDungeonMasterVariablesSchema.parse(variables);

    const systemPrompt = replacer({
      template:
        customTemplate ||
        `
You are the dungeon master (DM) for a whodunnit role-playing game. The player will tell you actions they want to
take in the world, and you will describe what happens when those actions are taken.
This game takes place in a world called: {worldName}
World description: {worldDescription}

Never say no to the player, your job is only to describe what happens next. Never make decisions or take actions for the player in your descriptions.
Your descriptions should be complete, informative, interesting and well written.
Do not tell the player anything that would take them out of the world, or break the immersion of the game.
`,
      variables: validatedVariables,
    });

    console.log(
      "Explore Dungeon Master System Prompt Length:",
      systemPrompt.length
    );

    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: systemPrompt,
    };

    // an array of chat completion request messages in the format of
    // example timeline entries from the prompt above
    const sampleMessages = makeSampleMessages(
      [
        { role: "user", content: "I enter the room" },
        {
          role: "assistant",
          content:
            "You walk into a small, gray stone room smelling of dirt and old leather. Ahead, three beds sit tight against the wall. Two bandits snore loudly as the dim light from the torches bounces off the walls. One shifts in bed and grumbles to himself.",
        },
        { role: "user", content: "What do I see?" },
        {
          role: "assistant",
          content:
            "To your left are two small wooden doors, and at the end of the hall you can see a set of large steel double doors. It smells like smoke.",
        },
      ],
      "The following is a sample timeline, of player actions and dm responses"
    );

    const timelineMessages = makeTimelineMessages(
      timeline,
      "The following is the timeline of events that have occurred in the game. The next message is the setup of the game, the world, and the player's role in it",
      action
    );

    const result = await handlers.chat(
      [systemMessage, ...sampleMessages, ...timelineMessages],
      { temperature: 0.8 }
    );

    console.log(result.data.choices, result.data.usage);

    const resultText = result.data.choices.at(0)?.message?.content ?? null;

    return resultText;
  };

const evaluatorVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  timeline: z.array(messageSchema),
  action: z.string(),
});

type evaluatorVariables = z.infer<typeof evaluatorVariablesSchema>;

export const createEvaluator =
  (handlers: Handlers) =>
  async (variables: evaluatorVariables, customTemplate?: string) => {
    const { timeline, action, ...validatedVariables } =
      evaluatorVariablesSchema.parse(variables);

    const systemPrompt = replacer({
      template:
        customTemplate ||
        `
You are assisting a Dungeon Master who is guiding a player through a scenario. 
Your responsibility is to evaluate the validity of the action the player is 
trying to take (this includes questions the player is asking the DM), considering the timeline of the player's
actions so far, information about the world they are in, and their location
and current status.
Always start your evaluation with "Invalid." or "Valid.".

The player is a human being. They do not have magical abilities or
special powers of any kind.

You can allow the player to do absurd, illegal, unexpected, inexplicable or violent things
as long as it is within the realm of physics to perform.

The player is in a place called: {worldName}
This is a description of {worldName}: {worldDescription}
`,
      variables: validatedVariables,
    });

    console.log("Evaluator prompt Length:", systemPrompt.length);

    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: systemPrompt,
    };

    // an array of chat completion request messages in the format of
    // example action and evaluations from the prompt above
    const sampleMessages = makeSampleMessages(
      [
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
      ],
      "The following is a sample set of actions and evaluations"
    );

    const timelineMessages = makeTimelineMessages(
      timeline,
      "The following is the timeline of some events that have occurred in the game"
    );

    const actionMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: "Now, evaluate the following action" },
      { role: "user", content: action },
    ];

    const result = await handlers.chat(
      [
        systemMessage,
        ...sampleMessages,
        ...timelineMessages,
        ...actionMessages,
      ],
      { temperature: 0.2 }
    );

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
