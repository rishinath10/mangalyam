"use client";

import { Garland } from "@/components/decor";
import { ScrollReveal } from "@/components/motion/primitives";
import type { InvitationJson } from "@/lib/invitation/types";

export function Couple({ invitation }: { invitation: InvitationJson }) {
  const { couple } = invitation;
  if (!couple.message) return null;

  return (
    <section className="px-6 py-16 text-center" aria-labelledby="couple-heading">
      <ScrollReveal>
        <Garland className="mx-auto h-9 w-56 text-[var(--ds-accent)] opacity-70" />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <h2
          id="couple-heading"
          className="mt-7 text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          With joy in our hearts
        </h2>
        <p className="mx-auto mt-5 max-w-lg whitespace-pre-line font-[family-name:var(--font-display)] text-lg leading-relaxed text-[var(--ds-ink)] sm:text-xl">
          {couple.message}
        </p>
      </ScrollReveal>
    </section>
  );
}
