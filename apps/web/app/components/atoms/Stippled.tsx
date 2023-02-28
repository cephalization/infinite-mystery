import clsx from "clsx";
import { forwardRef } from "react";

type StippledProps = React.PropsWithChildren<{
  className?: string;
}>;

export const Stippled = forwardRef<HTMLDivElement, StippledProps>(
  ({ children, className }: StippledProps, ref) => {
    return (
      <div
        className={clsx(
          "flex flex-col bg-base-200 rounded-lg bg-top preview",
          className
        )}
        style={{ backgroundSize: "5px 5px" }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

Stippled.displayName = "Stippled";
