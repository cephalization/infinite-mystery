import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Route } from "~/components/layouts/Route";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { prisma } from "~/server/prisma.server";
import { ActionInput } from "~/components/molecules/ActionInput";
import { EventLog } from "~/components/molecules/EventLog";
import { useState } from "react";
import { events } from "~/mocks/events";

export const loader = async () => {
  return json({
    userCount: await prisma.user.count(),
  });
};

export default function Index() {
  const { userCount } = useLoaderData<typeof loader>();
  const [mockEvents, setMockEvents] = useState(events);

  console.log({ users: userCount });

  return (
    <Route>
      <VerticalEdges>
        <section></section>
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
    </Route>
  );
}
