import { serverConfig } from "env-config";
import { OpenAI } from "openai";

export { replacer } from "./replacer";

import {
  createExploreDungeonMaster,
  createEvaluator,
  createMysteryDungeonMaster,
  createWorldImageGenerator,
  createmysteryImageGenerator,
} from "./agents";
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from "openai/resources/chat";
import { ImageGenerateParams } from "openai/resources/images";

const defaultCompletionQuery: Omit<ChatCompletionCreateParams, "messages"> = {
  model: "gpt-4o",
};

const defaultImageQuery: Omit<ImageGenerateParams, "prompt"> = {
  n: 1,
  response_format: "url",
  size: "512x512",
};

const defaultChatQuery = {
  model: "gpt-4o",
  stream: false,
} satisfies Omit<ChatCompletionCreateParams, "messages">;

const createHandlers = (client: OpenAI) => ({
  completion: (
    prompt: string,
    options: Partial<ChatCompletionCreateParams> = {}
  ) =>
    client.chat.completions.create({
      messages: [{ role: "user", content: prompt.trim() }],
      ...defaultCompletionQuery,
      ...options,
      stream: false,
    }),
  image: (prompt: string, options: Partial<ImageGenerateParams> = {}) =>
    client.images.generate({
      prompt,
      ...defaultImageQuery,
      ...options,
    }),
  chat: <C extends Partial<ChatCompletionCreateParams>>(
    messages: ChatCompletionMessageParam[],
    options: C = {} as C
  ) =>
    client.chat.completions.create({
      messages,
      ...defaultChatQuery,
      ...options,
      stream: false,
    }),
  chatStream: <C extends Partial<ChatCompletionCreateParams>>(
    messages: ChatCompletionMessageParam[],
    options: C = {} as C
  ) =>
    client.chat.completions.create({
      messages,
      ...defaultChatQuery,
      ...options,
      stream: true,
    }),
});

export type Handlers = ReturnType<typeof createHandlers>;

const createAgents = (handlers: Handlers) => ({
  exploreDungeonMaster: createExploreDungeonMaster(handlers),
  mysteryDungeonMaster: createMysteryDungeonMaster(handlers),
  evaluator: createEvaluator(handlers),
  worldImageGenerator: createWorldImageGenerator(handlers),
  mysteryImageGenerator: createmysteryImageGenerator(handlers),
});

export const createAiClient = () => {
  const openai = new OpenAI({
    apiKey: serverConfig.OPENAI_API_KEY,
  });

  const handlers = createHandlers(openai);
  const agents = createAgents(handlers);

  return {
    handlers,
    agents,
    client: openai,
  };
};
