"use client";

import { FadeIn, ScaleIn } from "@/components/motion/primitives";
import { Couple } from "@/components/templates/sections/Couple";
import { Gallery } from "@/components/templates/sections/Gallery";
import { Blessings } from "@/components/templates/sections/Blessings";
import { Greetings } from "@/components/templates/sections/Greetings";
import { Rsvp } from "@/components/templates/sections/Rsvp";
import { Schedule } from "@/components/templates/sections/Schedule";
import { CoverFrame } from "@/components/templates/shared/CoverFrame";
import { formatEventDate, splitHostNames } from "@/lib/format";
import { getManifest } from "@/lib/templates/registry";
import type { TemplateProps } from "@/lib/templates/types";
import { ArtFrame } from "./ArtFrame";
import { EventCard } from "./EventCard";
import { Particles } from "./Particles";
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
  // From the JSON first: the server already merged any admin uploads over the
  // manifest, and a template must not go looking things up for itself (rule
  // #2). A custom design is not in the registry at all, so the fallback is
  // only ever reached by the families written in code.
  const manifest = invitation.design ?? getManifest(invitation.templateId);
  const art = invitation.art ?? manifest.art ?? {};
  const { couple, event, ceremonyLabel } = invitation;
  const [firstName, secondName] = splitHostNames(couple.hostNames);
  // A customer's own frame wins over the family's: they paid for it, and two
  // borders around one cover is one border too many.
  const customerFrame = Boolean(invitation.frame);

  const ArtDivider = ({ className }: { className?: string }) => (
    <Divider src={art.divider} className={className} />
  );
  // Sections size their mark for a stroked glyph (h-9 w-9) and colour it with
  // the accent. A painted crest has its own proportions and its own colours,
  // so it keeps the caller's spacing and alignment and drops the rest.
  const ArtMark = ({ className }: { className?: string }) => {
    if (!art.crest) return null;
    const kept = (className ?? "")
      .split(/\s+/)
      .filter((c) => c && !/^(h|w|text|opacity)-/.test(c))
      .join(" ");
    return <Crest src={art.crest} className={`art-mark ${kept}`} />;
  };

  const shared = {
    invitation,
    Mark: ArtMark,
    Rule: ArtDivider,
    align: "center" as const,
    preview,
  };

  const frameCover = (
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

  /**
   * The painted cover: the family's scene edge to edge, with the invitation
   * printed in the clear middle the painting leaves for it.
   *
   * The text box is placed in fractions of the scene rather than centred on
   * the screen, because the clear space belongs to the painting — an arch has
   * its opening where the arch is, not where the viewport's middle happens to
   * fall. The cover is never shorter than the painting's own 9:16, so the
   * scene only ever loses its sides to a narrow screen and the opening stays
   * where the fractions say it is.
   */
  const sceneCover = art.scene ? (
    <header
      className="art-scene"
      style={
        art.sceneText
          ? ({
              "--scene-top": `${art.sceneText.top}%`,
              "--scene-bottom": `${art.sceneText.bottom}%`,
              ...(art.sceneText.width ? { "--scene-width": `${art.sceneText.width}cqw` } : {}),
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.scene} alt="" aria-hidden="true" className="art-scene-img" />

      {art.particles && <Particles particles={art.particles} />}

      {/* No motion components in here: these come in on the guest's tap, not
          on page load, and the tap is a flag on the shell that only CSS can
          see from this far down. Each direct child is one beat of the reveal. */}
      <div className="art-scene-text">
        {couple.coverPhoto ? (
          <div className="art-scene-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={couple.coverPhoto} alt="" />
          </div>
        ) : (
          art.crest && <Crest src={art.crest} className="art-scene-crest" />
        )}

        <p className="art-scene-label">{ceremonyLabel}</p>

        <h1 className="art-scene-names">
          <span>{firstName}</span>
          {secondName && (
            <>
              <i aria-hidden="true">&amp;</i>
              <span className="sr-only"> and </span>
              <span>{secondName}</span>
            </>
          )}
        </h1>

        {event.date && (
          <div className="art-scene-when">
            <ArtDivider className="art-scene-rule" />
            <p className="art-scene-date">{formatEventDate(event.date)}</p>
            {event.venueName && <p className="art-scene-venue">{event.venueName}</p>}
          </div>
        )}
      </div>

      <span className="art-scene-cue" aria-hidden="true" />
    </header>
  ) : null;

  // A customer's own frame still wins over a painted scene, for the same
  // reason it wins over the family's frame.
  const cover = sceneCover && !customerFrame ? sceneCover : frameCover;

  const eventSection = <EventCard invitation={invitation} Rule={ArtDivider} preview={preview} />;

  const sections = {
    cover,
    couple: <Couple {...shared} />,
    event: eventSection,
    schedule: <Schedule {...shared} />,
    gallery: <Gallery {...shared} />,
    greetings: <Greetings {...shared} />,
    rsvp: <Rsvp {...shared} />,
    blessings: <Blessings {...shared} />,
  } as const;

  return (
    <div className="relative min-h-full bg-[var(--ds-surface)] font-[family-name:var(--ds-font-body)] text-[var(--ds-ink)] antialiased">
      <Ground art={art} />

      {/* Above the ground, or the texture sits on top of the words. */}
      <div className="art-body relative">
        {manifest.sections.map((key) => (
          <div key={key}>{sections[key]}</div>
        ))}

        {art.closing ? (
          <footer className="art-closing">
            <p className="art-closing-thanks">With love</p>
            <p className="art-closing-names">{couple.hostNames}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={art.closing} alt="" aria-hidden="true" loading="lazy" />
          </footer>
        ) : (
          <footer className="px-6 pb-14 pt-4 text-center">
            <ArtDivider className="opacity-60" />
            <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--ds-ink-muted)]">
              {couple.hostNames}
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
