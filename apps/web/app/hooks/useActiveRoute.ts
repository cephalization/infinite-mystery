import { useMatches } from "react-router";

export const useActiveRoute = () => {
  const matches = useMatches();

  return matches[matches.length - 1];
};
