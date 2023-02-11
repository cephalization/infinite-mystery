import { serverConfig } from "env-config";
import {
  Configuration,
  CreateCompletionRequest,
  CreateImageRequest,
  OpenAIApi,
} from "openai";

export { replacer } from "./replacer";

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
      prompt,
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

export const createAiClient = () => {
  const configuration = new Configuration({
    apiKey: serverConfig.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const handlers = createHandlers(openai);

  return {
    handlers,
    client: openai,
  };
};
