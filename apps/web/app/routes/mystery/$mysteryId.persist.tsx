import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useLocalStorage } from "react-use";
import invariant from "tiny-invariant";
import { z } from "zod";
import type { AnyEventSchema } from "~/events";
import { eventSchema } from "~/events";
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

const persistEvents = async ({
  events,
  mysteryId,
}: {
  events: Omit<AnyEventSchema, "id">[];
  mysteryId: number | string;
  realismMode?: boolean;
}) => {
  try {
    const response = await fetch(`/api/mystery/${mysteryId}/ingest-events`, {
      body: JSON.stringify({
        events,
        mysteryId,
      }),
      method: "post",
    });
    const { success, error, detail } = await response.json();

    if (!success) {
      console.error(detail);
      throw new Error(error);
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: e as Error };
  }
};

const PersistMystery = () => {
  const initialized = useRef(false);
  const {
    mystery: { id },
  } = useLoaderData<typeof loader>();
  const [localEvents] = useLocalStorage(`mystery/${id}/events`);

  useEffect(() => {
    const persist = async () => {
      initialized.current = true;
      try {
        const { success } = await persistEvents({
          events: z.array(eventSchema.omit({ id: true })).parse(localEvents),
          mysteryId: id,
        });

        if (success) {
          location.replace(`/mystery/${id}`);
        } else {
          location.replace("/explore");
        }
      } catch (e) {
        console.error(e);
        location.replace("/explore");
      }
    };
    if (localEvents && id && !initialized.current) {
      persist();
    }
  }, [localEvents, id]);

  return null;
};

export default PersistMystery;
