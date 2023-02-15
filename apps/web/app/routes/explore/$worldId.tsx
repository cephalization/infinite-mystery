import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { ActionInput } from "~/components/molecules/ActionInput";
import { EventLog } from "~/components/molecules/EventLog";
import { worlds as mockWorlds } from "~/mocks/worlds";
import invariant from "tiny-invariant";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import type { AnyEventSchema } from "~/events";
import { playerEventSchema } from "~/events";

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
  narcMode = true,
}: {
  events: AnyEventSchema[];
  worldName: string;
  worldDescription: string;
  worldId: number | string;
  narcMode?: boolean;
}) => {
  try {
    const response = await fetch(`/explore/${worldId}/action`, {
      body: JSON.stringify({
        events,
        worldName,
        worldDescription,
        narcMode,
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<AnyEventSchema[]>([]);
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
        inputRef.current?.focus();
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

            const input = z.coerce.string().parse(form.get("action-input"));
            const narcMode = z.coerce.boolean().parse(form.get("narc-mode"));

            if (input) {
              setLoading(true);
              const newEvents = [
                ...events,
                playerEventSchema.parse({
                  content: input.toString(),
                  type: "player",
                  id: events.length + 1,
                }),
              ];
              setEvents(newEvents);
              if (inputRef.current) {
                inputRef.current.value = "";
                // HACK
                // blur the input so that safari doesn't hijack scroll
                inputRef.current.blur();
              }
              try {
                const nextEvents = await fetchEvents({
                  events: newEvents,
                  worldId,
                  worldName,
                  worldDescription,
                  narcMode,
                });
                if (nextEvents) {
                  setEvents(nextEvents);
                  inputRef.current?.focus();
                }
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }
          }}
        >
          <ActionInput loading={loading} disabled={loading} ref={inputRef} />
        </form>
      </section>
    </VerticalEdges>
  );
}
