import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { ActionInput } from "~/components/molecules/ActionInput";
import type { EventItem } from "~/components/molecules/EventLog";
import { EventLog } from "~/components/molecules/EventLog";
import { worlds as mockWorlds } from "~/mocks/worlds";
import invariant from "tiny-invariant";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";

export const loader = async ({ params }: LoaderArgs) => {
  try {
    const worldId = z.coerce.number().parse(params.worldId);
    const world = mockWorlds.find((w) => w.id === worldId);
    invariant(world !== undefined);

    return json({
      world,
    });
  } catch (e) {
    return redirect("/explore");
  }
};

const fetchEvents = async ({
  events,
  worldDescription,
  worldName,
  worldId,
}: {
  events: EventItem[];
  worldName: string;
  worldDescription: string;
  worldId: number | string;
}) => {
  try {
    const response = await fetch(`/explore/${worldId}/action`, {
      body: JSON.stringify({
        events,
        worldName,
        worldDescription,
      }),
      method: "post",
    });
    const json = await response.json();

    return json.events;
  } catch (e) {
    console.error(e);
  }
};

export default function ExploreWorldById() {
  const initialized = useRef(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const { world } = useLoaderData<typeof loader>();

  const worldId = world.id;
  const worldName = world.name;
  const worldDescription = world.description;
  useEffect(() => {
    const f = async () => {
      initialized.current = true;
      setLoading(true);
      const initialEvents = await fetchEvents({
        events: [],
        worldDescription,
        worldId,
        worldName,
      });
      setLoading(false);
      if (initialEvents) {
        setEvents(initialEvents);
      }
    };
    if (!initialized.current) {
      f();
    }
  }, [worldDescription, worldId, worldName]);

  return (
    <VerticalEdges>
      <section>
        <h1 className="text-3xl">
          Welcome to <b className="text-primary">{world.name}</b>
        </h1>
        <h3 className="text-neutral-content">{world.description}</h3>
      </section>
      <section>
        <EventLog events={events} loading={loading} />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (loading) return;

            const form = new FormData(e.currentTarget);

            const input = form.get("action-input");

            if (input) {
              setLoading(true);
              const newEvents = [
                ...events,
                {
                  content: input.toString(),
                  type: "player",
                  id: events.length + 1,
                } as EventItem,
              ];
              setEvents(newEvents);
              const inputEl = e.currentTarget.elements.namedItem(
                "action-input"
              ) as HTMLInputElement;
              inputEl.value = "";
              try {
                const nextEvents = await fetchEvents({
                  events: newEvents,
                  worldId,
                  worldName,
                  worldDescription,
                });
                if (nextEvents) {
                  setEvents(nextEvents);
                }
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }
          }}
        >
          <ActionInput loading={loading} disabled={loading} />
        </form>
      </section>
    </VerticalEdges>
  );
}