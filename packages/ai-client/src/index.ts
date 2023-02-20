import { serverConfig } from "env-config";
import {
  Configuration,
  CreateCompletionRequest,
  CreateImageRequest,
  OpenAIApi,
} from "openai";

export { replacer } from "./replacer";

import {
  createExploreDungeonMaster,
  createEvaluator,
  createMysteryDungeonMaster,
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
});

export type Handlers = ReturnType<typeof createHandlers>;

const createAgents = (handlers: Handlers) => ({
  exploreDungeonMaster: createExploreDungeonMaster(handlers),
  mysteryDungeonMaster: createMysteryDungeonMaster(handlers),
  evaluator: createEvaluator(handlers),
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
