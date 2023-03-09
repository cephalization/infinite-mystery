import clsx from "clsx";
import { forwardRef } from "react";
import { EllipsisHorizontalIcon } from "~/components/icons/EllipsisHorizontalIcon";
import type { Command } from "~/components/molecules/CommandMenu";
import { CommandMenu } from "~/components/molecules/CommandMenu";
import { ArrowRightCircleIcon } from "../icons/ArrowRightCircleIcon";

type ActionInputProps = {
  disabled?: boolean;
  loading?: boolean;
  withRealismToggle?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  commands?: Command[];
  commandMenuOpen?: boolean;
  setCommandMenuOpen?: (open: boolean) => void;
  onSelectCommand?: (command: Command) => void;
};

export const ActionInput = forwardRef<HTMLInputElement, ActionInputProps>(
  (
    {
      disabled,
      loading,
      value,
      onChange,
      commandMenuOpen,
      setCommandMenuOpen,
      commands,
      onSelectCommand,
    },
    ref
  ) => {
    return (
      <div className="form-control w-full">
        <div className="flex justify-between">
          <label className="label" htmlFor="action-input">
            <span className="label-text">What will you do?</span>
          </label>
          <label className="label cursor-pointer flex gap-1">
            <span className="label-text">Realism Mode</span>
            <input
              type="checkbox"
              name="realism-mode"
              id="realism-mode"
              defaultChecked
              className="checkbox"
            />
          </label>
        </div>
        <div className="input-group w-full bg-neutral-focus rounded-md">
          {commands && (
            <CommandMenu
              open={commandMenuOpen}
              value={value}
              commands={commands}
              onSelect={onSelectCommand}
              setCommandMenuOpen={setCommandMenuOpen}
            >
              <button
                className="btn btn-square rounded-tr-none rounded-br-none"
                type="button"
                onClick={() => setCommandMenuOpen?.(!commandMenuOpen)}
                tabIndex={0}
              >
                <EllipsisHorizontalIcon />
              </button>
            </CommandMenu>
          )}
          <input
            type="text"
            placeholder="I walk to..."
            className={clsx(
              "input w-full",
              loading ? "input-disabled" : "input-bordered preview_text"
            )}
            name="action-input"
            id="action-input"
            autoComplete="off"
            value={value}
            ref={ref}
            onChange={(e) => onChange?.(e)}
          />
          <button
            className={clsx(
              "btn btn-square rounded-tr-none rounded-br-none",
              loading && "loading"
            )}
            disabled={disabled}
            onClick={(e) => e.stopPropagation()}
            name="action-submit"
          >
            {!loading && <ArrowRightCircleIcon />}
          </button>
        </div>
      </div>
    );
  }
);

ActionInput.displayName = "ActionInput";
