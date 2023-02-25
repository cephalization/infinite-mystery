import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useTransition } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { EventForm } from "~/components/molecules/EventForm";
import { MysteryHeader } from "~/components/molecules/MysteryHeader";
import type { AnyEventSchema } from "~/events";
import { playerEventSchema } from "~/events";
import { eventSchema, filterEventsByType } from "~/events";
import { usePersistedEvents } from "~/hooks/usePersistedEvents";
import { getMysteryById } from "~/server/database/mystery.server";

export const loader = async ({ params }: LoaderArgs) => {
  try {
    const mysteryId = z.coerce.number().parse(params.mysteryId);
    const mystery = await getMysteryById(mysteryId);
    invariant(mystery !== null);
    return json({
      mystery,
    });
  } catch (e) {
    return redirect("/explore");
  }
};

const fetchEvents = async ({
  events,
  mysteryId,
  realismMode = true,
}: {
  events: AnyEventSchema[];
  mysteryId: number | string;
  realismMode?: boolean;
}) => {
  try {
    const response = await fetch(`/api/mystery/${mysteryId}/generate-events`, {
      body: JSON.stringify({
        events,
        mysteryId,
        realismMode,
      }),
      method: "post",
    });
    const json = await response.json();
    return filterEventsByType(json.events, eventSchema);
  } catch (e) {
    console.error(e);
    return e as Error;
  }
};

export default function ExploremysteryByIdLocal() {
  const initialized = useRef(false);
  const [fetchLoading, setLoading] = useState(false);
  const { mystery } = useLoaderData<typeof loader>();
  const [localEvents, setLocalEvents] = useState<AnyEventSchema[]>([]);
  const { events, handleOptimisticEvent } = usePersistedEvents(localEvents);
  const transition = useTransition();

  const loading =
    transition.state === "submitting" || !events.length || fetchLoading;
  const { World: world } = mystery;

  const mysteryId = mystery.id;
  useEffect(() => {
    const f = async () => {
      initialized.current = true;
      setLoading(true);
      const initialEvents = await fetchEvents({
        events: [],
        mysteryId,
      });
      setLoading(false);
      if (Array.isArray(initialEvents)) {
        setLocalEvents(initialEvents);
      }
    };
    if (!initialized.current) {
      f();
    }
  }, [mysteryId]);

  const handleSubmit = async (e: HTMLFormElement) => {
    setLoading(true);
    try {
      const formData = new FormData(e);

      const playerAction = formData.get("action-input");
      const realismMode = z.coerce
        .boolean()
        .parse(formData.get("realism-mode"));
      const playerEvent = playerEventSchema.parse({
        content: playerAction?.toString(),
        type: "player",
        id: events.length + 1,
      });

      const newEvents = await fetchEvents({
        events: [...events, playerEvent],
        mysteryId,
        realismMode,
      });

      if (Array.isArray(newEvents)) {
        setLocalEvents(newEvents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerticalEdges>
      <MysteryHeader
        brief={mystery.brief}
        title={mystery.title}
        worldDescription={world.description}
        worldName={world.name}
      />
      <EventForm
        addOptimisticEvent={handleOptimisticEvent}
        events={events}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </VerticalEdges>
  );
}
