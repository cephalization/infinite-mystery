import clsx from "clsx";
import { forwardRef } from "react";
import { ArrowRightCircleIcon } from "../icons/ArrowRightCircleIcon";

type ActionInputProps = {
  disabled?: boolean;
  loading?: boolean;
  withRealismToggle?: boolean;
};

export const ActionInput = forwardRef<HTMLInputElement, ActionInputProps>(
  ({ disabled, loading }, ref) => {
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
        <div className="input-group w-full">
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
            ref={ref}
          />
          <button
            className={clsx("btn btn-square", loading && "loading")}
            disabled={disabled}
          >
            {!loading && <ArrowRightCircleIcon />}
          </button>
        </div>
      </div>
    );
  }
);

ActionInput.displayName = "ActionInput";
