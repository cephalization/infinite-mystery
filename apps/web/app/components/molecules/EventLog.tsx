import clsx from "clsx";
import { useEffect, useRef } from "react";
import { scrollIntoView } from "seamless-scroll-polyfill";
import type {
  AnyEventSchema,
  DMEventSchema,
  EvaluatorEventSchema,
  PlayerEventSchema,
} from "~/events";
import {
  dmEventSchema,
  evaluatorEventSchema,
  playerEventSchema,
} from "~/events";

import { Stippled } from "../atoms/Stippled";
import { ThreeDots } from "../icons/ThreeDots";

type EventLogProps = {
  events?: AnyEventSchema[];
  loading?: boolean;
};

const PlayerEvent = ({ event }: { event: PlayerEventSchema }) => {
  return (
    <li
      className={clsx(
        "text-base-content py-1",
        event.invalidAction && "text-error"
      )}
    >
      {event.content}
    </li>
  );
};

const DMEvent = ({ event }: { event: DMEventSchema }) => {
  return <li className="preview_text border-l-4 pl-2">{event.content}</li>;
};

const EvaluatorEvent = ({ event }: { event: EvaluatorEventSchema }) => {
  return (
    <li className="text-error border-l-4 pl-2 border-error">{event.content}</li>
  );
};

const matchEvent = <E extends AnyEventSchema>(evt: E) => {
  const maybeDMEvent = dmEventSchema.safeParse(evt);
  if (maybeDMEvent.success) {
    const _DMEvent = () => <DMEvent event={maybeDMEvent.data} />;

    return _DMEvent;
  }

  const maybePlayerEvent = playerEventSchema.safeParse(evt);
  if (maybePlayerEvent.success) {
    const _PlayerEvent = () => <PlayerEvent event={maybePlayerEvent.data} />;

    return _PlayerEvent;
  }

  const maybeEvaluatorEvent = evaluatorEventSchema.safeParse(evt);
  if (maybeEvaluatorEvent.success) {
    const _EvaluatorEvent = () => (
      <EvaluatorEvent event={maybeEvaluatorEvent.data} />
    );

    return _EvaluatorEvent;
  }

  return () => null;
};

export const EventLog = ({ events = [], loading }: EventLogProps) => {
  const scrollRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // whenever new events are pushed, scroll to the bottom
      scrollIntoView(scrollRef.current, { block: "end", behavior: "smooth" });
    }
  }, [events]);

  return (
    <Stippled
      className={clsx(
        "flex overflow-y-auto flex-col-reverse",
        "basis-72 max-h-72",
        "md:h-96 md:max-h-96",
        "scroll-smooth"
      )}
    >
      <ul className={clsx("p-2 flex flex-col gap-2")} ref={scrollRef}>
        {events.map((evt) => {
          const Component = matchEvent(evt);

          return <Component key={`${evt.id}-${evt.type}`} />;
        })}
        {loading && (
          <li className="text-primary">
            <ThreeDots />
          </li>
        )}
      </ul>
    </Stippled>
  );
};
