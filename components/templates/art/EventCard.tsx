"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/motion/primitives";
import { Countdown } from "@/components/templates/shared/Countdown";
import { invitationToIcs } from "@/lib/calendar";
import { eventStartsAt, formatTime, formatTimeRange } from "@/lib/format";
import type { InvitationJson } from "@/lib/invitation/types";
import type { SectionRule } from "@/components/templates/sections/types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The date taken apart, so the day can be set large between its neighbours. */
function dateParts(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  // Built in UTC so the weekday is the calendar's, whatever zone renders it.
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return { weekday, day, month: MONTHS[month - 1], year };
}

/**
 * Where and when, set the way a printed card sets it: the day large in the
 * middle, the weekday and the hour either side of it.
 *
 * This is the section a guest comes back to on the morning itself, so it also
 * carries the two things they do with it — find the place, and put it in
 * their calendar — as real buttons rather than leaving both to the action bar.
 */
export function EventCard({
  invitation,
  Rule,
  preview = false,
}: {
  invitation: InvitationJson;
  Rule: SectionRule;
  preview?: boolean;
}) {
  const { event, ceremonyLabel, countdown } = invitation;
  const [saved, setSaved] = useState(false);

  const parts = event.date ? dateParts(event.date) : null;
  const startsAt = eventStartsAt(event.date, event.startTime);
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  const upcoming = startsAt !== null && startsAt.getTime() > Date.now();

  function addToCalendar() {
    const ics = invitationToIcs(invitation, location.href.split("#")[0]);
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invitation.couple.hostNames.replace(/[^\w]+/g, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Revoked later, not now: Safari reads the blob after the click returns.
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    setSaved(true);
  }

  return (
    <section className="art-event" aria-labelledby="event-heading">
      <ScrollReveal>
        <p className="art-kicker">Save the date</p>
        <h2 id="event-heading" className="art-title">
          {ceremonyLabel}
        </h2>
        <Rule className="art-event-rule" />
      </ScrollReveal>

      {parts && (
        <ScrollReveal delay={0.08}>
          <p className="art-date-month">
            {parts.month} {parts.year}
          </p>
          <div className="art-date">
            <span className="art-date-side">{parts.weekday}</span>
            <span className="art-date-day">{parts.day}</span>
            <span className="art-date-side">
              {event.startTime ? formatTime(event.startTime) : "All day"}
            </span>
          </div>
          {timeRange && event.endTime && <p className="art-date-range">{timeRange}</p>}
        </ScrollReveal>
      )}

      {(event.venueName || event.address) && (
        <ScrollReveal delay={0.14}>
          <div className="art-venue">
            {event.venueName && <p className="art-venue-name">{event.venueName}</p>}
            {event.address && <p className="art-venue-address">{event.address}</p>}
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={0.2}>
        <div className="art-actions">
          {event.mapLink && (
            <a
              className="art-btn art-btn-solid"
              href={event.mapLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
            </a>
          )}
          {event.date && (
            <button
              type="button"
              className="art-btn"
              onClick={addToCalendar}
              // Inside the builder this would download a file every time the
              // owner clicked around their own preview.
              disabled={preview}
            >
              {saved ? "Saved to calendar" : "Add to calendar"}
            </button>
          )}
        </div>
      </ScrollReveal>

      {countdown.enabled && upcoming && startsAt && (
        <ScrollReveal delay={0.1}>
          <div className="art-countdown">
            <p className="art-kicker">Counting down</p>
            <Countdown target={startsAt} />
          </div>
        </ScrollReveal>
      )}
    </section>
  );
}
