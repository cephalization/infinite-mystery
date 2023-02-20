import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { aiClient } from "~/server/ai.server";
import { z } from "zod";
import {
  dmEventSchema,
  evaluatorEventSchema,
  eventSchema,
  makeTimelineFromEvents,
  summaryEventSchema,
} from "~/events";
import { getMysteryById } from "~/server/database/mystery.server";
import invariant from "tiny-invariant";
import * as R from "remeda";

export const action = async ({ request }: ActionArgs) => {
  try {
    const rJson = await request.json();
    const { events, mysteryId, realismMode } = z
      .object({
        events: z.array(eventSchema),
        mysteryId: z.coerce.number(),
        realismMode: z.coerce.boolean().optional().default(true),
      })
      .parse(rJson);
    const mystery = await getMysteryById(mysteryId, true);
    invariant(mystery !== null);
    const { World: world } = mystery;
    const timeline = makeTimelineFromEvents(events);
    const action = `${
      R.findLast(events, (e) => e.type === "player")?.content ?? ""
    }`;

    if (timeline.length && realismMode) {
      const evaluation = await aiClient.agents.evaluator({
        worldName: world.name,
        worldDescription: world.description,
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

    const aiEvent = await aiClient.agents.mysteryDungeonMaster({
      timeline,
      worldDescription: world.description,
      worldName: world.name,
      brief: mystery.brief,
      crime: mystery.crime,
      action,
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

    const newDMItem = dmEventSchema.parse({
      id: events.length + 1,
      type: "dm",
      content: dm.replace("- DM:", "").replace("- dm:", "") ?? "",
    });
    const newSummaryItem = summaryEventSchema.parse({
      id: events.length + 2,
      type: "summary",
      content: sum.replace("- Sum:", "").replace("- sum:", "") ?? "",
    });

    return json({
      events: [...events, newDMItem, newSummaryItem],
      error: null,
    });
  } catch (e) {
    return json(
      { error: "Could not get new events", detail: e, events: null },
      { status: 400 }
    );
  }
};
