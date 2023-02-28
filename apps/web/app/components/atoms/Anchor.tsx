import type { LinkProps } from "@remix-run/react";
import { Link } from "@remix-run/react";
import clsx from "clsx";

type AnchorProps = LinkProps;

export const Anchor = ({ className, children, ...props }: AnchorProps) => {
  return (
    <Link className={clsx("link", className)} {...props}>
      {children}
    </Link>
  );
};
