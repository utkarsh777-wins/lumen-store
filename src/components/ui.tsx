import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { formatMoney } from "@/lib/money";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-5 md:px-8", className)}>{children}</div>;
}

const buttonStyles = {
  primary: "bg-ink text-bg hover:bg-accent",
  secondary: "border border-ink bg-transparent hover:bg-ink hover:text-bg",
  ghost: "underline decoration-line underline-offset-4 hover:decoration-ink",
  danger: "border border-danger text-danger hover:bg-danger hover:text-bg",
};

export function Button({
  variant = "primary",
  href,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonStyles;
  href?: string;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 px-5 py-3 text-sm tracking-wide transition disabled:cursor-not-allowed disabled:opacity-45",
    buttonStyles[variant],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function Price({
  cents,
  compare,
  from,
  className,
}: {
  cents: number;
  compare?: number | null;
  from?: boolean;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-2 tabular-nums", className)}>
      <span>
        {from ? "From " : ""}
        {formatMoney(cents)}
      </span>
      {compare && compare > cents ? (
        <s className="text-sm text-muted">{formatMoney(compare)}</s>
      ) : null}
    </p>
  );
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  const full = Math.round(rating);
  return (
    <p className="flex items-center gap-2 text-sm">
      <span aria-label={`${rating.toFixed(1)} out of 5 stars`} className="tracking-tight text-accent">
        {"★★★★★".slice(0, full)}
        <span className="text-line">{"★★★★★".slice(full)}</span>
      </span>
      {typeof count === "number" ? <span className="text-muted">{count}</span> : null}
    </p>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <h2 className="font-serif text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
      {action ? (
        <div className="mt-6">
          <Button href={action.href}>{action.label}</Button>
        </div>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm" htmlFor={name}>
      <span className="mb-1.5 block">{label}</span>
      {children}
      {error ? (
        <span id={`${name}-error`} className="mt-1 block text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full border border-line bg-elev px-3 py-3 text-sm text-ink outline-none placeholder:text-muted";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "sale" | "warn" | "ok" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-[11px] uppercase tracking-[0.14em]",
        tone === "neutral" && "bg-highlight text-ink",
        tone === "sale" && "bg-accent text-bg",
        tone === "warn" && "bg-sand text-ink",
        tone === "ok" && "bg-pine text-bg",
      )}
    >
      {children}
    </span>
  );
}
