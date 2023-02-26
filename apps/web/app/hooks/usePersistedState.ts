import { useEffect } from "react";
import { useLocalStorage } from "react-use";

export const usePersistedState = <T>(key: string, state: T) => {
  const [localState, setLocalState, removeLocalState] = useLocalStorage(
    key,
    state
  );

  // persist new state when it changes
  useEffect(() => {
    setLocalState(state);
  }, [state, setLocalState]);

  return [localState, setLocalState, removeLocalState];
};
