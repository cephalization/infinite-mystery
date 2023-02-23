import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { aiClient } from "~/server/ai.server";
import { z } from "zod";
import {
  dmEventSchema,
  evaluatorEventSchema,
  eventSchema,
  filterEventsByType,
  makeTimelineFromEvents,
  playerEventSchema,
  summaryEventSchema,
} from "~/events";
import { getMysteryById } from "~/server/database/mystery.server";
import invariant from "tiny-invariant";
import {
  addEventToMysteryEventSession,
  getMysteryEventSessionById,
} from "~/server/database/eventSession.server";

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
    console.log(mystery);
    const mysterySession = await getMysteryEventSessionById({
      id: mysterySessionId,
    });
    invariant(mysterySession !== null);
    const { World: world } = mystery;
    const timeline = makeTimelineFromEvents(
      filterEventsByType(mysterySession.Event, eventSchema)
    );

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

    if (aiEvent.status < 200 || aiEvent.status > 299) {
      throw new Error("Bad ai response");
    }

    const parts =
      aiEvent.data.choices
        .at(0)
        ?.text?.split("SUM:")
        .filter((f) => f)
        .map((f) => f.trim()) ?? [];
    invariant(parts.length >= 2);
    const [dm, sum] = parts;

    const newDMItem = dmEventSchema
      .merge(z.object({ id: z.undefined() }))
      .parse({
        type: "dm",
        content: dm.replace("- DM:", "").replace("- dm:", "") ?? "",
      });
    const newSummaryItem = summaryEventSchema
      .merge(z.object({ id: z.undefined() }))
      .parse({
        type: "summary",
        content: sum.replace("- Sum:", "").replace("- sum:", "") ?? "",
      });
    const newPlayerItem = playerEventSchema
      .merge(z.object({ id: z.undefined() }))
      .parse({
        type: "player",
        content: playerInput,
      });
    await addEventToMysteryEventSession({
      input: newPlayerItem,
      mysteryEventSessionId: mysterySessionId,
    });
    await addEventToMysteryEventSession({
      input: newDMItem,
      mysteryEventSessionId: mysterySessionId,
    });
    await addEventToMysteryEventSession({
      input: newSummaryItem,
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
