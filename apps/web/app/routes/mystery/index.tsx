import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Route } from "~/components/layouts/Route";
import { Scroller } from "~/components/layouts/Scroller";
import { CardList } from "~/components/molecules/CardList";
import { MysteryCard } from "~/components/molecules/MysteryCard";
import { authenticator } from "~/server/auth.server";
import { getMysterys } from "~/server/database/mystery.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request);
  const mysteries = await getMysterys();

  return json({
    user,
    mysteries,
  });
};

const MysteryIndex = () => {
  const { mysteries, user } = useLoaderData<typeof loader>();

  return (
    <Route user={user}>
      <section className="mb-4">
        <h1 className="text-3xl">
          Browse <b className="text-primary">Mysteries</b>
        </h1>
        <h3 className="text-neutral-content">Choose a mystery to solve.</h3>
      </section>
      <Scroller className="mt-8">
        <CardList>
          {mysteries.map((m) => (
            <MysteryCard
              key={m.id}
              id={m.id}
              title={m.title}
              location={m.World?.name}
              imageSrc={m?.previewImg ?? undefined}
            />
          ))}
        </CardList>
      </Scroller>
    </Route>
  );
};

export default MysteryIndex;
