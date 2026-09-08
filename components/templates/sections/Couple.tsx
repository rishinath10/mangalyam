"use client";

import { ScrollReveal } from "@/components/motion/primitives";
import { alignClasses, type SectionProps } from "@/components/templates/sections/types";

/** The couple's — or the host's — own words. Hidden when they wrote none. */
export function Couple({ invitation, Mark, align }: SectionProps) {
  const { couple } = invitation;
  if (!couple.message) return null;
  const a = alignClasses(align);

  return (
    <section className={`px-6 py-16 ${a.text}`} aria-labelledby="couple-heading">
      <ScrollReveal>
        <Mark className={`h-9 w-9 text-[var(--ds-accent)] opacity-80 ${a.block}`} />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <h2
          id="couple-heading"
          className="mt-6 text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          In our own words
        </h2>
        <p
          className={`mt-5 max-w-lg whitespace-pre-line font-[family-name:var(--ds-font-display)] text-lg leading-relaxed text-[var(--ds-ink)] sm:text-xl ${a.block}`}
        >
          {couple.message}
        </p>
      </ScrollReveal>
    </section>
  );
}
