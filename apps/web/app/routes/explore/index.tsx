import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Scroller } from "~/components/layouts/Scroller";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";
import { CardList } from "~/components/molecules/CardList";
import { WorldCard } from "~/components/molecules/WorldCard";
import { worlds as mockWorlds } from "~/mocks/worlds";

export type World = {
  name: string;
  description?: string;
  imageSrc?: string;
  id: number | string;
};

export const loader = () => {
  return json({
    worlds: mockWorlds,
  });
};

const ExploreIndex = () => {
  const { worlds } = useLoaderData<typeof loader>();
  return (
    <>
      <section>
        <h1 className="text-3xl">
          Browse <b className="text-primary">Worlds</b>
        </h1>
        <h3 className="text-neutral-content">
          Choose a world, solve a mystery inside.
        </h3>
      </section>
      <Scroller className="mt-8">
        <CardList>
          {worlds.map((w) => (
            <WorldCard
              key={w.id}
              id={w.id}
              name={w.name}
              description={w.description}
              imageSrc={w.imageSrc}
            />
          ))}
        </CardList>
      </Scroller>
    </>
  );
};

export default ExploreIndex;
