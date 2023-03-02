import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { aiClient } from "~/server/ai.server";
import { z } from "zod";
import {
  dmEventSchema,
  evaluatorEventSchema,
  makeTimelineFromEvents,
  playerEventSchema,
} from "~/events";
import { getMysteryById } from "~/server/database/mystery.server";
import invariant from "tiny-invariant";
import {
  addEventToMysteryEventSession,
  getMysteryEventSessionById,
  initializeMysteryEventSession,
} from "~/server/database/eventSession.server";
import { getEventsByMysteryId } from "~/server/database/event.server";

/**
 * This endpoint takes a mysteryId and player input, generates a new event,
 * then persists it to the db
 */
export const action = async ({ request }: ActionArgs) => {
  try {
    const rJson = await request.json();
    const { playerInput, mysteryId, mysterySessionId, realismMode } = z
      .object({
        playerInput: z.string(),
        mysteryId: z.coerce.number(),
        mysterySessionId: z.coerce.number(),
        realismMode: z.coerce.boolean().optional().default(true),
      })
      .parse(rJson);
    const mystery = await getMysteryById(mysteryId, true);
    invariant(mystery !== null);
    const mysterySession = await getMysteryEventSessionById({
      id: mysterySessionId,
    });
    invariant(mysterySession !== null);
    const events = await getEventsByMysteryId(mysterySessionId);

    const willGenerateBriefing = !playerInput && !mysterySession.initialized;

    if (!playerInput && mysterySession.initialized) {
      return json(
        {
          error: "Can not accept empty player input",
          detail: "Can not accept empty player input",
          success: false,
        },
        { status: 400 }
      );
    }

    if (willGenerateBriefing) {
      await initializeMysteryEventSession({
        mysteryEventSessionId: mysterySessionId,
      });
    }

    const { World: world } = mystery;
    const timeline = makeTimelineFromEvents(events);

    if (timeline.length && realismMode) {
      const evaluation = await aiClient.agents.evaluator({
        worldName: world.name,
        worldDescription: world.description,
        timeline,
        action: playerInput,
      });
      if (evaluation) {
        const { valid, reason } = evaluation;

        if (!valid) {
          const newPlayerItem = playerEventSchema
            .merge(z.object({ id: z.undefined() }))
            .parse({
              type: "player",
              content: playerInput,
              invalidAction: true,
            });
          const newEvaluatorItem = evaluatorEventSchema
            .merge(z.object({ id: z.undefined() }))
            .parse({
              type: "evaluator",
              content: reason ?? "You cannot do that.",
            });
          await addEventToMysteryEventSession({
            input: newPlayerItem,
            mysteryEventSessionId: mysterySessionId,
          });
          await addEventToMysteryEventSession({
            input: newEvaluatorItem,
            mysteryEventSessionId: mysterySessionId,
          });

          return json({ success: true, error: null }, { status: 200 });
        }
      }
    }

    const aiEvent = await aiClient.agents.mysteryDungeonMaster({
      timeline,
      worldDescription: world.description,
      worldName: world.name,
      brief: mystery.brief,
      crime: mystery.crime,
      action: playerInput,
    });

    if (!aiEvent) {
      throw new Error("Bad ai response");
    }

    const dm = aiEvent;

    const newDMItem = dmEventSchema
      .merge(z.object({ id: z.undefined() }))
      .parse({
        type: "dm",
        content: dm.replace("- DM:", "").replace("- dm:", "") ?? "",
      });
    const newPlayerItem = playerEventSchema
      .merge(z.object({ id: z.undefined() }))
      .parse({
        type: "player",
        content: playerInput,
      });
    if (newPlayerItem.content) {
      await addEventToMysteryEventSession({
        input: newPlayerItem,
        mysteryEventSessionId: mysterySessionId,
      });
    }
    await addEventToMysteryEventSession({
      input: newDMItem,
      mysteryEventSessionId: mysterySessionId,
    });

    return json({
      success: true,
      error: null,
    });
  } catch (e) {
    console.error(e);
    return json(
      { error: "Could not set new events", detail: e, success: false },
      { status: 400 }
    );
  }
};
