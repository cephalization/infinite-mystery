import { Form, useSubmit } from "@remix-run/react";
import React, { useEffect, useRef } from "react";
import { z } from "zod";
import type { AnyEventSchema, PlayerEventSchema } from "~/events";
import { ActionInput } from "./ActionInput";
import { EventLog } from "./EventLog";

type EventFormProps = {
  loading?: boolean;
  events?: AnyEventSchema[];
  addOptimisticEvent?: (evt: Omit<PlayerEventSchema, "id">) => void;
  className?: string;
  intializeEvents?: boolean;
};

export const EventForm = ({
  loading,
  addOptimisticEvent,
  events = [],
  className,
  intializeEvents,
}: EventFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  // Submit an empty player action if there are no events yet
  // useEffect(() => {
  //   if (!events.length && intializeEvents) {
  //     submit(formRef.current, {
  //       replace: true,
  //       method: "post",
  //       preventScrollReset: true,
  //     });
  //   }
  // }, [submit, events, intializeEvents]);

  /**
   * Handle form submissions
   *
   * We do this in JS via native event handling so that we can mess with input
   * and scroll during submission
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (loading) return;

    const form = new FormData(e.currentTarget);
    const input = z.coerce.string().parse(form.get("action-input"));

    if (input) {
      addOptimisticEvent?.({
        type: "player",
        content: input,
        invalidAction: false,
      });
      submit(e.currentTarget, {
        replace: true,
        method: "post",
        preventScrollReset: true,
      });

      if (inputRef.current) {
        inputRef.current.value = "";
        // HACK
        // blur the input so that safari doesn't hijack scroll
        inputRef.current.blur();
        inputRef.current.focus();
      }
    }
  };

  return (
    <section className={className}>
      <EventLog events={events} loading={loading} />
      <Form onSubmit={handleSubmit} ref={formRef}>
        <ActionInput loading={loading} disabled={loading} ref={inputRef} />
      </Form>
    </section>
  );
};
