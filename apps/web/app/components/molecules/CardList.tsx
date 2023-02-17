import clsx from "clsx";

type CardListProps = React.PropsWithChildren<{
  className?: string;
}>;

export const CardList = ({ children, className }: CardListProps) => {
  return (
    <div
      className={clsx(
        "w-full flex flex-wrap gap-8 shadow-inner shadow-base",
        className
      )}
    >
      {children}
    </div>
  );
};
