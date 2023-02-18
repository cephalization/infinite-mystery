import { Link } from "@remix-run/react";
import clsx from "clsx";
import type { User } from "~/server/auth.server";
import { MenuIcon } from "../icons/MenuIcon";
import { ThemePicker } from "../molecules/ThemePicker";

export type DrawerItem = {
  label: React.ReactNode;
  to: string;
  active?: boolean;
};

type DrawerProps = React.PropsWithChildren<{
  id: string;
  items?: DrawerItem[];
  user?: User;
}>;

export const Drawer = ({ id, children, items = [], user }: DrawerProps) => {
  return (
    <div className="drawer drawer-mobile relative">
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <label
          htmlFor={id}
          className="btn btn-primary btn-square btn-ghost lg:hidden self-end absolute"
        >
          <MenuIcon />
        </label>
        {children}
      </div>
      <div className="drawer-side">
        <label htmlFor={id} className="drawer-overlay"></label>
        <ul className="menu p-4 pt-1 w-80 bg-base-300 border-r border-base-100 gap-2">
          <li className="text-primary text-2xl p-1">
            <Link to="/">Infinite Mystery</Link>
          </li>
          {items.map((item) => (
            <li key={item.to}>
              <Link
                className={clsx(
                  item.active && "btn-active text-neutral-content"
                )}
                to={item.to}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <ThemePicker />
          </li>
          <li className="flex grow bg-inherit">
            <p className="sr-only">
              Spacer between navigation items and authentication items
            </p>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/profile">Hi, {user.displayName}</Link>
              </li>
              <li>
                <Link to="/logout">Logout</Link>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
