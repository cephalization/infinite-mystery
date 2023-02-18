import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Route } from "~/components/layouts/Route";
import { authenticator } from "~/server/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return json({ user });
};

const ProfileRouter = () => {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Route user={user}>
      <div>Hi, {user.displayName}</div>
      <div>Here you will be able to customize your profile</div>
      <div>Eventually...</div>
      <div className="mt-4 flex flex-col gap-4 w-1/5">
        <Link className="btn btn-primary" to="/explore">
          Explore Worlds
        </Link>
        <Link className="btn btn-primary" to="/create">
          Create World
        </Link>
      </div>
    </Route>
  );
};

export default ProfileRouter;
