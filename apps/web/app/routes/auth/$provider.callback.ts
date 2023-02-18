// app/routes/auth/$provider.callback.tsx
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/server/auth.server";

// Handle an auth callback from a configured provider like discord
export let loader = ({ request, params }: LoaderArgs) => {
  if (params.provider) {
    return authenticator.authenticate(params.provider, request, {
      successRedirect: "/profile",
      // @TODO this should pass an error message via query params
      failureRedirect: "/login",
    });
  }

  return redirect("/login");
};
