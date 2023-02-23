import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { ActionInput } from "~/components/molecules/ActionInput";
import { EventLog } from "~/components/molecules/EventLog";
import invariant from "tiny-invariant";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import type { AnyEventSchema } from "~/events";
import { eventSchema, filterEventsByType } from "~/events";
import { getMysteryById } from "~/server/database/mystery.server";
import { getEventSessionByMysteryId } from "~/server/database/eventSession.server";
import { authenticator } from "~/server/auth.server";
import { serverConfig } from "~/server/config.server";

// const fetchEvents = async ({
//   events,
//   mysteryId,
//   realismMode,
// }: {
//   events: AnyEventSchema[];
//   mysteryId: number | string;
//   realismMode?: boolean;
// }) => {
//   try {
//     const response = await fetch(`/mystery/${mysteryId}/action`, {
//       body: JSON.stringify({
//         events,
//         mysteryId,
//         realismMode,
//       }),
//       method: "post",
//     });
//     const json = await response.json();
//     return json.events;
//   } catch (e) {
//     console.error(e);
//   }
// };

const persistEvents = async ({
  playerInput,
  mysteryId,
  mysterySessionId,
  realismMode,
}: {
  playerInput: string;
  mysteryId: number;
  mysterySessionId: number;
  realismMode?: boolean;
}) => {
  try {
    const response = await fetch(
      `${serverConfig.WEB_URL}/mystery/${mysteryId}/session`,
      {
        body: JSON.stringify({
          playerInput,
          mysteryId,
          mysterySessionId,
          realismMode,
        }),
        method: "post",
      }
    );
    const json = await response.json();

    if (!json.success) {
      throw new Error(json.error);
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const action = async ({ request, params }: ActionArgs) => {
  try {
    const form = await request.formData();
    const input = z.coerce.string().parse(form.get("action-input"));
    const realismMode = z.coerce.boolean().parse(form.get("realism-mode"));

    const user = await authenticator.isAuthenticated(request);
    invariant(user !== null);
    const mysteryId = z.coerce.number().parse(params.mysteryId);
    invariant(mysteryId !== null);
    const eventSession = await getEventSessionByMysteryId({
      userId: user.id,
      mysteryId,
    });
    invariant(eventSession !== null);

    const success = await persistEvents({
      playerInput: input,
      mysteryId,
      mysterySessionId: eventSession.id,
      realismMode,
    });

    if (!success) {
      throw new Error("Could not persist events from action");
    }

    const newEvents = await getEventSessionByMysteryId({
      userId: user.id,
      mysteryId,
    });
    invariant(newEvents !== null);
    const events = filterEventsByType(newEvents.Event, eventSchema);

    return json({ events });
  } catch (e) {
    console.error(e);
    return json({ events: [] });
  }
};

export const loader = async ({ params, request }: LoaderArgs) => {
  try {
    const user = await authenticator.isAuthenticated(request);
    const mysteryId = z.coerce.number().parse(params.mysteryId);
    const mystery = await getMysteryById(mysteryId);
    let events: AnyEventSchema[] = [];
    if (user) {
      const eventSession = await getEventSessionByMysteryId({
        userId: user.id,
        mysteryId,
      });

      events = filterEventsByType(eventSession.Event, eventSchema);
    }
    invariant(mystery !== null);
    return json({
      mystery,
      events,
    });
  } catch (e) {
    return redirect("/mystery");
  }
};

export default function ExploremysteryById() {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { mystery, events: loaderEvents } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useTransition();
  const submit = useSubmit();
  const [events, setEvents] = useState(loaderEvents);

  const loading = transition.state === "submitting";
  const { World: world } = mystery;

  // Submit an empty player action if there are no events yet
  useEffect(() => {
    if (!events.length) {
      submit(formRef.current, {
        replace: true,
        method: "post",
        preventScrollReset: true,
      });
    }
  }, [submit, events]);

  // Load new events into local state when received via an action
  useEffect(() => {
    if (actionData?.events.length) {
      setEvents(actionData.events);
    }
  }, [actionData]);

  /**
   * Handle form submissions
   *
   * We do this in JS via native event handling so that we can mess with input
   * and scroll during submission
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (loading) return;

    const form = new FormData(e.currentTarget);
    const input = z.coerce.string().parse(form.get("action-input"));

    if (input) {
      setEvents((evt) => [...evt, { type: "player", content: input, id: -1 }]);
      submit(e.currentTarget, {
        replace: true,
        method: "post",
        preventScrollReset: true,
      });

      if (inputRef.current) {
        inputRef.current.value = "";
        // HACK
        // blur the input so that safari doesn't hijack scroll
        inputRef.current.blur();
        inputRef.current.focus();
      }
    }
  };

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
        <Form onSubmit={handleSubmit} ref={formRef}>
          <ActionInput loading={loading} disabled={loading} ref={inputRef} />
        </Form>
      </section>
    </VerticalEdges>
  );
}
