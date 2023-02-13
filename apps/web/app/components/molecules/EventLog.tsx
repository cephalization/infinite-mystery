import clsx from "clsx";
import { useLayoutEffect, useRef } from "react";
import { scrollIntoView } from "seamless-scroll-polyfill";

import { Stippled } from "../atoms/Stippled";
import { ThreeDots } from "../icons/ThreeDots";

export type EventItem = {
  type: "dm" | "player";
  content: string;
  id: number | string;
};

type EventLogProps = {
  events?: EventItem[];
  loading?: boolean;
};

const PlayerEvent = ({ event }: { event: EventItem }) => {
  return <li className="text-base-content py-1">{event.content}</li>;
};

const DMEvent = ({ event }: { event: EventItem }) => {
  return <li className="preview_text border-l-4 pl-2">{event.content}</li>;
};

const matchEvent = (evt: EventItem) => {
  if (evt.type === "dm") return DMEvent;
  if (evt.type === "player") return PlayerEvent;
  return (_: { event: EventItem }) => null;
};

export const EventLog = ({ events = [], loading }: EventLogProps) => {
  const scrollRef = useRef<HTMLLIElement>(null);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      // whenever new events are pushed, scroll to the bottom
      scrollIntoView(scrollRef.current, { block: "end" });
    }
  }, [events]);

  return (
    <Stippled
      className={clsx(
        "flex overflow-y-auto flex-col-reverse",
        "h-64 max-h-64",
        "md:h-96 md:max-h-96",
        "scroll-smooth"
      )}
    >
      <ul className={clsx("p-2 flex flex-col gap-2")}>
        {events.map((evt) => {
          const Component = matchEvent(evt);

          return <Component key={`${evt.id}-${evt.type}`} event={evt} />;
        })}
        {/* uncomment these to test alignment */}
        {/* <DMEvent event={{ content: "You see a store nearby" }} /> */}
        {/* <PlayerEvent event={{ content: "I go to the store" }} /> */}
        {loading && (
          <li className="text-primary">
            <ThreeDots />
          </li>
        )}
        <li ref={scrollRef}></li>
      </ul>
    </Stippled>
  );
};
