import clsx from "clsx";
import type { DetailedHTMLProps, LabelHTMLAttributes } from "react";

type ResetButtonProps = DetailedHTMLProps<
  LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
> & {
  name?: string;
  label?: string;
  disabled?: boolean;
};

export const ResetButton = ({
  label = "Reset",
  id = "reset-button",
  name = "reset-button",
  className,
  ...props
}: ResetButtonProps) => {
  return (
    <>
      <label
        className={clsx("btn btn-sm gap-2 max-w-fit", className)}
        htmlFor={id}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
          />
        </svg>

        {label}
      </label>
      <input type="checkbox" id={id} name={name} className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Reset?</h3>
          <p className="py-4">Are you sure you want to Reset?</p>
          <div className="modal-action">
            <label htmlFor={id} className="btn btn-sm">
              Nevermind
            </label>
            <button className="btn btn-sm btn-warning">Reset</button>
          </div>
        </div>
      </div>
    </>
  );
};
