import { ChatCompletionRequestMessage } from "openai";
import { get_encoding } from "@dqbd/tiktoken";
import { z } from "zod";

export const messageSchema = z.object({
  content: z.string(),
  role: z.union([
    z.literal("system"),
    z.literal("user"),
    z.literal("assistant"),
  ]),
});

export type Message = z.infer<typeof messageSchema>;

// this is the tiktoken encoder that gpt-turbo uses
// https://github.com/dqbd/tiktoken/tree/main/js
export const messageEnc = get_encoding("cl100k_base");

/**
 * Given a timeline of messages, and a prompt for the user, generate a list of messages
 *
 * The output of this function should be inserted at the end of the messages argument to openai chat
 *
 * @param timeline - timeline of events that have occurred
 * @param introPrompt - prompt to introduce openai to the timeline
 * @param newUserAction
 */
export const makeTimelineMessages = (
  timeline: Message[],
  introPrompt: string,
  newUserAction?: string | null
): ChatCompletionRequestMessage[] => {
  const timelineIntro = timeline.length
    ? [
        {
          role: "user",
          content: introPrompt,
        } as const,
      ]
    : [];
  const newUserActionMessage = newUserAction
    ? [
        {
          role: "user",
          content: newUserAction,
        } as const,
      ]
    : [];

  return [...timelineIntro, ...timeline, ...newUserActionMessage];
};

/**
 * Given a list of samples, and a prompt for the user, generate a list of messages
 *
 * The output of this function can be inserted anywhere in the messages argument to openai chat
 *
 * @param samples - list of samples
 * @param introPrompt - prompt to introduce openai to the samples
 */
export const makeSampleMessages = (
  samples: Message[],
  introPrompt: string
): ChatCompletionRequestMessage[] =>
  samples.length
    ? [
        { role: "user", content: introPrompt },
        ...samples,
        { role: "user", content: "End of samples" },
      ]
    : [];

/**
 * Given a message, return the number of tokens
 *
 * @param message - message
 * @returns number of tokens
 */
export const countMessageTokens = (message: Message) =>
  messageEnc.encode(message.content + message.role).length;

/**
 * Given a list of messages, return the total number of tokens
 *
 * @param messages - list of messages
 * @returns total number of tokens
 */
export const sumMessageTokens = (messages: Message[]) =>
  messages.reduce((acc, curr) => {
    return acc + countMessageTokens(curr);
  }, 0);

/**
 * Given a timeline of messages, a list of samples, and an intro prompt, generate a list of messages
 * that does not go over the max length of tokens
 *
 * @param introMessage - intro message
 * @param samples - list of samples
 * @param timeline - timeline of events that have occurred, as messages
 * @param action - actions that are occurring, as messages
 * @param maxTokens - max number of tokens, defaults to 3500. 4096 is gpt-turbo's max but 3500 is a safe number to account
 *  for internal chatgpt prompt tokens
 * @param responseTokens - number of tokens to reserve for the response, defaults to 256
 * @returns list of messages that does not go over the max length of tokens
 */
export const makeAgentMessages = (
  introMessage: Message,
  samples: Message[],
  timeline: Message[],
  action: Message[],
  maxTokens: number = 3500,
  responseTokens: number = 256
) => {
  if (maxTokens < responseTokens) {
    throw new Error(
      `maxTokens (${maxTokens}) must be greater than responseTokens (${responseTokens})`
    );
  }

  const max = maxTokens - responseTokens;
  const introPromptTokenLength = countMessageTokens(introMessage);
  const sampleTokenLength = sumMessageTokens(samples);
  const timelineTokenLength = sumMessageTokens(timeline);
  const actionTokenLength = sumMessageTokens(action);

  let tokens =
    introPromptTokenLength +
    sampleTokenLength +
    actionTokenLength +
    timelineTokenLength;

  // token length is fine, return everything
  if (tokens <= max) return [introMessage, ...samples, ...timeline, ...action];

  // shorten the timeline by removing the oldest messages until tokens is under the max
  // we should not remove messages with a role of system, as they are important for the context
  const timelineMessages = timeline.filter((message) => {
    if (message.role === "system") return true;
    if (tokens <= max) return true;

    tokens -= countMessageTokens(message);
    return false;
  });

  if (tokens > max) {
    throw new Error(
      "Could not shorten messages enough to fit within max tokens"
    );
  }

  return [introMessage, ...samples, ...timelineMessages, ...action];
};
