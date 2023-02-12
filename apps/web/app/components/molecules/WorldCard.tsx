import { Link } from "@remix-run/react";

const DEFAULT_WORLD_IMG = "/images/undefined-city.jpeg";

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
    <div className="card w-80 sm:w-96 bg-base-300 shadow-xl">
      <figure className="px-10 pt-10">
        <img src={imageSrc} alt="World to Enter" className="rounded-xl" />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{name}</h2>
        {description && <p>{description}</p>}
        <div className="card-actions">
          <Link to={`/explore/${id}`} className="btn btn-primary">
            Enter
          </Link>
        </div>
      </div>
    </div>
  );
};
