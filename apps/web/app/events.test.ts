import { expect, test } from "vitest";
import {
  dmEventSchema,
  evaluatorEventSchema,
  filterEventsByType,
  playerEventSchema,
  processableSchema,
} from "./events";
import type {
  EventSchema,
  DMEventSchema,
  EvaluatorEventSchema,
  PlayerEventSchema,
} from "./events";

const testEvents: (
  | EventSchema
  | DMEventSchema
  | PlayerEventSchema
  | EvaluatorEventSchema
)[] = [
  { id: 0, type: "player", content: "hi" },
  { id: 1, type: "player", content: "bye", invalidAction: true },
  { id: 2, type: "dm", content: "hi" },
  { id: 3, type: "summary", content: "hi (summary)" },
  { id: 4, type: "evaluator", content: "hi" },
  { id: 5, type: "evaluator", content: "hi" },
];

test("filterEventsByType", () => {
  const playerEvents = filterEventsByType(testEvents, playerEventSchema);

  expect(playerEvents.length).toBe(2);
  expect(playerEvents[0].invalidAction).toBe(false);

  const dmEvents = filterEventsByType(testEvents, dmEventSchema);

  expect(dmEvents.length).toBe(1);

  const evaluatorEvents = filterEventsByType(testEvents, evaluatorEventSchema);

  expect(evaluatorEvents.length).toBe(2);

  const processableEvents = filterEventsByType(testEvents, processableSchema);
  expect(processableEvents.length).toBe(1);
});
