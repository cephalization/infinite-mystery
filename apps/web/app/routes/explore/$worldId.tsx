import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { ActionInput } from "~/components/molecules/ActionInput";
import { EventLog } from "~/components/molecules/EventLog";
import { useState } from "react";
import { events } from "~/mocks/events";
import { worlds as mockWorlds } from "~/mocks/worlds";
import invariant from "tiny-invariant";
import { z } from "zod";

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

export default function ExploreWorldById() {
  const { world } = useLoaderData<typeof loader>();
  const [mockEvents, setMockEvents] = useState(events);

  return (
    <VerticalEdges>
      <section>
        <h1 className="text-3xl">
          Welcome to <b className="text-primary">{world.name}</b>
        </h1>
        <h3 className="text-neutral-content">{world.description}</h3>
      </section>
      <section>
        <EventLog events={mockEvents} />
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const form = new FormData(e.currentTarget);

            const input = form.get("action-input");

            if (input) {
              setMockEvents((e) => [
                ...e,
                {
                  content: input.toString(),
                  type: "player",
                  id: e.length + 1,
                },
              ]);
              const inputEl = e.currentTarget.elements.namedItem(
                "action-input"
              ) as HTMLInputElement;
              inputEl.value = "";
            }
          }}
        >
          <ActionInput />
        </form>
      </section>
    </VerticalEdges>
  );
}
