import type { AnyEventSchema } from "~/events";

export const events: AnyEventSchema[] = (
  [
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
    {
      type: "dm",
      content: `
          You entered Good Times bar. You see a waiter wiping the counter top
          and 3 patrons in various booths.
        `,
    },
    { type: "player", content: `I go sit at the counter` },
    {
      type: "dm",
      content: `The waiter turns to you and asks, "What are ya' having?"`,
    },
    { type: "player", content: `I say "a coffee, please"` },
  ] as const
).map((evt, i) => ({ ...evt, id: i }));
