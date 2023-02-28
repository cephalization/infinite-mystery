import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useTransition } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "react-use";
import invariant from "tiny-invariant";
import { z } from "zod";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { EventForm } from "~/components/molecules/EventForm";
import { MysteryHeader } from "~/components/molecules/MysteryHeader";
import type { AnyEventSchema } from "~/events";
import { playerEventSchema } from "~/events";
import { eventSchema, filterEventsByType } from "~/events";
import { useEvents } from "~/hooks/useEvents";
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
  // track a ref on an inner input so that it can be focused after events load in
  const actionInputRef = useRef<HTMLInputElement>(null);
  const [fetchLoading, setLoading] = useState(false);
  const { mystery } = useLoaderData<typeof loader>();
  const localStorageKey = `mystery/${mystery.id}/events`;
  // pull in events from localStorage, these are not rendered directly to prevent hydration errors
  const [localEvents, setLocalEvents] = useLocalStorage<AnyEventSchema[]>(
    localStorageKey,
    []
  );
  // events to render, will initialize as empty on server and client
  const { events, handleOptimisticEvent, setEvents } = useEvents([]);
  const initialized = useRef(events.length > 0);
  const transition = useTransition();

  const loading =
    transition.state === "submitting" || !events.length || fetchLoading;
  const { World: world } = mystery;

  const handleEventChange = useCallback(
    (e: AnyEventSchema[]) => {
      setEvents(e);
      setLocalEvents(e);
    },
    [setEvents, setLocalEvents]
  );

  const mysteryId = mystery.id;
  useEffect(() => {
    const f = async () => {
      initialized.current = true;
      setLoading(true);
      // set localStorage events after mount
      if (localEvents && localEvents.length) {
        handleEventChange(localEvents);
      } else {
        // if no localStorage events are preset, fetch em from the api
        const initialEvents = await fetchEvents({
          events: [],
          mysteryId,
        });
        if (Array.isArray(initialEvents)) {
          handleEventChange(initialEvents);
        }
      }
      setLoading(false);
    };
    if (!initialized.current) {
      f();
    }
  }, [mysteryId, handleEventChange, localEvents]);

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
        handleEventChange(newEvents);
        actionInputRef.current?.focus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setEvents([]);
    setLocalEvents([]);
    location.reload();
  }, [setEvents, setLocalEvents]);

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
        onReset={handleReset}
        saveUrl={`/api/mystery/${mystery.id}/ingest-events?redirect=/mystery/${mystery.id}/persist`}
        focusRef={actionInputRef}
      />
    </VerticalEdges>
  );
}
