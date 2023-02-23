import { useCallback, useEffect, useState } from "react";
import type { AnyEventSchema, PlayerEventSchema } from "~/events";

/**
 * Given an array of initial events, and an array of events from the db, generate local state that
 * can be augemented with optimistic events until new events are received from the db
 *
 * @param initialEvents - initial array of events, like from a loader
 * @param persistedEvents - new array of events, like from actionData after a form submission
 */
export const usePersistedEvents = (
  initialEvents: AnyEventSchema[],
  persistedEvents: AnyEventSchema[]
) => {
  const [events, setEvents] = useState(initialEvents);

  // Load new events into local state when received via an action
  useEffect(() => {
    if (persistedEvents.length) {
      setEvents(persistedEvents);
    }
  }, [persistedEvents]);

  /**
   * Given a partial player event, add it to local state
   * This event will be blown away the next time we receive events from the db
   *
   * @param newEvt
   */
  const handleOptimisticEvent = useCallback(
    (newEvt: Omit<PlayerEventSchema, "id">) => {
      setEvents((evts) => [...evts, { ...newEvt, id: -1 }]);
    },
    []
  );

  return {
    events,
    setEvents,
    handleOptimisticEvent,
  };
};
