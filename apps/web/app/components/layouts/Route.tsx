import { useLocation } from "@remix-run/react";
import { forwardRef } from "react";
import { Drawer } from "../atoms/Drawer";
import { Screen } from "../atoms/Screen";
import { MapIcon } from "../icons/MapIcon";
import { PlusCircleIcon } from "../icons/PlusCircleIcon";

type RouteProps = React.PropsWithChildren<{}>;

export const Route = forwardRef<HTMLDivElement, RouteProps>(
  ({ children }, ref) => {
    const location = useLocation();

    return (
      <Drawer
        id="main-drawer"
        items={[
          {
            label: (
              <>
                <MapIcon /> Explore
              </>
            ),
            to: "/explore",
          },
          {
            label: (
              <>
                <PlusCircleIcon /> Create
              </>
            ),
            to: "/create",
          },
        ].map((i) => ({ ...i, active: location.pathname.startsWith(i.to) }))}
      >
        <Screen ref={ref}>{children}</Screen>
      </Drawer>
    );
  }
);

Route.displayName = "Route";
