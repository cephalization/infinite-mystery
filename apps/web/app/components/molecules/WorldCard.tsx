import { Link } from "@remix-run/react";
import clsx from "clsx";
import Balancer from "react-wrap-balancer";

const DEFAULT_WORLD_IMG = "/images/undefined-city-1.jpeg";

type WorldCardProps = {
  name: string;
  description?: string;
  imageSrc?: string;
  id: string | number;
};

export const WorldCard = ({
  id,
  name,
  description,
  imageSrc = DEFAULT_WORLD_IMG,
}: WorldCardProps) => {
  return (
    <div className="card card-compact max-h-96 w-full sm:w-64 bg-primary text-primary-content shadow-2xl">
      <figure className="flex basis-full sm:pt-6">
        <img
          src={imageSrc}
          alt="World to Enter"
          className={clsx(
            "rounded-xl rounded-bl-none rounded-br-none",
            "sm:rounded-bl-xl sm:rounded-br-xl",
            "h-40 w-40 pt-4 sm:pt-0 sm:h-56 sm:w-56"
          )}
        />
      </figure>
      <div className="card-body flex-shrink">
        <h2 className="card-title">
          <Balancer>{name}</Balancer>
        </h2>
        {description && (
          <p className="block truncate w-full" title={description}>
            {description}
          </p>
        )}
        <div className="card-actions justify-end">
          <Link to={`/explore/${id}`} className="btn w-full sm:w-auto">
            Enter
          </Link>
        </div>
      </div>
    </div>
  );
};
