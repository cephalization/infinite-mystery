import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Route } from "~/components/layouts/Route";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { authenticator } from "~/server/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request);

  return json({ user });
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Route user={user}>
      <VerticalEdges>
        <section className="h-full">
          <div className="hero h-full mt-10 lg:mt-0 bg-base-200">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold">Infinite Mystery</h1>
                <p className="py-6">
                  Solve endless mysteries, in endless worlds, created by You.
                </p>
                <Link to="/explore" className="btn btn-primary">
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </section>
      </VerticalEdges>
    </Route>
  );
}
