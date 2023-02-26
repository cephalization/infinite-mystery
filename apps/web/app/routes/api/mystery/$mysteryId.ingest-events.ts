import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";
import { eventSchema } from "~/events";
import { getMysteryById } from "~/server/database/mystery.server";
import invariant from "tiny-invariant";
import { createMysteryEventSessionWithEvents } from "~/server/database/eventSession.server";
import { authenticator } from "~/server/auth.server";
import { commitSession, getSession } from "~/server/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const redirectUrl = url.searchParams.get("redirect") ?? undefined;

  let headers: Headers | undefined = undefined;
  if (redirectUrl) {
    // manually get the session
    let session = await getSession(request.headers.get("cookie"));
    // and store the user data
    session.set("_redirect", redirectUrl);

    headers = new Headers({ "Set-Cookie": await commitSession(session) });
  }

  return redirect("/login", { headers });
};

export const action = async ({ request }: ActionArgs) => {
  try {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
      return json(
        {
          success: false,
          error: "User must be authenticated",
        },
        {
          status: 401,
        }
      );
    }
    invariant(user !== null);
    const rJson = await request.json();
    const { events, mysteryId } = z
      .object({
        events: z.array(eventSchema.omit({ id: true })),
        mysteryId: z.coerce.number(),
      })
      .parse(rJson);
    const mystery = await getMysteryById(mysteryId, true);
    invariant(mystery !== null);
    await createMysteryEventSessionWithEvents({
      input: events,
      mysteryId: mystery.id,
      userId: user.id,
    });

    return json({
      success: true,
      error: null,
    });
  } catch (e) {
    console.error(e);
    return json(
      { error: "Could not ingest events", detail: e, success: false },
      { status: 400 }
    );
  }
};
