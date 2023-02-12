import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Route } from "~/components/layouts/Route";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { prisma } from "~/server/prisma.server";
import { ActionInput } from "~/components/molecules/ActionInput";

export const loader = async () => {
  return json({
    userCount: await prisma.user.count(),
  });
};

export default function Index() {
  const { userCount } = useLoaderData<typeof loader>();

  return (
    <Route>
      <VerticalEdges>
        <section>
          <h1 className="text-4xl">Infinite Mystery</h1>
          <p className="text-primary text-2xl">{userCount} Users</p>
        </section>
        <section>
          <ActionInput />
        </section>
      </VerticalEdges>
    </Route>
  );
}
