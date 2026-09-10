"use client";

import { FadeIn, ScaleIn } from "@/components/motion/primitives";
import { Couple } from "@/components/templates/sections/Couple";
import { Gallery } from "@/components/templates/sections/Gallery";
import { Greetings } from "@/components/templates/sections/Greetings";
import { Rsvp } from "@/components/templates/sections/Rsvp";
import { Schedule } from "@/components/templates/sections/Schedule";
import { CoverFrame } from "@/components/templates/shared/CoverFrame";
import { formatEventDate, formatTimeRange, splitHostNames } from "@/lib/format";
import { getManifest } from "@/lib/templates/registry";
import type { TemplateProps } from "@/lib/templates/types";
import { ArtFrame } from "./ArtFrame";
import { Crest } from "./Crest";
import { Divider } from "./Divider";
import { Ground } from "./Ground";

/**
 * One renderer for every drawn family.
 *
 * The two original families each have their own component, because each is a
 * particular arrangement of particular strokes. That does not scale: a gallery
 * needs a dozen designs, and nobody hand-writes a dozen components that differ
 * only in which ornament sits where.
 *
 * So a drawn family declares its artwork in the manifest and this lays it out.
 * Adding a design becomes a folder of images and one manifest entry — no code
 * — which is the whole point.
 *
 * It still takes the invitation JSON and nothing else (rule #2), and it still
 * mounts inside the same shell as everything else, so the opening, the drift
 * and the action bar are unchanged.
 */
export function ArtTemplate({ invitation, preview = false }: TemplateProps) {
  const manifest = getManifest(invitation.templateId);
  // From the JSON first: the server already merged any admin uploads over the
  // manifest, and a template must not go looking things up for itself (rule #2).
  const art = invitation.art ?? manifest.art ?? {};
  const { couple, event, ceremonyLabel } = invitation;
  const [firstName, secondName] = splitHostNames(couple.hostNames);
  // A customer's own frame wins over the family's: they paid for it, and two
  // borders around one cover is one border too many.
  const customerFrame = Boolean(invitation.frame);

  const ArtDivider = ({ className }: { className?: string }) => (
    <Divider src={art.divider} className={className} />
  );
  const ArtMark = ({ className }: { className?: string }) =>
    art.crest ? <Crest src={art.crest} className={className} /> : null;

  const shared = {
    invitation,
    Mark: ArtMark,
    Rule: ArtDivider,
    align: "center" as const,
    preview,
  };

  const cover = (
    <header // 84svh, not 92: the frame is 3:4 and a phone is nearer 9:19, so the card
    // can never fill the screen. Asking for the extra height only adds empty
    // ground under a card that has already finished.
    className="relative flex min-h-[84svh] flex-col items-center justify-center overflow-hidden px-3 py-6 text-center">
      {couple.coverPhoto && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={couple.coverPhoto} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[var(--ds-surface)]/78" />
        </div>
      )}

      <CoverFrame frame={invitation.frame}>
        <ArtFrame src={customerFrame ? undefined : art.frame}>
          <div className="relative flex w-full flex-col items-center">
            {art.crest && (
              <ScaleIn>
                <Crest src={art.crest} className="mx-auto w-[38%] max-w-[132px]" />
              </ScaleIn>
            )}

            <FadeIn delay={0.15}>
              <p className="mt-5 text-[11px] uppercase tracking-[0.4em] text-[var(--ds-ink-muted)]">
                {ceremonyLabel}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h1 className="mt-4 font-[family-name:var(--ds-font-display)] text-[clamp(1.9rem,8.5vw,3.1rem)] leading-[1.08] text-[var(--ds-brand-deep)]">
                <span className="block">{firstName}</span>
                {secondName && (
                  <>
                    <span className="my-1 block text-[0.44em] italic tracking-[0.28em] text-[var(--ds-accent)]">
                      &amp;
                    </span>
                    <span className="block">{secondName}</span>
                  </>
                )}
              </h1>
            </FadeIn>

            {event.date && (
              <FadeIn delay={0.45}>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <ArtDivider />
                  <p className="text-[0.82rem] tracking-[0.14em] text-[var(--ds-ink)]">
                    {formatEventDate(event.date)}
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </ArtFrame>
      </CoverFrame>
    </header>
  );

  const eventSection = (
    <section className="relative px-6 py-14 text-center">
      <FadeIn>
        <p className="text-[11px] uppercase tracking-[0.36em] text-[var(--ds-accent)]">
          Where and when
        </p>
        <h2 className="mt-3 font-[family-name:var(--ds-font-display)] text-[1.7rem] text-[var(--ds-brand-deep)]">
          {ceremonyLabel}
        </h2>
        <ArtDivider className="my-6" />
        {event.date && (
          <p className="text-[1.02rem] text-[var(--ds-ink)]">{formatEventDate(event.date)}</p>
        )}
        {formatTimeRange(event.startTime, event.endTime) && (
          <p className="mt-1 text-[0.86rem] text-[var(--ds-ink-muted)]">
            {formatTimeRange(event.startTime, event.endTime)}
          </p>
        )}
        {event.venueName && (
          <p className="mt-5 font-[family-name:var(--ds-font-display)] text-[1.22rem] text-[var(--ds-brand-deep)]">
            {event.venueName}
          </p>
        )}
        {event.address && (
          <p className="mx-auto mt-2 max-w-[30ch] whitespace-pre-line text-[0.86rem] leading-relaxed text-[var(--ds-ink-muted)]">
            {event.address}
          </p>
        )}
        {event.mapLink && (
          <a
            href={event.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block border border-[var(--ds-accent-line)] px-6 py-2.5 text-[0.72rem] uppercase tracking-[0.22em] text-[var(--ds-accent)]"
            style={{ borderRadius: "var(--ds-radius)" }}
          >
            Get directions
          </a>
        )}
      </FadeIn>
    </section>
  );

  const sections = {
    cover,
    couple: <Couple {...shared} />,
    event: eventSection,
    schedule: <Schedule {...shared} />,
    gallery: <Gallery {...shared} />,
    greetings: <Greetings {...shared} />,
    rsvp: <Rsvp {...shared} />,
  } as const;

  return (
    <div className="relative min-h-full bg-[var(--ds-surface)] font-[family-name:var(--ds-font-body)] text-[var(--ds-ink)] antialiased">
      <Ground art={art} />

      {/* Above the ground, or the texture sits on top of the words. */}
      <div className="relative">
        {manifest.sections.map((key) => (
          <div key={key}>{sections[key]}</div>
        ))}

        <footer className="px-6 pb-14 pt-4 text-center">
          <ArtDivider className="opacity-60" />
          <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--ds-ink-muted)]">
            {couple.hostNames}
          </p>
        </footer>
      </div>
    </div>
  );
}
