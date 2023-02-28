import clsx from "clsx";
import React from "react";
import { ErrorIcon } from "../icons/ErrorIcon";
import { InfoIcon } from "../icons/InfoIcon";
import { SuccessIcon } from "../icons/SuccessIcon";
import { WarningIcon } from "../icons/WarningIcon";

type BannerType = "info" | "warning" | "success" | "error";

type BannerProps = React.PropsWithChildren<{
  className?: string;
  type?: BannerType;
  iconType?: BannerType;
}>;

const IconsByType: Record<BannerType, React.ElementType> = {
  info: InfoIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  success: SuccessIcon,
} as const;

export const Banner = ({
  type,
  className,
  children,
  iconType,
}: BannerProps) => {
  const Icon = type
    ? IconsByType[type]
    : iconType
    ? IconsByType[iconType]
    : null;
  return (
    <div
      className={clsx(
        "alert p-3 rounded flex-row basis-full grow",
        type && `alert-${type}`,
        className
      )}
    >
      <div>
        {Icon && <Icon className={clsx(iconType && `stroke-${iconType}`)} />}
        <span>{children}</span>
      </div>
    </div>
  );
};
