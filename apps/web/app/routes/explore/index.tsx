import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Screen } from "~/components/atoms/Screen";
import { Tab } from "~/components/atoms/Tab";
import { Tabs } from "~/components/atoms/Tabs";
import { Scroller } from "~/components/layouts/Scroller";
import { CardList } from "~/components/molecules/CardList";
import { MysteryCard } from "~/components/molecules/MysteryCard";
import { WorldCard } from "~/components/molecules/WorldCard";
import { useTabs } from "~/hooks/useTabs";
import { getMysterys } from "~/server/database/mystery.server";
import { getWorlds } from "~/server/database/world.server";

export type World = {
  name: string;
  description: string;
  imageSrc?: string;
  id: number | string;
};

export const loader = async () => {
  const worlds = await getWorlds();
  const mysteries = await getMysterys();

  return json({
    worlds,
    mysteries,
  });
};

const tabs = [
  { hash: "mysteries", label: "Mysteries" },
  { label: "Worlds", hash: "worlds" },
];

const ExploreIndex = () => {
  const { worlds, mysteries } = useLoaderData<typeof loader>();
  const { activeMap } = useTabs(tabs);

  return (
    <Screen>
      <Tabs>
        {tabs.map((t) => (
          <Tab key={t.hash} name={t.hash} active={activeMap[t.hash]}>
            {t.label}
          </Tab>
        ))}
      </Tabs>
      <Scroller className="mt-8">
        {activeMap["mysteries"] && (
          <>
            <section className="mb-4">
              <h1 className="text-3xl">
                Browse <b className="text-primary">Mysteries</b>
              </h1>
              <h3 className="text-neutral-content">
                Choose a mystery to solve.
              </h3>
            </section>
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
          </>
        )}
        {activeMap["worlds"] && (
          <>
            <section className="mb-4">
              <h1 className="text-3xl">
                Browse <b className="text-primary">Worlds</b>
              </h1>
              <h3 className="text-neutral-content">
                Choose a world, freely explore it.
              </h3>
            </section>
            <CardList>
              {worlds.map((w) => (
                <WorldCard
                  key={w.id}
                  id={w.id}
                  name={w.name}
                  description={w.description}
                  imageSrc={w?.previewImg ?? undefined}
                />
              ))}
            </CardList>
          </>
        )}
      </Scroller>
    </Screen>
  );
};

export default ExploreIndex;
