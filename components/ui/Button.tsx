import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "gold" | "line" | "quiet" | "danger";

const cls = (variant: Variant, size?: "sm", extra?: string) =>
  ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : "", extra ?? ""]
    .filter(Boolean)
    .join(" ");

export function Button({
  variant = "gold",
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" }) {
  return <button {...props} className={cls(variant, size, className)} />;
}

export function ButtonLink({
  variant = "gold",
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: "sm" }) {
  return <Link {...props} className={cls(variant, size, className)} />;
}
