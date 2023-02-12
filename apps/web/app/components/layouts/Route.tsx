import { useLocation } from "@remix-run/react";
import { forwardRef } from "react";
import { Drawer } from "../atoms/Drawer";
import { Screen } from "../atoms/Screen";

type RouteProps = React.PropsWithChildren<{}>;

export const Route = forwardRef<HTMLDivElement, RouteProps>(
  ({ children }, ref) => {
    const location = useLocation();

    return (
      <Drawer
        id="main-drawer"
        items={[
          { label: "Explore", to: "/explore" },
          { label: "Create", to: "/create" },
        ].map((i) => ({ ...i, active: location.pathname.startsWith(i.to) }))}
      >
        <Screen ref={ref}>{children}</Screen>
      </Drawer>
    );
  }
);

Route.displayName = "Route";
