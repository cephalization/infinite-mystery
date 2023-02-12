import { ArrowRightCircleIcon } from "../icons/ArrowRightCircleIcon";

export const ActionInput = () => {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="action-input">
        <span className="label-text">What will you do?</span>
      </label>
      <div className="input-group w-full">
        <input
          type="text"
          placeholder="I walk over there…"
          className="input input-bordered w-full"
          name="action-input"
          id="action-input"
          autoComplete="off"
        />
        <button className="btn btn-square">
          <ArrowRightCircleIcon />
        </button>
      </div>
    </div>
  );
};
