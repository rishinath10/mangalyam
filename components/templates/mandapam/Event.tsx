"use client";

import { CornerFret } from "@/components/decor";
import { ScrollReveal } from "@/components/motion/primitives";
import { Countdown } from "@/components/templates/shared/Countdown";
import { eventStartsAt, formatEventDate, formatTimeRange } from "@/lib/format";
import type { InvitationJson } from "@/lib/invitation/types";

/** Mandapam's details: one bordered panel, fretwork at opposing corners. */
export function Event({ invitation }: { invitation: InvitationJson }) {
  const { event, countdown, ceremonyLabel } = invitation;
  const startsAt = eventStartsAt(event.date, event.startTime);
  const timeRange = formatTimeRange(event.startTime, event.endTime);

  return (
    <section className="px-6 py-16" aria-labelledby="event-heading">
      <ScrollReveal>
        <div className="relative mx-auto max-w-xl rounded-[var(--ds-radius)] border border-[var(--ds-rule)] bg-[var(--ds-surface-alt)] px-6 py-12 text-center sm:px-10">
          <CornerFret
            className="pointer-events-none absolute left-0 top-0 h-14 w-14 text-[var(--ds-gold)] opacity-60"
          />
          <CornerFret
            className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 rotate-180 text-[var(--ds-gold)] opacity-60"
          />

          <h2
            id="event-heading"
            className="text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
          >
            {ceremonyLabel}
          </h2>

          {event.date && (
            <p className="mt-5 font-[family-name:var(--ds-font-display)] text-2xl text-[var(--ds-brand-deep)] sm:text-3xl">
              {formatEventDate(event.date)}
            </p>
          )}

          {timeRange && (
            <p className="mt-3 text-sm tracking-[0.14em] text-[var(--ds-ink)]">{timeRange}</p>
          )}

          {(event.venueName || event.address) && (
            <div className="mt-8 border-t border-[var(--ds-rule)] pt-8">
              {event.venueName && (
                <p className="font-[family-name:var(--ds-font-display)] text-lg text-[var(--ds-ink)]">
                  {event.venueName}
                </p>
              )}
              {event.address && (
                <p className="mx-auto mt-2 max-w-sm whitespace-pre-line text-sm leading-relaxed text-[var(--ds-ink-muted)]">
                  {event.address}
                </p>
              )}
              {event.mapLink && (
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-[var(--ds-radius)] border border-[var(--ds-accent-line)] px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-[var(--ds-brand)] transition hover:bg-[var(--ds-accent-soft)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path
                      d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  Open in Maps
                </a>
              )}
            </div>
          )}

          {countdown.enabled && startsAt && (
            <div className="mt-10 border-t border-[var(--ds-rule)] pt-8">
              <Countdown target={startsAt} />
            </div>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
