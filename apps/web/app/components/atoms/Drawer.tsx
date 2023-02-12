import { Link } from "@remix-run/react";
import { MenuIcon } from "../icons/MenuIcon";

export type DrawerItem = {
  label: React.ReactNode;
  to: string;
};

type DrawerProps = React.PropsWithChildren<{
  id: string;
  items?: DrawerItem[];
}>;

export const Drawer = ({ id, children, items = [] }: DrawerProps) => {
  return (
    <div className="drawer drawer-mobile">
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <label
          htmlFor={id}
          className="btn btn-primary btn-square btn-ghost lg:hidden self-end"
        >
          <MenuIcon />
        </label>
        {children}
      </div>
      <div className="drawer-side">
        <label htmlFor={id} className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 bg-base-100 text-base-content">
          {items.map((item) => (
            <li key={item.to} className="text-primary text-lg">
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
