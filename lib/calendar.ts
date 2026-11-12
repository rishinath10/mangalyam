import type { InvitationJson } from "@/lib/invitation/types";

/**
 * The invitation as a calendar entry a phone can save.
 *
 * Times are written "floating" — no zone, no Z — which a calendar reads as
 * that wall-clock time wherever the phone is. It matches how the invitation
 * itself treats the date (see eventStartsAt): a 6.30pm muhurtham is 6.30pm to
 * the people going to it, and nobody typed a time zone into the builder.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** "2027-02-14" + "18:30" → "20270214T183000"; date only → "20270214". */
function stamp(date: string, time: string | null): string {
  const day = date.replaceAll("-", "");
  const m = /^(\d{1,2}):(\d{2})$/.exec((time ?? "").trim());
  return m ? `${day}T${pad(Number(m[1]))}${m[2]}00` : day;
}

function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replaceAll("-", "");
}

/** Commas, semicolons, backslashes and newlines all mean something in iCalendar. */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/([,;])/g, "\\$1")
    .replace(/\r?\n/g, "\\n");
}

/** Lines over 75 octets must be folded; a folded line continues with a space. */
function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    parts.push(rest.slice(0, 73));
    rest = ` ${rest.slice(73)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
}

/** Null when there is no date yet — an entry with no day is not an entry. */
export function invitationToIcs(invitation: InvitationJson, url: string): string | null {
  const { event, couple, ceremonyLabel } = invitation;
  if (!event.date) return null;

  const timed = Boolean(event.startTime);
  const start = stamp(event.date, event.startTime);
  // No end time: a timed event is given three hours, which is nearer the
  // truth for a ceremony than the calendar's default of one.
  let end: string;
  if (!timed) {
    end = nextDay(event.date);
  } else if (event.endTime) {
    end = stamp(event.date, event.endTime);
    // An end before the start means it runs past midnight.
    if (end <= start) end = `${nextDay(event.date)}${end.slice(8)}`;
  } else {
    const m = /^(\d{1,2}):(\d{2})$/.exec(event.startTime!.trim())!;
    const minutes = Number(m[1]) * 60 + Number(m[2]) + 180;
    end =
      minutes >= 1440
        ? `${nextDay(event.date)}T${pad(Math.floor((minutes - 1440) / 60))}${pad(minutes % 60)}00`
        : `${event.date.replaceAll("-", "")}T${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}00`;
  }

  const location = [event.venueName, event.address?.replace(/\r?\n/g, ", ")]
    .filter(Boolean)
    .join(", ");
  const kind = timed ? "" : ";VALUE=DATE";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mangalyam.my//Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${invitation.invitationId}@mangalyam.my`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART${kind}:${start}`,
    `DTEND${kind}:${end}`,
    `SUMMARY:${escapeText(`${ceremonyLabel} — ${couple.hostNames}`)}`,
    location && `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(`Invitation: ${url}`)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];

  return lines.map(fold).join("\r\n") + "\r\n";
}
