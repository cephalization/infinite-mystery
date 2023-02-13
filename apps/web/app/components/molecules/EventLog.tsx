import clsx from "clsx";
import { Stippled } from "../atoms/Stippled";

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
  return <li className="text-base-content">{event.content}</li>;
};

const DMEvent = ({ event }: { event: EventItem }) => {
  return <li>{event.content}</li>;
};

const matchEvent = (evt: EventItem) => {
  if (evt.type === "dm") return DMEvent;
  if (evt.type === "player") return PlayerEvent;
  return (_: { event: EventItem }) => null;
};

export const EventLog = ({ events = [], loading }: EventLogProps) => {
  return (
    <Stippled
      className={clsx(
        "flex overflow-y-auto flex-col-reverse",
        "h-56 max-h-56",
        "md:h-96 md:max-h-96"
      )}
    >
      <ul className={clsx("p-2 flex flex-col")}>
        {events.map((evt) => {
          const Component = matchEvent(evt);

          return <Component key={evt.id} event={evt} />;
        })}
        {loading && (
          <li>
            <progress className="progress progress-primary w-full"></progress>
          </li>
        )}
      </ul>
    </Stippled>
  );
};
