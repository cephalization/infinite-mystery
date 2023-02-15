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

export const action = async ({ request }: ActionArgs) => {
  try {
    const rJson = await request.json();
    const { events, worldDescription, worldName, narcMode } = z
      .object({
        events: z.array(eventSchema),
        worldDescription: z.string(),
        worldName: z.string(),
        narcMode: z.coerce.boolean().optional().default(true),
      })
      .parse(rJson);
    const timeline = makeTimelineFromEvents(events);

    if (timeline.length && narcMode) {
      const evaluation = await aiClient.agents.evaluator({
        worldName,
        worldDescription,
        timeline,
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

    const aiEvent = await aiClient.agents.dungeonMaster({
      timeline,
      worldDescription,
      worldName,
    });

    const newItem = dmEventSchema.parse({
      id: events.length + 1,
      type: "dm",
      content: aiEvent.data.choices.at(0)?.text?.replace("- DM:", "") ?? "",
    });

    return json({ events: [...events, newItem], error: null });
  } catch (e) {
    return json(
      { error: "Could not get new events", detail: e, events: null },
      { status: 400 }
    );
  }
};
