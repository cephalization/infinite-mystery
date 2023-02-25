import { Form, useFetcher, useNavigate, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import React, { useRef } from "react";
import { z } from "zod";
import type { AnyEventSchema, PlayerEventSchema } from "~/events";
import { ResetButton } from "../atoms/ResetButton";
import { ActionInput } from "./ActionInput";
import { EventLog } from "./EventLog";

type EventFormProps = {
  loading?: boolean;
  events?: AnyEventSchema[];
  addOptimisticEvent?: (evt: Omit<PlayerEventSchema, "id">) => void;
  className?: string;
  onSubmit?: (e: HTMLFormElement) => void;
  resetUrl?: string;
};

export const EventForm = ({
  loading,
  addOptimisticEvent,
  events = [],
  className,
  onSubmit,
  resetUrl,
}: EventFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

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

    const form = new FormData(e.currentTarget);
    const input = z.coerce.string().parse(form.get("action-input"));

    if (input) {
      addOptimisticEvent?.({
        type: "player",
        content: input,
        invalidAction: false,
      });
      submitFn(e.currentTarget);

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
    <section className={clsx("flex flex-col gap-2", className)}>
      {!!resetUrl && (
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch(resetUrl, { method: "post" });
            location.reload();
          }}
          className="w-full flex justify-end flex-shrink"
        >
          <ResetButton disabled={loading} />
        </Form>
      )}
      <EventLog events={events} loading={loading} />
      <Form onSubmit={handleSubmit} ref={formRef}>
        <ActionInput loading={loading} disabled={loading} ref={inputRef} />
      </Form>
    </section>
  );
};
