"use client";

import { GopuramArch, Kalash } from "@/components/decor";
import { FadeIn, ScaleIn } from "@/components/motion/primitives";
import { formatEventDate } from "@/lib/format";
import type { InvitationJson } from "@/lib/invitation/types";

export function Cover({ invitation }: { invitation: InvitationJson }) {
  const { couple, event, ceremonyLabel } = invitation;

  return (
    <header className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {couple.coverPhoto && (
        <div className="absolute inset-0">
          {/* Decorative backdrop: the couple's names carry the meaning, so an
              empty alt keeps screen readers from reading a filename. */}
          <img
            src={couple.coverPhoto}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--ds-surface)]/78" />
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-full w-full max-w-[420px] text-[var(--ds-gold)] opacity-45"
        aria-hidden="true"
      >
        <GopuramArch className="h-full w-full" />
      </div>

      <div className="relative flex flex-col items-center">
        <ScaleIn>
          <Kalash className="mx-auto h-14 w-14 text-[var(--ds-accent)]" />
        </ScaleIn>

        <FadeIn delay={0.15}>
          <p className="mt-6 text-[11px] uppercase tracking-[0.42em] text-[var(--ds-ink-muted)]">
            {ceremonyLabel}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.4rem,11vw,4.25rem)] leading-[1.05] text-[var(--ds-brand-deep)]">
            <span className="block">{couple.name1}</span>
            <span className="my-2 block text-[0.45em] tracking-[0.3em] text-[var(--ds-accent)]">
              &amp;
            </span>
            <span className="block">{couple.name2}</span>
          </h1>
        </FadeIn>

        {event.date && (
          <FadeIn delay={0.45}>
            <div className="mt-8 flex flex-col items-center gap-3">
              <span className="h-px w-16 bg-[var(--ds-accent-line)]" />
              <p className="text-sm tracking-[0.16em] text-[var(--ds-ink)]">
                {formatEventDate(event.date)}
              </p>
              <span className="h-px w-16 bg-[var(--ds-accent-line)]" />
            </div>
          </FadeIn>
        )}
      </div>
    </header>
  );
}
