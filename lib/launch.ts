/**
 * The launch offer: publishing is free until the end of a given day, and paid
 * from the day after.
 *
 * The date is the owner's commercial decision (31 December 2026), so it lives
 * here as the default and FREE_UNTIL overrides it — a plain YYYY-MM-DD to move
 * the date, or `off` to end the offer early. Unlike the price, a default is
 * safe here: getting it wrong gives something away for longer, it never
 * charges anyone the wrong amount.
 *
 * "The end of the day" means the end of it in Malaysia, where every customer
 * is — not in UTC, which would close the offer at eight in the morning.
 */
const DEFAULT_FREE_UNTIL = "2026-12-31";
const MALAYSIA_OFFSET_HOURS = 8;

function freeUntilDay(): string | null {
  const raw = process.env.FREE_UNTIL?.trim();
  if (raw && /^(off|none|false|0)$/i.test(raw)) return null;
  const day = raw || DEFAULT_FREE_UNTIL;
  // A value that is not a real date ends the offer rather than extending it
  // by accident: a typo must not make the product free for ever.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00Z`))) {
    return null;
  }
  return day;
}

/** The last instant publishing is free, or null when there is no offer. */
export function freeUntil(): Date | null {
  const day = freeUntilDay();
  if (!day) return null;
  const endOfDayUtc = Date.parse(`${day}T23:59:59.999Z`);
  return new Date(endOfDayUtc - MALAYSIA_OFFSET_HOURS * 3_600_000);
}

export function isFreePeriod(now: Date = new Date()): boolean {
  const until = freeUntil();
  return until !== null && now.getTime() <= until.getTime();
}

/**
 * "31 December 2026" while the offer is running, null once it is over or
 * off. One value answers both "is it free?" and "until when?", so a page
 * cannot show the date without the offer being real.
 */
export function freeUntilLabel(now: Date = new Date()): string | null {
  const day = freeUntilDay();
  if (!day || !isFreePeriod(now)) return null;
  return longDate(new Date(`${day}T00:00:00Z`));
}

/** The first paid day — "1 January 2027" — while the offer is running. */
export function paidFromLabel(now: Date = new Date()): string | null {
  const day = freeUntilDay();
  if (!day || !isFreePeriod(now)) return null;
  return longDate(new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000));
}

function longDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
