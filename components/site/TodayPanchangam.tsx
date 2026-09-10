"use client";

import type { SVGProps } from "react";
import { useEffect, useState } from "react";
import { clock, nakshatraSpans, panchangamFor, type DayPanchangam } from "@/lib/panchangam";

/**
 * Three glyphs on the same 38px grid as the ceremony and occasion icons, and
 * each is the thing it labels rather than a generic stand-in.
 *
 * A sunrise, because the whole reckoning starts there — the star is named for
 * whatever prevails at dawn and the windows are cut from sunrise to sunset. A
 * moon among stars, because a natchathiram is literally where the Moon is
 * sitting. And a clock with one arc of its rim weighted, because Rahu Kalam is
 * a stretch of the day rather than a moment on it.
 */
function Sunrise(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 28h28" />
      <path d="M11 28a8 8 0 0 1 16 0" />
      <path d="M19 6v3.6" />
      <path d="m9.4 10.4 2.5 2.5" />
      <path d="m28.6 10.4-2.5 2.5" />
      <path d="M4.5 20.5h3.2" />
      <path d="M30.3 20.5h3.2" />
    </svg>
  );
}

function MoonStars(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {/* The cut is a second arc of a slightly larger radius sweeping back
          along the same chord. Too large and the crescent fattens into a
          bitten disc; 11.8 against a chord of 21.2 keeps it a moon. */}
      <path d="M24.2 8.4a11 11 0 1 0 0 21.2 11.8 11.8 0 0 1 0-21.2Z" />
      {/* In the opening, not on the belly: the crescent's body fills the left
          of the box, so stars placed there read as crumbs stuck to it. */}
      <circle cx="29.6" cy="11.2" r="1.2" />
      <circle cx="32.2" cy="20.4" r="0.85" />
    </svg>
  );
}

function ClockWindow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="19" cy="19" r="11.5" />
      <path d="M19 12.4V19l4.5 2.9" />
      {/* The window, marked outside the dial rather than thickened on it — a
          heavier stroke laid over the rim reads as a fault at 23px, a separate
          arc alongside it reads as a span. */}
      <path d="M26 6.9a14 14 0 0 1 5.1 19.1" strokeWidth="2.4" />
    </svg>
  );
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Today extends DayPanchangam {
  star: string;
}

function readToday(): Today | null {
  const now = new Date();
  const p = panchangamFor(now.getFullYear(), now.getMonth() + 1, now.getDate());
  if (!p) return null;
  const spans = nakshatraSpans(now.getFullYear(), now.getMonth() + 1, now.getDate());
  // A star hands over partway through most days, and a panchangam says so.
  const star =
    spans.length <= 1
      ? p.nakshatra
      : `${spans[0].name} till ${clock(spans[0].toMin)}, then ${spans[1].name}`;
  return { ...p, star };
}

/**
 * Today, in the terms a family checks before they do anything.
 *
 * Computed in the browser rather than on the server: the container runs in UTC
 * and Malaysia is eight hours ahead, so a server-rendered "today" would flip to
 * yesterday's star every evening. Rendering nothing until mount also keeps the
 * markup identical on both sides.
 *
 * Two confidences sit side by side and the strip names both. Rahu Kalam is the
 * daylight cut into eight with a fixed slot per weekday — arithmetic, exact
 * given the sunrise. The natchathiram comes from a computed Moon position, and
 * is close but not an almanac. Saying which is which is the difference between
 * a thing people trust and a thing they catch out.
 */
export function TodayPanchangam() {
  const [today, setToday] = useState<Today | null>(null);
  useEffect(() => setToday(readToday()), []);

  if (!today) return <div className="today today--wait" aria-hidden="true" />;

  const d = new Date(today.date + "T00:00:00");

  return (
    <div className="t t--2 today">
      <div className="today-row">
        <div className="today-cell">
          <Sunrise className="today-ic" />
          <span className="today-k">Today</span>
          <b>
            {today.weekday}, {d.getDate()} {MONTHS[d.getMonth()]}
          </b>
        </div>
        <div className="today-cell">
          <MoonStars className="today-ic" />
          <span className="today-k">Natchathiram</span>
          <b>{today.star}</b>
        </div>
        <div className="today-cell">
          <ClockWindow className="today-ic" />
          <span className="today-k">Rahu Kalam</span>
          <b>
            {clock(today.rahu.startMin)} – {clock(today.rahu.endMin)}
          </b>
        </div>
      </div>

      {/* One line, but it still names both confidences: the Rahu Kalam is
          arithmetic on a real sunrise, the star is a computed position. */}
      <p className="today-note">
        <span>{today.tamilMonth}</span>
        Rahu Kalam exact, from Kuala Lumpur sunrise. Natchathiram computed —
        check a panchangam before fixing a muhurtham.
      </p>
    </div>
  );
}
