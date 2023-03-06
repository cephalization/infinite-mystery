import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { aiClient } from "~/server/ai.server";
import { z } from "zod";
import {
  dmEventSchema,
  evaluatorEventSchema,
  eventSchema,
  makeTimelineFromEvents,
} from "~/events";
import * as R from "remeda";
import invariant from "tiny-invariant";
import { getWorldById } from "~/server/database/world.server";

export const action = async ({ request }: ActionArgs) => {
  try {
    const rJson = await request.json();
    const { events, realismMode, worldId } = z
      .object({
        events: z.array(eventSchema),
        realismMode: z.coerce.boolean().optional().default(true),
        worldId: z.coerce.number(),
      })
      .parse(rJson);
    const world = await getWorldById(worldId);
    invariant(world !== null);
    const timeline = makeTimelineFromEvents(events);
    const action = `${
      R.findLast(events, (e) => e.type === "player")?.content ?? ""
    }`;
    const { name: worldName, description: worldDescription } = world;
    if (timeline.length && realismMode) {
      const evaluation = await aiClient.agents.evaluator({
        worldName,
        worldDescription,
        timeline,
        action,
      });
      if (evaluation) {
        const { valid, reason } = evaluation;

        if (!valid) {
          const newItem = evaluatorEventSchema.parse({
            id: events.length + 1,
            type: "evaluator",
            content: reason ?? "You cannot do that.",
          });

          return json({
            events: [
              ...events.slice(0, -1),
              { ...events.at(-1), invalidAction: true },
              newItem,
            ],
            error: null,
          });
        }
      }
    }

    const aiEvent = await aiClient.agents.exploreDungeonMaster({
      timeline,
      worldDescription,
      worldName,
      action,
    });

    if (!aiEvent) {
      throw new Error("Could not get response from Explore Dungeon Master");
    }

    const dm = aiEvent;

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
