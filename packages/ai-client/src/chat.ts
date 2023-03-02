import { ChatCompletionRequestMessage } from "openai";
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
          role: "system",
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
        { role: "system", content: introPrompt },
        ...samples,
        { role: "system", content: "End of samples" },
      ]
    : [];
