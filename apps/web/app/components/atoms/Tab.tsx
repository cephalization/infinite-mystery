import { Link } from "@remix-run/react";
import clsx from "clsx";
import React from "react";

export type TabProps = React.PropsWithChildren<{
  name: string;
  active?: boolean;
}>;

export const Tab = ({ name, children, active }: TabProps) => {
  return (
    <Link
      to={`#${name}`}
      className={clsx("tab tab-bordered", active && "tab-active")}
    >
      {children}
    </Link>
  );
};
