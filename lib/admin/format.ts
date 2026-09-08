/**
 * Sen are the only money the database holds, so every display goes through
 * here. Dividing by 100 at each call site is how a rounding bug gets in.
 */
export function ringgit(sen: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(sen / 100);
}

export function shortDate(d: Date | string): string {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

/** Enum values reach the screen as words: `sixtieth_birthday` reads badly. */
export function humanise(value: string): string {
  return value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
