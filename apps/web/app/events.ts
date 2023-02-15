import * as R from "remeda";
import { z } from "zod";

export type AnyEventSchema =
  | EventSchema
  | PlayerEventSchema
  | DMEventSchema
  | EvaluatorEventSchema;

export const eventSchema = z
  .object({
    type: z.union([
      z.literal("player"),
      z.literal("dm"),
      z.literal("evaluator"),
    ]),
    content: z.string(),
    id: z.coerce.number(),
  })
  .passthrough();

export type EventSchema = z.infer<typeof eventSchema>;

export const playerEventSchema = eventSchema.merge(
  z.object({
    type: z.literal("player"),
    invalidAction: z.boolean().optional().default(false),
  })
);

export type PlayerEventSchema = z.infer<typeof playerEventSchema>;

export const dmEventSchema = eventSchema.merge(
  z.object({
    type: z.literal("dm"),
  })
);

export type DMEventSchema = z.infer<typeof dmEventSchema>;

export const evaluatorEventSchema = eventSchema.merge(
  z.object({
    type: z.literal("evaluator"),
  })
);

export type EvaluatorEventSchema = z.infer<typeof evaluatorEventSchema>;

/**
 * Events that should be re-processed back into the AI loop
 *
 * Valid player events and all DM events should be processable
 * Evaluator events, invalid player events should not be
 */
export const processableSchema = z.discriminatedUnion("type", [
  dmEventSchema,
  playerEventSchema.merge(
    z.object({ invalidAction: z.literal(false).optional() })
  ),
]);

export type ProcessableSchema = z.infer<typeof processableSchema>;

/**
 * Given an array of events and a desired output schema, filter events into the output schema
 *
 * @param events - array of events
 * @param filterSchema - output event schema
 * @returns output events typed by filter schema
 */
export const filterEventsByType = <S extends z.ZodTypeAny>(
  events: EventSchema[],
  filterSchema: S
) =>
  z
    .array(eventSchema)
    .transform((a) =>
      R.flatMap(a, (aa) => {
        const parsed = filterSchema.safeParse(aa);
        if (parsed.success) {
          return [parsed.data];
        }

        return [];
      })
    )
    .parse(events) as z.infer<S>[];

/**
 * Make an array of stringified events suitable for AI consumption
 * Events are automatically filtered to only those relevant by AI agents
 *
 * @param events - array of events to send to AI
 * @returns filtered events, mapped into string representation
 */
export const makeTimelineFromEvents = (events: EventSchema[]) =>
  filterEventsByType(events, processableSchema).map((e) =>
    `${e.type}: ${e.content}`.trim()
  );
