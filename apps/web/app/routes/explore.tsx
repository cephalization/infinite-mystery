import { Outlet } from "@remix-run/react";
import { Route } from "~/components/layouts/Route";

const Explore = () => {
  return (
    <Route>
      <Outlet />
    </Route>
  );
};

export default Explore;
