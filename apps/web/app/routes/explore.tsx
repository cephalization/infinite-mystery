import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Route } from "~/components/layouts/Route";
import { authenticator } from "~/server/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request);

  return json({ user });
};

const Explore = () => {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Route user={user}>
      <Outlet />
    </Route>
  );
};

export default Explore;
