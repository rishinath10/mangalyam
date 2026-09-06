"use client";

import { Peacock } from "@/components/decor";
import { ScrollReveal } from "@/components/motion/primitives";
import { formatShortDate } from "@/lib/format";
import type { InvitationJson } from "@/lib/invitation/types";

/**
 * Presentational only. Submission is Phase 5 — the section exists now so the
 * design system covers it and Phase 5 is a wiring job, not a layout job. The
 * fields are disabled rather than hidden so the customer sees in the builder
 * exactly what their guests will get.
 */
export function Rsvp({ invitation }: { invitation: InvitationJson }) {
  const { rsvp } = invitation;
  if (!rsvp.enabled) return null;

  return (
    <section className="px-6 py-16" aria-labelledby="rsvp-heading">
      <ScrollReveal className="mx-auto max-w-md text-center">
        <Peacock className="mx-auto h-14 w-14 text-[var(--ds-accent)] opacity-80" />
        <h2
          id="rsvp-heading"
          className="mt-6 text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          Will you join us?
        </h2>
        {rsvp.closeDate && (
          <p className="mt-3 text-sm text-[var(--ds-ink-muted)]">
            Kindly respond by {formatShortDate(rsvp.closeDate)}
          </p>
        )}

        <fieldset
          disabled
          className="mt-8 space-y-3 text-left opacity-70"
          aria-describedby="rsvp-pending"
        >
          <input
            placeholder="Your name"
            className="w-full rounded-[var(--ds-radius)] border border-[var(--ds-rule)] bg-[var(--ds-surface)] px-4 py-3 text-sm text-[var(--ds-ink)] placeholder:text-[var(--ds-ink-muted)]"
          />
          <div className="grid grid-cols-2 gap-3">
            <span className="rounded-[var(--ds-radius)] border border-[var(--ds-accent-line)] bg-[var(--ds-accent-soft)] px-4 py-3 text-center text-sm text-[var(--ds-brand)]">
              Joyfully accept
            </span>
            <span className="rounded-[var(--ds-radius)] border border-[var(--ds-rule)] px-4 py-3 text-center text-sm text-[var(--ds-ink-muted)]">
              Regretfully decline
            </span>
          </div>
          <input
            placeholder="Number of guests"
            className="w-full rounded-[var(--ds-radius)] border border-[var(--ds-rule)] bg-[var(--ds-surface)] px-4 py-3 text-sm text-[var(--ds-ink)] placeholder:text-[var(--ds-ink-muted)]"
          />
          {rsvp.askMealPreference && (
            <input
              placeholder="Meal preference"
              className="w-full rounded-[var(--ds-radius)] border border-[var(--ds-rule)] bg-[var(--ds-surface)] px-4 py-3 text-sm text-[var(--ds-ink)] placeholder:text-[var(--ds-ink-muted)]"
            />
          )}
          <textarea
            rows={3}
            placeholder="A message for the couple"
            className="w-full rounded-[var(--ds-radius)] border border-[var(--ds-rule)] bg-[var(--ds-surface)] px-4 py-3 text-sm text-[var(--ds-ink)] placeholder:text-[var(--ds-ink-muted)]"
          />
        </fieldset>

        <p id="rsvp-pending" className="mt-4 text-xs text-[var(--ds-ink-muted)]">
          RSVP submission arrives in Phase 5.
        </p>
      </ScrollReveal>
    </section>
  );
}
