"use client";

import { ArchLine, LotusGlyph, ZariBand } from "@/components/decor";
import { FadeIn, ScaleIn } from "@/components/motion/primitives";
import { CoverFrame } from "@/components/templates/shared/CoverFrame";
import { formatEventDate, splitHostNames } from "@/lib/format";
import type { InvitationJson } from "@/lib/invitation/types";

/**
 * Mandapam's cover: symmetric, centred, framed by the pavilion arch. Two
 * names stacked over an ampersand — the one place a family's layout assumes
 * a pair, which is why Mandapam is offered to weddings only.
 */
export function Cover({ invitation }: { invitation: InvitationJson }) {
  const { couple, event, ceremonyLabel } = invitation;
  const [firstName, secondName] = splitHostNames(couple.hostNames);
  const framed = Boolean(invitation.frame);

  return (
    <header className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {couple.coverPhoto && (
        <div className="absolute inset-0">
          {/* Decorative backdrop: the names carry the meaning, so an empty alt
              keeps screen readers from reading out a filename. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={couple.coverPhoto} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[var(--ds-surface)]/78" />
        </div>
      )}

      {/* The arch is Mandapam's own border. With customer artwork in place
          there are two borders competing, so the family's steps aside. */}
      {!framed && (
        <div
          className="pointer-events-none absolute inset-4 mx-auto max-w-[380px] text-[var(--ds-gold)] opacity-50"
          aria-hidden="true"
        >
          <ArchLine className="h-full w-full" preserveAspectRatio="none" />
        </div>
      )}

      <CoverFrame frame={invitation.frame}>
      <div className="relative flex flex-col items-center">
        <ScaleIn>
          <LotusGlyph className="mx-auto h-12 w-12 text-[var(--ds-accent)]" />
        </ScaleIn>

        <FadeIn delay={0.15}>
          <p className="mt-6 text-[11px] uppercase tracking-[0.42em] text-[var(--ds-ink-muted)]">
            {ceremonyLabel}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <h1 className="mt-5 font-[family-name:var(--ds-font-display)] text-[clamp(2.4rem,11vw,4.25rem)] leading-[1.05] text-[var(--ds-brand-deep)]">
            <span className="block">{firstName}</span>
            {secondName && (
              <>
                <span className="my-2 block text-[0.45em] tracking-[0.3em] text-[var(--ds-accent)]">
                  &amp;
                </span>
                <span className="block">{secondName}</span>
              </>
            )}
          </h1>
        </FadeIn>

        {event.date && (
          <FadeIn delay={0.45}>
            <div className="mt-8 flex flex-col items-center gap-4">
              <ZariBand className="h-4 w-40 text-[var(--ds-gold)] opacity-80" />
              <p className="text-sm tracking-[0.16em] text-[var(--ds-ink)]">
                {formatEventDate(event.date)}
              </p>
            </div>
          </FadeIn>
        )}
      </div>
      </CoverFrame>
    </header>
  );
}
