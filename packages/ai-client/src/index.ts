import { serverConfig } from "env-config";
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionRequest,
  CreateCompletionRequest,
  CreateImageRequest,
  OpenAIApi,
} from "openai";

export { replacer } from "./replacer";

import {
  createExploreDungeonMaster,
  createEvaluator,
  createMysteryDungeonMaster,
  createWorldImageGenerator,
  createmysteryImageGenerator,
  createGuess,
  createCrimeExpander,
} from "./agents";

const defaultCompletionQuery: CreateCompletionRequest = {
  model: "text-davinci-003",
  temperature: 0.5,
  max_tokens: 512,
  frequency_penalty: 1,
  presence_penalty: 0.5,
};

const defaultImageQuery: Omit<CreateImageRequest, "prompt"> = {
  n: 1,
  response_format: "url",
  size: "512x512",
};

const defaultChatQuery: Omit<CreateChatCompletionRequest, "messages"> = {
  model: "gpt-3.5-turbo",
  temperature: 0.5,
};

const createHandlers = (client: OpenAIApi) => ({
  completion: (
    prompt: string,
    options: Partial<CreateCompletionRequest> = {}
  ) =>
    client.createCompletion({
      prompt: prompt.trim(),
      ...defaultCompletionQuery,
      ...options,
    }),
  image: (prompt: string, options: Partial<CreateImageRequest> = {}) =>
    client.createImage({
      prompt,
      ...defaultImageQuery,
      ...options,
    }),
  chat: (
    messages: ChatCompletionRequestMessage[],
    options: Partial<CreateChatCompletionRequest> = {}
  ) =>
    client.createChatCompletion({
      messages,
      ...defaultChatQuery,
      ...options,
    }),
});

export type Handlers = ReturnType<typeof createHandlers>;

const createAgents = (handlers: Handlers) => ({
  exploreDungeonMaster: createExploreDungeonMaster(handlers),
  mysteryDungeonMaster: createMysteryDungeonMaster(handlers),
  evaluator: createEvaluator(handlers),
  worldImageGenerator: createWorldImageGenerator(handlers),
  mysteryImageGenerator: createmysteryImageGenerator(handlers),
  guess: createGuess(handlers),
  crimeExpander: createCrimeExpander(handlers),
});

export const createAiClient = () => {
  const configuration = new Configuration({
    apiKey: serverConfig.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const handlers = createHandlers(openai);
  const agents = createAgents(handlers);

  return {
    handlers,
    agents,
    client: openai,
  };
};
