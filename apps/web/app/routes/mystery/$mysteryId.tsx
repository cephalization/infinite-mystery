import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useTransition } from "@remix-run/react";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import invariant from "tiny-invariant";
import { z } from "zod";
import type { AnyEventSchema } from "~/events";
import { eventSchema, filterEventsByType } from "~/events";
import { getMysteryById } from "~/server/database/mystery.server";
import { getEventSessionByMysteryId } from "~/server/database/eventSession.server";
import { authenticator } from "~/server/auth.server";
import { serverConfig } from "~/server/config.server";
import { MysteryHeader } from "~/components/molecules/MysteryHeader";
import { EventForm } from "~/components/molecules/EventForm";
import { useEvents } from "~/hooks/useEvents";
import { usePolledLoaderData } from "~/hooks/usePolledLoaderData";
import { useActiveRoute } from "~/hooks/useActiveRoute";
import { getEventsByMysteryId } from "~/server/database/event.server";
import { useCallback } from "react";

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
      `${serverConfig.WEB_URL}/api/mystery/${mysteryId}/persist-events`,
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
  console.log("action called");
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
  console.log("loader called");
  try {
    const user = await authenticator.isAuthenticated(request);
    const mysteryId = z.coerce.number().parse(params.mysteryId);
    const mystery = await getMysteryById(mysteryId);
    invariant(mystery !== null);

    let events: AnyEventSchema[] = [];
    let initialized = false;
    let eventSessionId: undefined | number;

    // Authenticated users will do event parsing with the session backed endpoint
    // and db
    if (user) {
      const eventSession = await getEventSessionByMysteryId({
        userId: user.id,
        mysteryId,
      });
      const eventsBySession = await getEventsByMysteryId(eventSession.id);

      events = filterEventsByType(eventsBySession, eventSchema);

      if (!events.length && !eventSession.initialized) {
        console.log("Generating brief");
        persistEvents({
          playerInput: "",
          mysteryId,
          mysterySessionId: eventSession.id,
        });
      }

      initialized = eventSession.initialized;
      eventSessionId = eventSession.id;
    } else {
      return redirect(`/mystery/${mysteryId}/local`);
    }

    return json({
      mystery,
      events,
      eventSessionId,
      initialized,
    });
  } catch (e) {
    return redirect("/mystery");
  }
};

export default function ExploremysteryById() {
  const { pathname } = useActiveRoute();
  const {
    mystery,
    events: initialEvents,
    eventSessionId,
  } = usePolledLoaderData<typeof loader>(pathname, (d) => !d.events.length);
  const actionData = useActionData<typeof action>();
  const { events, handleOptimisticEvent } = useEvents(
    actionData?.events ?? initialEvents ?? []
  );
  const transition = useTransition();

  const loading = transition.state === "submitting" || !events.length;
  const { World: world } = mystery;

  const mysteryId = mystery.id;
  const handleReset = useCallback(async () => {
    const response = await fetch(`/api/mystery/${mysteryId}/reset-session`, {
      method: "post",
      body: JSON.stringify({
        mysterySessionId: eventSessionId,
      }),
    });

    const { success } = await response.json();

    if (success) {
      location.reload();
    }
  }, [eventSessionId, mysteryId]);

  return (
    <VerticalEdges>
      <MysteryHeader
        brief={mystery.brief}
        title={mystery.title}
        worldDescription={world.description}
        worldName={world.name}
      />
      <EventForm
        onReset={handleReset}
        addOptimisticEvent={handleOptimisticEvent}
        events={events}
        loading={loading}
        status={loading ? null : `saved session ${eventSessionId}`}
      />
    </VerticalEdges>
  );
}
