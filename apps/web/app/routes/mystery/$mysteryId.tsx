import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { ActionInput } from "~/components/molecules/ActionInput";
import { EventLog } from "~/components/molecules/EventLog";
import invariant from "tiny-invariant";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import type { AnyEventSchema } from "~/events";
import { playerEventSchema } from "~/events";
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
    return redirect("/mystery");
  }
};

const fetchEvents = async ({
  events,
  mysteryId,
  realismMode,
}: {
  events: AnyEventSchema[];
  mysteryId: number | string;
  realismMode?: boolean;
}) => {
  try {
    const response = await fetch(`/mystery/${mysteryId}/action`, {
      body: JSON.stringify({
        events,
        mysteryId,
        realismMode,
      }),
      method: "post",
    });
    const json = await response.json();
    return json.events;
  } catch (e) {
    console.error(e);
  }
};

export default function ExploremysteryById() {
  const initialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<AnyEventSchema[]>([]);
  const { mystery } = useLoaderData<typeof loader>();
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
      if (initialEvents) {
        setEvents(initialEvents);
        inputRef.current?.focus();
      }
    };
    if (!initialized.current) {
      f();
    }
  }, [mysteryId]);

  console.log({ events });

  return (
    <VerticalEdges>
      <section>
        <h1 className="text-3xl">
          Mystery <b className="text-primary">{mystery.title}</b>
        </h1>
        <h3 className="text-neutral-content">{mystery.brief}</h3>
        <br />
        <h1 className="text-xl">
          Location: <b className="text-primary">{world.name}</b>
        </h1>
        <h3 className="text-sm text-neutral-content">{world.description}</h3>
      </section>
      <section>
        <EventLog events={events} loading={loading} />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (loading) return;

            const form = new FormData(e.currentTarget);

            const input = z.coerce.string().parse(form.get("action-input"));
            const realismMode = z.coerce
              .boolean()
              .parse(form.get("realism-mode"));

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
                  mysteryId,
                  realismMode,
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
