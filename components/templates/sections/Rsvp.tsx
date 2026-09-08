"use client";

import { ScrollReveal } from "@/components/motion/primitives";
import { RsvpForm } from "@/components/templates/shared/RsvpForm";
import { formatShortDate } from "@/lib/format";
import { alignClasses, type SectionProps } from "@/components/templates/sections/types";

export function Rsvp({ invitation, Mark, align, preview = false }: SectionProps) {
  const { rsvp } = invitation;
  if (!rsvp.enabled) return null;
  const a = alignClasses(align);

  const closed =
    rsvp.closeDate !== null && new Date(`${rsvp.closeDate}T23:59:59Z`).getTime() < Date.now();

  return (
    <section id="rsvp" className="px-6 py-16" aria-labelledby="rsvp-heading">
      <ScrollReveal className={`max-w-md ${a.text} ${a.block}`}>
        <Mark className={`h-12 w-12 text-[var(--ds-accent)] opacity-80 ${a.block}`} />
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
