import clsx from "clsx";

type StippledProps = React.PropsWithChildren<{
  className?: string;
}>;

export const Stippled = ({ children, className }: StippledProps) => {
  return (
    <div
      className={clsx(
        "flex flex-col basis-full bg-base-200 rounded-lg bg-top preview",
        className
      )}
      style={{ backgroundSize: "5px 5px" }}
    >
      {children}
    </div>
  );
};
