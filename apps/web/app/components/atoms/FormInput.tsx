import clsx from "clsx";

export type FormInputProps = React.PropsWithChildren<{
  label: string;
  id: string;
  description?: string;
  className?: string;
  maxSize?: "xs" | "md" | "lg" | "xl";
}>;

export const FormInput = ({
  label,
  id,
  description,
  maxSize = "xs",
  children,
}: FormInputProps) => {
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    <div className={clsx("form-control w-full", `max-w-${maxSize}`)}>
      <label className="label" htmlFor={id}>
        <span className="label-text">{label}</span>
      </label>
      {children}
      {description && (
        <label className="label" id={descriptionId}>
          <span className="label-text-alt opacity-75">{description}</span>
        </label>
      )}
    </div>
  );
};

export type FormTextProps = Partial<React.HTMLProps<HTMLInputElement>> &
  FormInputProps;

export const FormText = ({
  label,
  name,
  id,
  description,
  className,
  maxSize,
  ...inputProps
}: FormTextProps) => (
  <FormInput label={label} id={id} description={description} maxSize={maxSize}>
    <input
      type="text"
      className={clsx("input input-bordered w-full", className)}
      name={name}
      id={id}
      autoComplete="off"
      {...inputProps}
    />
  </FormInput>
);

export type FormTextAreaProps = Partial<React.HTMLProps<HTMLTextAreaElement>> &
  FormInputProps;

export const FormTextArea = ({
  label,
  name,
  id,
  description,
  className,
  maxSize,
  ...textareaProps
}: FormTextAreaProps) => (
  <FormInput label={label} id={id} description={description} maxSize={maxSize}>
    <textarea
      className={clsx("textarea textarea-bordered w-full", className)}
      name={name}
      autoComplete="off"
      id={id}
      rows={5}
      {...textareaProps}
    />
  </FormInput>
);
