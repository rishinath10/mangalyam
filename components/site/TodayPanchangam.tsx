"use client";

import { useEffect, useState } from "react";
import { clock, nakshatraSpans, panchangamFor, type DayPanchangam } from "@/lib/panchangam";

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
          <span className="today-k">Today</span>
          <b>
            {today.weekday}, {d.getDate()} {MONTHS[d.getMonth()]}
          </b>
        </div>
        <div className="today-cell">
          <span className="today-k">Natchathiram</span>
          <b>{today.star}</b>
        </div>
        <div className="today-cell">
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
