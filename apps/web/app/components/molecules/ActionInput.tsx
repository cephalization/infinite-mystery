import { ArrowRightCircleIcon } from "../icons/ArrowRightCircleIcon";

type ActionInputProps = {
  disabled?: boolean;
  loading?: boolean;
};

export const ActionInput = ({ disabled, loading }: ActionInputProps) => {
  return (
    <div className="form-control w-full">
      <label className="label" htmlFor="action-input">
        <span className="label-text">What will you do?</span>
      </label>
      <div className="input-group w-full">
        <input
          type="text"
          placeholder={loading ? "Please wait..." : "I walk to..."}
          className="input input-bordered w-full"
          name="action-input"
          id="action-input"
          autoComplete="off"
        />
        <button className="btn btn-square" disabled={disabled}>
          <ArrowRightCircleIcon />
        </button>
      </div>
    </div>
  );
};
