import React from "react";

export type TabsProps = React.PropsWithChildren<{}>;

export const Tabs = ({ children }: TabsProps) => {
  return <div className="tabs">{children}</div>;
};
