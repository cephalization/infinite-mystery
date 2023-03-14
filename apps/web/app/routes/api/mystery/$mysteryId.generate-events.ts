import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { aiClient } from "~/server/ai.server";
import { z } from "zod";
import {
  dmEventSchema,
  evaluatorEventSchema,
  eventSchema,
  guessEventSchema,
  makeTimelineFromEvents,
  playerEventSchema,
} from "~/events";
import { getMysteryById } from "~/server/database/mystery.server";
import invariant from "tiny-invariant";

/** This endpoint takes a set of events and then returns a new set of events */
export const action = async ({ request }: ActionArgs) => {
  try {
    const rJson = await request.json();
    const { events, mysteryId, realismMode, action } = z
      .object({
        action: z
          .string()
          .optional()
          .nullable()
          .transform((v) => (v === null ? undefined : v)),
        events: z.array(eventSchema),
        mysteryId: z.coerce.number(),
        realismMode: z.coerce.boolean().optional().default(true),
      })
      .parse(rJson);
    const mystery = await getMysteryById(mysteryId, true);
    invariant(mystery !== null);
    const { World: world } = mystery;
    const timeline = makeTimelineFromEvents(events);

    if (action && action.toLowerCase().startsWith("/solve")) {
      const guess = action.replace("/solve", "").trim();
      const evaluation = await aiClient.agents.guess({
        worldName: world.name,
        worldDescription: world.description,
        crime: mystery.crime,
        action: guess,
      });
      if (evaluation) {
        const { valid, reason } = evaluation;

        if (!valid) {
          const newPlayerItem = playerEventSchema.parse({
            id: events.length + 1,
            type: "player",
            content: action,
            guess: true,
            invalidGuess: true,
          });
          const newGuessItem = guessEventSchema.parse({
            id: events.length + 2,
            type: "guess",
            content: reason ?? "Your guess is incorrect.",
            invalidGuess: true,
          });

          return json({
            events: [...events, newPlayerItem, newGuessItem],
            error: null,
          });
        } else {
          const newPlayerItem = playerEventSchema.parse({
            id: events.length + 1,
            type: "player",
            content: action,
            guess: true,
          });
          const newGuessItem = guessEventSchema.parse({
            id: events.length + 2,
            type: "guess",
            content: "You win!",
          });

          return json({
            events: [...events, newPlayerItem, newGuessItem],
            error: null,
          });
        }
      }
    }

    if (timeline.length && action && realismMode) {
      const evaluation = await aiClient.agents.evaluator({
        worldName: world.name,
        worldDescription: world.description,
        timeline,
        action,
      });
      if (evaluation) {
        const { valid, reason } = evaluation;

        if (!valid) {
          const newPlayerItem = playerEventSchema.parse({
            id: events.length + 1,
            type: "player",
            content: action,
            invalidAction: true,
          });
          const newEvaluatorItem = evaluatorEventSchema.parse({
            id: events.length + 2,
            type: "evaluator",
            content: reason ?? "You cannot do that.",
          });

          return json({
            events: [...events, newPlayerItem, newEvaluatorItem],
            error: null,
          });
        }
      }
    }

    const aiEvent = await aiClient.agents.mysteryDungeonMaster({
      timeline,
      worldDescription: world.description,
      worldName: world.name,
      brief: mystery.brief,
      crime: mystery.crime,
      action,
    });

    if (!aiEvent) {
      throw new Error("Bad ai response");
    }

    const dm = aiEvent;

    if (action) {
      const newPlayerItem = playerEventSchema.parse({
        id: events.length + 1,
        type: "player",
        content: action,
      });
      const newDMItem = dmEventSchema.parse({
        id: events.length + 2,
        type: "dm",
        content: dm.replace("- DM:", "").replace("- dm:", "") ?? "",
      });

      return json({
        events: [...events, newPlayerItem, newDMItem],
        error: null,
      });
    }

    const newDMItem = dmEventSchema.parse({
      id: events.length + 1,
      type: "dm",
      content: dm.replace("- DM:", "").replace("- dm:", "") ?? "",
    });

    return json({
      events: [...events, newDMItem],
      error: null,
    });
  } catch (e) {
    return json(
      { error: "Could not get new events", detail: e, events: null },
      { status: 400 }
    );
  }
};
