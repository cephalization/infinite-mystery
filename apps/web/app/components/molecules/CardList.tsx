import clsx from "clsx";

type CardListProps = React.PropsWithChildren<{
  className?: string;
}>;

export const CardList = ({ children, className }: CardListProps) => {
  return (
    <div
      className={clsx(
        "w-full flex flex-wrap justify-center gap-4 gap-y-8",
        className
      )}
    >
      {children}
    </div>
  );
};
