import { forwardRef } from "react";

type ScreenProps = React.PropsWithChildren<{}>;

export const Screen = forwardRef<HTMLDivElement, ScreenProps>(
  ({ children }, ref) => {
    return (
      <div
        ref={ref}
        className="flex flex-col overflow-hidden flex-grow basis-full w-full max-w-7xl p-4 pt-10"
      >
        {children}
      </div>
    );
  }
);

Screen.displayName = "Screen";
