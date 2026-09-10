"use client";

import { ScrollReveal, StaggerItem, StaggerList } from "@/components/motion/primitives";
import { alignClasses, type SectionProps } from "@/components/templates/sections/types";

/**
 * What guests wrote, shown back on the page.
 *
 * Rendered as plain text nodes, never as markup: this is the one place on a
 * public invitation where a stranger's words are printed, and React escaping
 * them is what keeps a message from becoming a script. The API caps the length
 * and rate-limits the endpoint; this end just prints.
 *
 * Nothing about who is coming appears here — the JSON carries only a name and
 * a message (see invitationInclude), so the headcount cannot be read off the
 * public page even by counting.
 */
export function Greetings({ invitation, Rule, align }: SectionProps) {
  const { greetings } = invitation;
  if (!greetings || greetings.length === 0) return null;
  const a = alignClasses(align);

  return (
    <section className="px-6 py-16" aria-labelledby="greetings-heading">
      <ScrollReveal className={a.text}>
        <h2
          id="greetings-heading"
          className="text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          Wishes
        </h2>
        <Rule className={`mt-5 ${a.block}`} />
      </ScrollReveal>

      <StaggerList className={`mt-9 grid max-w-xl gap-3 ${a.block}`}>
        {greetings.map((g, i) => (
          <StaggerItem key={`${g.at}-${i}`}>
            <figure className="greet">
              <blockquote>{g.message}</blockquote>
              <figcaption>{g.guestName}</figcaption>
            </figure>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}
