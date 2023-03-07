import clsx from "clsx";

type VerticalEdgesProps = React.PropsWithChildren<{}>;

export const VerticalEdges = ({ children }: VerticalEdgesProps) => {
  return (
    <div
      className={clsx(
        "flex basis-full flex-col justify-between gap-8 pt-16 lg:pt-0"
      )}
    >
      {children}
    </div>
  );
};
