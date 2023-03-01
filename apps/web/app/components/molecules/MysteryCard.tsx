import { Link } from "@remix-run/react";
import clsx from "clsx";
import Balancer from "react-wrap-balancer";

const DEFAULT_WORLD_IMG = "/images/undefined-mystery-1.jpeg";

type MysteryCardProps = {
  title: string;
  crime?: string;
  imageSrc?: string;
  location?: string;
  id: string | number;
};

export const MysteryCard = ({
  id,
  title,
  location,
  imageSrc = DEFAULT_WORLD_IMG,
}: MysteryCardProps) => {
  return (
    <div className="card card-compact w-full sm:w-64 bg-neutral text-neutral-content shadow-2xl">
      <figure className="sm:pt-6">
        <img
          src={imageSrc}
          alt="Mystery to Enter"
          className={clsx(
            "rounded-xl rounded-bl-none rounded-br-none",
            "sm:rounded-bl-xl sm:rounded-br-xl",
            "h-48 w-48 pt-4 sm:pt-0 sm:h-56 sm:w-56"
          )}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">
          <Balancer>{title}</Balancer>
        </h2>
        {location && <p>Location: {location}</p>}
        <div className="card-actions justify-end">
          <Link
            to={`/mystery/${id}`}
            className="btn btn-neutral w-full sm:w-auto"
          >
            Enter
          </Link>
        </div>
      </div>
    </div>
  );
};
