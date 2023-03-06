import { useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export type Tabs = { hash: string; label: string }[];

export const useTabs = <T extends Tabs>(tabs: T) => {
  const [currentHash, setCurrentHash] = useState("");
  const navigate = useNavigate();
  const l = useLocation();

  // get the hash from state or the first tab
  const activeKey =
    tabs.find((tab) => tab.hash === currentHash)?.hash || tabs[0]?.hash;
  // create a map of tabs with the active tab set to true
  const activeMap = tabs.reduce(
    (acc, tab) => ({ ...acc, [tab.hash]: tab.hash === currentHash }),
    {} as Record<T[number]["hash"], boolean>
  );

  // sync the hash in state with the hash in the url
  // if the url hash is empty, set it to the active tab
  const routeHash = l.hash;
  useEffect(() => {
    if (!routeHash) {
      navigate(`#${activeKey}`);
      return;
    }

    const formattedHash = routeHash.replace("#", "");
    if (currentHash !== formattedHash) {
      setCurrentHash(formattedHash);
      return;
    }
  }, [currentHash, navigate, activeKey, routeHash]);

  return { activeMap } as const;
};
