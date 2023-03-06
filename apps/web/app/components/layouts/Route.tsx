import { useLocation } from "@remix-run/react";
import { forwardRef } from "react";
import { Notifications } from "~/components/molecules/Notifications";
import { useNotifications } from "~/hooks/useNotifications";
import type { User } from "~/server/auth.server";
import { Drawer } from "../atoms/Drawer";
import { Screen } from "../atoms/Screen";
import { MapIcon } from "../icons/MapIcon";
import { PlusCircleIcon } from "../icons/PlusCircleIcon";

type RouteProps = React.PropsWithChildren<{
  user: User | null;
}>;

export const Route = forwardRef<HTMLDivElement, RouteProps>(
  ({ children, user }, ref) => {
    const location = useLocation();
    const { notifications, removeNotification } = useNotifications([]);

    return (
      <main className="p-1">
        <Notifications
          notifications={notifications}
          onRemove={removeNotification}
        />
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
          user={user || undefined}
        >
          <Screen ref={ref}>{children}</Screen>
        </Drawer>
      </main>
    );
  }
);

Route.displayName = "Route";
