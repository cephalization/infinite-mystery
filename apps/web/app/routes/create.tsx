import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Route } from "~/components/layouts/Route";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { authenticator } from "~/server/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json({ user });
};

const Create = () => {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Route user={user}>
      <VerticalEdges>Create a new world</VerticalEdges>
    </Route>
  );
};

export default Create;
