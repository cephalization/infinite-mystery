import { Route } from "~/components/layouts/Route";
import { VerticalEdges } from "~/components/layouts/VerticalEdges";

export default function Index() {
  return (
    <Route>
      <VerticalEdges>
        <section className="flex flex-col gap-4">
          <h1 className="text-4xl">Infinite Mystery</h1>
          <h3 className="text-xl text-primary">Solve infinite mysteries</h3>
        </section>
      </VerticalEdges>
    </Route>
  );
}
