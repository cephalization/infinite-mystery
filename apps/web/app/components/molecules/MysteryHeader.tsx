import clsx from "clsx";

type MysteryHeaderProps = {
  title: string;
  brief: string;
  worldName: string;
  worldDescription: string;
};

const hiddenStyles = "hidden sm:block";

export const MysteryHeader = ({
  title,
  brief,
  worldName,
  worldDescription,
}: MysteryHeaderProps) => {
  return (
    <section>
      <h1 className="text-3xl">
        Mystery <b className="text-primary">{title}</b>
      </h1>
      <h3 className={clsx(hiddenStyles, "text-neutral-content")}>{brief}</h3>
      <br />
      <h1 className={clsx(hiddenStyles, "text-xl")}>
        Location: <b className="text-primary">{worldName}</b>
      </h1>
      <h3 className={clsx(hiddenStyles, "text-sm text-neutral-content")}>
        {worldDescription}
      </h3>
    </section>
  );
};
