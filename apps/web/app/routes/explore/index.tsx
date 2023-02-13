import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
    <VerticalEdges>
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
    </VerticalEdges>
  );
};

export default ExploreIndex;
