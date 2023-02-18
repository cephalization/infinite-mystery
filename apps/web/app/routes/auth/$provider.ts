// app/routes/auth/$provider.tsx
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/server/auth.server";

export let loader = () => redirect("/login");

// Start auth process with a req to /auth/$provider
export let action = ({ request, params }: ActionArgs) => {
  if (params.provider) {
    return authenticator.authenticate(params.provider, request);
  }

  return redirect("/login");
};
