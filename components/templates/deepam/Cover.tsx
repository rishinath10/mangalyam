"use client";

import { FlameGlyph, KolamDots } from "@/components/decor";
import { FadeIn, ScaleIn } from "@/components/motion/primitives";
import { formatEventDate } from "@/lib/format";
import type { InvitationJson } from "@/lib/invitation/types";

/**
 * Deepam's cover: left-aligned and deliberately asymmetric, where Mandapam is
 * centred and symmetric. The host line renders whole — one name, a family, a
 * committee — with no assumption that it is a pair.
 */
export function Cover({ invitation }: { invitation: InvitationJson }) {
  const { couple, event, ceremonyLabel } = invitation;

  return (
    /* justify-between, not justify-center: centring this much smaller block on
       a phone leaves a third of the screen dead at top and bottom and the cover
       reads as floating. Three bands — mark, name, date — hold the full height,
       which is also what makes the asymmetry read as deliberate. */
    <header className="relative flex min-h-[92svh] flex-col justify-between overflow-hidden px-7 pb-14 pt-24">
      {couple.coverPhoto && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={couple.coverPhoto} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[var(--ds-surface)]/80" />
        </div>
      )}

      <KolamDots
        className="pointer-events-none absolute -right-6 top-10 h-40 w-40 text-[var(--ds-gold)] opacity-30"
      />

      <div className="relative">
        <ScaleIn>
          <FlameGlyph className="h-12 w-12 text-[var(--ds-accent)]" />
        </ScaleIn>
      </div>

      <div className="relative">
        <FadeIn delay={0.15}>
          <p className="text-[11px] uppercase tracking-[0.42em] text-[var(--ds-ink-muted)]">
            {ceremonyLabel}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <h1 className="mt-4 max-w-[14ch] font-[family-name:var(--ds-font-display)] text-[clamp(2.1rem,10vw,3.6rem)] leading-[1.08] text-[var(--ds-brand-deep)]">
            {couple.hostNames}
          </h1>
        </FadeIn>
      </div>

      <div className="relative">
        {event.date && (
          <FadeIn delay={0.45}>
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-[var(--ds-accent)]" aria-hidden="true" />
              <p className="text-sm tracking-[0.16em] text-[var(--ds-ink)]">
                {formatEventDate(event.date)}
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </header>
  );
}
