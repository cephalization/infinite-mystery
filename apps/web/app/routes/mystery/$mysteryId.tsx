import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigation, useTransition } from "@remix-run/react";
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
import { usePersistedEvents } from "~/hooks/usePersistedEvents";
import { usePolledLoaderData } from "~/hooks/usePolledLoaderData";

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
    let initialized = false;
    if (user) {
      const eventSession = await getEventSessionByMysteryId({
        userId: user.id,
        mysteryId,
      });

      events = filterEventsByType(eventSession.Event, eventSchema);
      initialized = eventSession.initialized;
    }
    invariant(mystery !== null);
    return json({
      mystery,
      events,
      initialized,
    });
  } catch (e) {
    return redirect("/mystery");
  }
};

export default function ExploremysteryById() {
  const navigation = useNavigation();
  const {
    mystery,
    events: initialEvents,
    initialized,
  } = usePolledLoaderData<typeof loader>(
    navigation.location?.pathname ?? "",
    (d) => !d.events.length
  );
  const actionData = useActionData<typeof action>();
  const { events, handleOptimisticEvent } = usePersistedEvents(
    initialEvents,
    actionData?.events ?? []
  );
  const transition = useTransition();

  const loading = transition.state === "submitting" || !events.length;
  const { World: world } = mystery;

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
        intializeEvents={!initialized}
      />
    </VerticalEdges>
  );
}
