import clsx from "clsx";

type ScrollerProps = React.PropsWithChildren<{
  className?: string;
}>;

export const Scroller = ({ children, className }: ScrollerProps) => {
  return (
    <div
      className={clsx(
        "flex flex-col basis-full max-h-full overflow-y-auto",
        className
      )}
    >
      {children}
    </div>
  );
};
