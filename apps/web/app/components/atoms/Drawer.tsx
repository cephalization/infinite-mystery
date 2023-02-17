import { Link } from "@remix-run/react";
import clsx from "clsx";
import { MenuIcon } from "../icons/MenuIcon";

export type DrawerItem = {
  label: React.ReactNode;
  to: string;
  active?: boolean;
};

type DrawerProps = React.PropsWithChildren<{
  id: string;
  items?: DrawerItem[];
}>;

export const Drawer = ({ id, children, items = [] }: DrawerProps) => {
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
        <ul className="menu p-4 pt-1 w-80 bg-base-300 border-r border-base-100">
          <li className="text-primary text-2xl p-1">
            <Link to="/">Infinite Mystery</Link>
          </li>
          {items.map((item) => (
            <li key={item.to}>
              <Link className={clsx(item.active && "btn-active")} to={item.to}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
