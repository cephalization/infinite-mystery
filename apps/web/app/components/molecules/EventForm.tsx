import { Form, Link, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { usePrevious } from "react-use";
import type { Command } from "~/components/molecules/CommandMenu";
import { findClosestCommand } from "~/components/molecules/CommandMenu";
import type { AnyEventSchema, PlayerEventSchema } from "~/events";
import { ResetButton } from "../atoms/ResetButton";
import { ArrowUpOnSquareStackIcon } from "../icons/ArrowUpOnSquareStackIcon";
import { ActionInput } from "./ActionInput";
import { EventLog } from "./EventLog";

type EventFormProps = {
  loading?: boolean;
  events?: AnyEventSchema[];
  addOptimisticEvent?: (evt: Omit<PlayerEventSchema, "id">) => void;
  className?: string;
  onSubmit?: (e: HTMLFormElement) => void;
  onReset?: () => void;
  focusRef?: React.RefObject<HTMLInputElement>;
  saveUrl?: string;
  status?: React.ReactNode;
};

const commands: Command[] = [
  {
    action() {
      console.log("test");
    },
    name: "test",
    description: "test command",
  },
  {
    action() {
      console.log("guess");
    },
    name: "guess",
    description: "guess command (stub)",
  },
  {
    action() {
      console.log("export");
    },
    name: "export",
    description: "export command (stub)",
  },
];

export const EventForm = ({
  loading,
  addOptimisticEvent,
  events = [],
  className,
  onSubmit,
  focusRef,
  onReset,
  saveUrl,
  status,
}: EventFormProps) => {
  const maybeInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const prevLoading = usePrevious(loading);
  const [inputValue, setInputValue] = useState("");
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const closestCommand = findClosestCommand(inputValue, commands);
  const matchedCommand = findClosestCommand(inputValue, commands, true);

  const inputRef = focusRef || maybeInputRef;

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (!newValue) {
      setCommandMenuOpen(false);
    }
  };

  const handleSelectCommand = (command: Command) => {
    setInputValue("");
    setCommandMenuOpen(false);
    command.action();
  };

  const submitFn = (e: HTMLFormElement) => {
    if (onSubmit) {
      return onSubmit(e);
    }

    return submit(e, {
      replace: true,
      method: "post",
      preventScrollReset: true,
    });
  };

  /**
   * Handle form submissions
   *
   * We do this in JS via native event handling so that we can mess with input
   * and scroll during submission
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (loading) return;

    const input = inputValue.trim();

    if (input === "/") {
      return;
    }

    if (commandMenuOpen && closestCommand) {
      handleSelectCommand(closestCommand);
      return;
    }

    if (matchedCommand) {
      handleSelectCommand(matchedCommand);
      return;
    }

    if (input) {
      addOptimisticEvent?.({
        type: "player",
        content: input,
        invalidAction: false,
      });
      submitFn(e.currentTarget);

      if (inputRef.current) {
        setInputValue("");
        // HACK
        // blur the input so that safari doesn't hijack scroll
        inputRef.current.blur();
      }
    }
  };

  // Focus the input when the form is done loading
  useEffect(() => {
    const shouldFocus = prevLoading === true && loading === false;
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, prevLoading]);

  useEffect(() => {
    if (inputValue.startsWith("/")) {
      setCommandMenuOpen(true);
    }

    if (!inputValue) {
      setCommandMenuOpen(false);
    }
  }, [inputValue]);

  return (
    <section className={clsx("flex flex-col gap-2", className)}>
      <div className="flex w-full gap-1 items-center flex-row-reverse">
        {!!onReset && (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              onReset();
            }}
            className="flex min-w-fit select-none"
          >
            <ResetButton disabled={loading} />
          </Form>
        )}
        {!!saveUrl && (
          <div
            className={clsx(
              "tooltip tooltip-top md:tooltip-left text-justify",
              !loading && "lg:tooltip-open"
            )}
            data-tip="Save your progress, access it on any device"
          >
            <Link
              to={saveUrl}
              className={clsx(
                "btn gap-2 select-none",
                loading && "btn-disabled"
              )}
              aria-disabled={loading}
            >
              <ArrowUpOnSquareStackIcon />
              Save
            </Link>
          </div>
        )}
        {status && status}
      </div>
      <EventLog events={events} loading={loading} />
      <Form onSubmit={handleSubmit} ref={formRef}>
        <ActionInput
          loading={loading}
          disabled={loading}
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          setCommandMenuOpen={setCommandMenuOpen}
          commandMenuOpen={commandMenuOpen}
          commands={commands}
          onSelectCommand={handleSelectCommand}
        />
      </Form>
    </section>
  );
};
