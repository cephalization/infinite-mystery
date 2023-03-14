import React from "react";
import clsx from "clsx";
import { ChevronUpIcon } from "~/components/icons/ChevronUpIcon";

type DropdownProps = React.PropsWithChildren<{
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  separator?: boolean;
}>;

export const Dropdown = ({
  children,
  className,
  buttonClassName,
  menuClassName,
  separator,
}: DropdownProps) => {
  return (
    <div className={clsx("dropdown dropdown-top dropdown-end", className)}>
      <label
        tabIndex={0}
        className={clsx(
          "btn btn-square relative flex flex-nowrap justify-center",
          buttonClassName
        )}
      >
        {separator && (
          <div className="w-[1px] h-1/2 absolute left-0 border-l border-white"></div>
        )}
        <ChevronUpIcon />
      </label>
      <ul
        tabIndex={0}
        className={clsx(
          "dropdown-content menu p-2 shadow-lg bg-base-300 rounded-box w-52",
          menuClassName
        )}
      >
        {children}
      </ul>
    </div>
  );
};
