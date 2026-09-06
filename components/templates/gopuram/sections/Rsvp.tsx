"use client";

import { Peacock } from "@/components/decor";
import { ScrollReveal } from "@/components/motion/primitives";
import { RsvpForm } from "@/components/templates/shared/RsvpForm";
import { formatShortDate } from "@/lib/format";
import type { InvitationJson } from "@/lib/invitation/types";

export function Rsvp({
  invitation,
  preview = false,
}: {
  invitation: InvitationJson;
  preview?: boolean;
}) {
  const { rsvp } = invitation;
  if (!rsvp.enabled) return null;

  const closed =
    rsvp.closeDate !== null && new Date(`${rsvp.closeDate}T23:59:59Z`).getTime() < Date.now();

  return (
    <section id="rsvp" className="px-6 py-16" aria-labelledby="rsvp-heading">
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
            {closed
              ? "Replies have closed — please call us instead."
              : `Kindly respond by ${formatShortDate(rsvp.closeDate)}`}
          </p>
        )}

        {!closed && (
          <div className="mt-7 text-left">
            <RsvpForm invitation={invitation} preview={preview} />
          </div>
        )}
      </ScrollReveal>
    </section>
  );
}
