/**
 * Guest-facing formatting. Malaysian audience, English-only in V1 (Tamil is
 * V2), so the locale is fixed rather than read from the browser — a guest with
 * a US phone locale should still see the same invitation as everyone else.
 */
const LOCALE = "en-MY";

/** `date` is a plain yyyy-mm-dd with no timezone; parse it as local, not UTC. */
function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatEventDate(iso: string | null): string {
  if (!iso) return "";
  const d = parseIsoDate(iso);
  if (!d) return "";
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatShortDate(iso: string | null): string {
  if (!iso) return "";
  const d = parseIsoDate(iso);
  if (!d) return "";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** "14:30" -> "2.30 PM" (Malaysian convention uses a dot separator). */
export function formatTime(hhmm: string | null): string {
  if (!hhmm) return "";
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return hhmm;
  const hours = Number(m[1]);
  const minutes = m[2];
  if (hours > 23 || Number(minutes) > 59) return hhmm;
  const suffix = hours < 12 ? "AM" : "PM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}.${minutes} ${suffix}`;
}

export function formatTimeRange(start: string | null, end: string | null): string {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s} – ${e}`;
  return s || e;
}

/**
 * Splits "Rishi & Gaayathri" into its two names so a wedding template can
 * style the ampersand between them; "The Kumar Family" or a single name has
 * no " & " to find and comes back as one part. Templates for occasions that
 * are never a pair (a housewarming, a birthday) should just render the whole
 * string and never call this.
 */
export function splitHostNames(hostNames: string): [string, string | null] {
  const m = /^(.+?)\s*&\s*(.+)$/.exec(hostNames.trim());
  return m ? [m[1], m[2]] : [hostNames, null];
}

/** Combines the plain date and time into a real instant for the countdown. */
export function eventStartsAt(iso: string | null, hhmm: string | null): Date | null {
  if (!iso) return null;
  const d = parseIsoDate(iso);
  if (!d) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm ?? "").trim());
  if (m) d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d;
}
