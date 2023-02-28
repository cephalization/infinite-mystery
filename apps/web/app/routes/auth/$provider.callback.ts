// app/routes/auth/$provider.callback.tsx
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/server/auth.server";
import { getSession } from "~/server/session.server";

// Handle an auth callback from a configured provider like discord
export let loader = async ({ request, params }: LoaderArgs) => {
  let session = await getSession(request.headers.get("cookie"));
  const redirectUrl = session.get("_redirect") ?? "/explore";

  if (params.provider) {
    return authenticator.authenticate(params.provider, request, {
      successRedirect: redirectUrl,
      // @TODO this should pass an error message via query params
      failureRedirect: "/login",
    });
  }

  return redirect("/login");
};
