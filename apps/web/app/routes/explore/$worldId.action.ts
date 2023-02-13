import type { ActionArgs } from "@remix-run/node";
import type { EventItem } from "~/components/molecules/EventLog";
import { json } from "@remix-run/node";
import { aiClient } from "~/server/ai.server";
import { z } from "zod";

export const action = async ({ request }: ActionArgs) => {
  try {
    const rJson = await request.json();
    const { events, worldDescription, worldName } = z
      .object({
        events: z.array(
          z.object({
            type: z.string(),
            content: z.string(),
            id: z.coerce.number(),
          })
        ),
        worldDescription: z.string(),
        worldName: z.string(),
      })
      .parse(rJson);
    const aiEvent = await aiClient.agents.dungeonMaster({
      timeline: events.map((e) => `${e.type}: ${e.content}`.trim()),
      worldDescription,
      worldName,
    });
    const newItem: EventItem = {
      id: events.length + 1,
      type: "dm",
      content: aiEvent.data.choices.at(0)?.text?.replace("- DM:", "") ?? "",
    };

    return json({ events: [...events, newItem], error: null });
  } catch (e) {
    return json(
      { error: "Could not get new events", detail: e, events: null },
      { status: 400 }
    );
  }
};
