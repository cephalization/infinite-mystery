import clsx from "clsx";

type ActiveCommandProps = {
  name: string;
  description?: string;
};

export const ActiveCommand = ({ name, description }: ActiveCommandProps) => {
  return (
    <label
      className={clsx(
        "flex max-w-full h-full bg-base-300 justify-start gap-2 items-center",
        "rounded-tl-lg rounded-tr-lg border-t border-l border-r border-black",
        "px-4 py-2 text-ellipsis overflow-hidden"
      )}
    >
      <span className="font-bold text-sm flex h-full items-center">{name}</span>
      {description && (
        <span className="text-xs h-full items-center flex overflow-hidden">
          <p
            title={description}
            className="block whitespace-nowrap text-ellipsis overflow-hidden"
          >
            {description}
          </p>
        </span>
      )}
    </label>
  );
};
