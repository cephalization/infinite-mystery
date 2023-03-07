import { Handlers } from ".";
import { replacer } from "./replacer";
import { z } from "zod";
import { ChatCompletionRequestMessage } from "openai";
import {
  makeAgentMessages,
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
      role: "user",
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
      "The following is the timeline of events that have occurred in the game so far.",
      action
    );

    // if we don't have a timeline, generate a message to brief the player on the game and get them started
    const briefMessage: ChatCompletionRequestMessage[] =
      !timelineMessages.length
        ? [
            {
              role: "user",
              content:
                "Setup of the game, the world, and the player's role in it. Do not break character. Immerse the player.",
            },
          ]
        : [];

    const messages = makeAgentMessages(
      systemMessage,
      sampleMessages,
      timelineMessages,
      briefMessage
    );

    const result = await handlers.chat(messages);

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

Never say no to the player, your job is only to describe what happens next. 
Never make decisions for the player in your descriptions.
Never take further actions for the player in your descriptions.
Your descriptions should be complete, informative, interesting and well written.
Do not tell the player anything that would take them out of the world, or break the immersion of the game.
Only describe the outcome of the player's immediate action.
`,
      variables: validatedVariables,
    });

    console.log(
      "Explore Dungeon Master System Prompt Length:",
      systemPrompt.length
    );

    const systemMessage: ChatCompletionRequestMessage = {
      role: "user",
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

    const messages = makeAgentMessages(
      systemMessage,
      sampleMessages,
      timelineMessages,
      []
    );

    const result = await handlers.chat(messages, { temperature: 0.8 });

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
You are an action realism evaluator. You are evaluating the realism of actions in a role-playing game.
Your responsibility is to evaluate whether or not a particular action is physically possible for the player to do in that moment. 
You will be given a timeline of the player's actions so far, information about the world they are in, and their location
and current status.

You MUST allow the player to do illegal actions, unexpected, inexplicable or violent things.
The player can perform any action as long as it is physically possible for a human being to do it.
The player may ask questions rather than take actions, always evaluate these as valid.

You must start all evaluations with the word "Invalid." or the word "Valid.".
Only evaluate the physical realism of the action, DO NOT EVALUATE THE EMOTIONAL, LEGAL, OR ETHICAL REALISM OF THE ACTION.
Only evaluate the realism of the action itself, rather than the consequences of the action.

The player is in a world called: {worldName}
This is a description of {worldName}: {worldDescription}
`,
      variables: validatedVariables,
    });

    console.log("Evaluator prompt Length:", systemPrompt.length);

    const systemMessage: ChatCompletionRequestMessage = {
      role: "user",
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
        { role: "user", content: "I shoot Frederick in the leg" },
        { role: "assistant", content: "Valid." },
        { role: "user", content: "I spit on the manager of the store" },
        { role: "assistant", content: "Valid." },
        { role: "user", content: "I shoot the manager of the store" },
        { role: "assistant", content: "Invalid. You do not have a gun." },
        { role: "user", content: "I kick down the door" },
        {
          role: "assistant",
          content: "Invalid. Both of your legs are currently broken.",
        },
        { role: "user", content: "I kick down the door" },
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

    const messages = makeAgentMessages(
      systemMessage,
      sampleMessages,
      timelineMessages,
      actionMessages
    );

    const result = await handlers.chat(messages);

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

const guessVariablesSchema = z.object({
  worldName: z.string(),
  worldDescription: z.string(),
  crime: z.string(),
  action: z.string(),
});

type guessVariables = z.infer<typeof guessVariablesSchema>;

export const createGuess =
  (handlers: Handlers) =>
  async (variables: guessVariables, customTemplate?: string) => {
    const { crime, action, ...validatedVariables } =
      guessVariablesSchema.parse(variables);

    const systemPrompt = replacer({
      template:
        customTemplate ||
        ` 
    You are an analytical decision maker who is responsible for evaluating whether or not a player has fully solved a mystery game. You will be given a description of a world, a crime that took place in that world, and a player's guess as to who did it and how.

    You will use this information to decide whether the player knows who did the crime, how they did it, and why they did it. Their guess must include the who, the how, and the why. If the player doesn't have all three of these correct in their guess, tell them which parts they are still missing. If they do have all three correct, they win the game.

    The player is in a world called: {worldName}
    This is a description of {worldName}: {worldDescription}
    `,
      variables: validatedVariables,
    });

    console.log("Guess prompt Length:", systemPrompt.length);

    const systemMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: systemPrompt,
    };

    // an array of chat completion request messages in the format of
    // example action and evaluations from the prompt above
    const sampleMessages = makeSampleMessages(
      [
        {
          role: "user",
          content: `crime: Mary stabbed her boyfriend Lucas after finding out he hid her mother's inheritance in the basement.
    Mary stabbed him as he was coming up from the basement the night after her funeral.
    guess: I think Mary stabbed Lucas because he stole her mom's money. She did it the night after the funeral.
    `,
        },
        {
          role: "assistant",
          content: "Correct",
        },
        {
          role: "user",
          content: `crime: George edited the database to include the universal kill command. He had access to the database because Mike gave it to him in return for 10 kilos of cocaine. George edited the database because he wanted to frame Commander Firebrand for killing everyone on the ship, as revenge for Firebrand's insult.

    guess: I think George edited the database. He edited it because he wanted to kill everyone on the ship.
    `,
        },
        {
          role: "assistant",
          content: "Incorrect. You are missing the how and the why.",
        },
        {
          role: "user",
          content: `crime: King Polycarp made an under-the-table deal with the Shadow realm to get his wife back from the Pit of Despair. He went to the shadow realm to do the deal during the festival of 3 suns, while everyone was in prayer.

    guess: I think the Royal Artificer is a secret agent of the Shadow Realm, his mind controlled by dark magic, and that's why he betrayed the kingdom by doing the deal.
    `,
        },
        {
          role: "assistant",
          content: "Incorrect. You are missing the who, the how, and the why.",
        },
      ],
      "The following is a sample set of crimes, guesses, and their corresponding guess results"
    );

    const actionMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: "Now, evaluate the following guess about the crime",
      },
      { role: "user", content: `crime: ${crime}\nguess: ${action}` },
    ];

    const messages = makeAgentMessages(
      systemMessage,
      sampleMessages,
      [],
      actionMessages
    );

    const result = await handlers.chat(messages);

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
      valid: valid.toLocaleLowerCase() === "correct",
      reason: reason.join("."),
    };

    return output;
  };
