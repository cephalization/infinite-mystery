import { describe, expect, it } from "vitest";
import { makeAgentMessages } from "./chat";

describe("makeAgentMessages", () => {
  it("should throw an error when the max length of tokens is exceeded", () => {
    // test that it throws an error if the max length of tokens is exceeded
    try {
      makeAgentMessages(
        { content: "intro", role: "system" },
        [
          {
            role: "user",
            content: "hello",
          },
          {
            role: "assistant",
            content: "hello",
          },
        ],
        [
          {
            role: "user",
            content: "hello",
          },
          {
            role: "assistant",
            content: "hello",
          },
        ],
        [],
        2,
        1
      );
      expect(false).toBe(true);
    } catch (e) {
      expect(e instanceof Error).toBe(true);
      const err = e as Error;
      expect(err.message).toBe(
        "Could not shorten messages enough to fit within max tokens"
      );
    }
  });

  it("should return a list of messages that does not go over the max length of tokens", () => {
    const messages = makeAgentMessages(
      { content: "intro", role: "system" },
      [
        {
          role: "user",
          content: "hello sample",
        },
        {
          role: "assistant",
          content: "hello sample",
        },
      ],
      [
        {
          role: "user",
          content: "hello timeline",
        },
        {
          role: "assistant",
          content: "hello timeline",
        },
      ],
      [
        {
          role: "user",
          content: "I say hello",
        },
      ],
      1000,
      1
    );
    expect(messages.length).toBe(6);
  });

  it("should shorten the list of messages that goes over the max length of tokens", () => {
    const messages = makeAgentMessages(
      { content: "intro", role: "system" },
      [
        {
          role: "user",
          content: "hello sample",
        },
        {
          role: "assistant",
          content: "hello sample",
        },
      ],
      [
        {
          role: "user",
          content: "hello timeline",
        },
        {
          role: "assistant",
          content: "hello timeline",
        },
      ],
      [],
      13, // I just kept reducing token length until there was one less message
      0
    );
    expect(messages.length).toBe(4);
  });

  it("should shorten the list of messages that goes over the max length of tokens with response length considered", () => {
    const messages = makeAgentMessages(
      { content: "intro", role: "system" },
      [
        {
          role: "user",
          content: "hello sample",
        },
        {
          role: "assistant",
          content: "hello sample",
        },
      ],
      [
        {
          role: "user",
          content: "hello timeline",
        },
        {
          role: "assistant",
          content: "hello timeline",
        },
      ],
      [],
      13, // I just kept reducing token length until there was one less message
      3
    );
    expect(messages.length).toBe(3);
  });

  it("should shorten the list of messages that goes over the max length of tokens but preserve system messages", () => {
    const messages = makeAgentMessages(
      { content: "intro", role: "user" },
      [
        {
          role: "user",
          content: "hello sample",
        },
        {
          role: "assistant",
          content: "hello sample",
        },
      ],
      [
        {
          role: "system",
          content: "hello timeline",
        },
        {
          role: "assistant",
          content: "hello timeline response",
        },
      ],
      [],
      11,
      0
    );
    expect(messages.length).toBe(4);
    expect(messages.filter((m) => m.role === "system").length).toBe(1);
  });
});
