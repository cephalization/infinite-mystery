import { forwardRef } from "react";
import { Drawer } from "../atoms/Drawer";
import { Screen } from "../atoms/Screen";

type RouteProps = React.PropsWithChildren<{}>;

export const Route = forwardRef<HTMLDivElement, RouteProps>(
  ({ children }, ref) => {
    return (
      <Drawer
        id="main-drawer"
        items={[
          { label: "Create", to: "/create" },
          { label: "Explore", to: "/explore" },
        ]}
      >
        <Screen ref={ref}>{children}</Screen>
      </Drawer>
    );
  }
);

Route.displayName = "Route";
