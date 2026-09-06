"use client";

import { Garland } from "@/components/decor";
import { MusicToggle } from "@/components/templates/shared/MusicToggle";
import { getManifest } from "@/lib/templates/registry";
import type { TemplateProps } from "@/lib/templates/types";
import { Cover } from "./sections/Cover";
import { Couple } from "./sections/Couple";
import { Event } from "./sections/Event";
import { Schedule } from "./sections/Schedule";
import { Gallery } from "./sections/Gallery";
import { Rsvp } from "./sections/Rsvp";

/**
 * Gopuram — the Phase 3 launch design.
 *
 * It takes the invitation JSON and nothing else (rule #2): no fetching, no
 * writes, no hardcoded couple. Section order comes from the manifest so a
 * template variant can reorder or drop sections without touching this file.
 */
export function GopuramTemplate({ invitation, preview = false }: TemplateProps) {
  const manifest = getManifest(invitation.templateId);

  const sections = {
    cover: <Cover invitation={invitation} />,
    couple: <Couple invitation={invitation} />,
    event: <Event invitation={invitation} />,
    schedule: <Schedule invitation={invitation} />,
    gallery: <Gallery invitation={invitation} />,
    rsvp: <Rsvp invitation={invitation} />,
  } as const;

  const musicOn =
    manifest.features.music && invitation.music.enabled && invitation.music.url;

  return (
    <div className="min-h-full bg-[var(--ds-surface)] font-[family-name:var(--font-body)] text-[var(--ds-ink)] antialiased">
      {manifest.sections.map((key) => (
        <div key={key}>{sections[key]}</div>
      ))}

      <footer className="px-6 pb-14 pt-4 text-center">
        <Garland className="mx-auto h-8 w-44 rotate-180 text-[var(--ds-accent)] opacity-45" />
        <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--ds-ink-muted)]">
          {invitation.couple.name1} &amp; {invitation.couple.name2}
        </p>
      </footer>

      {/* Never mount the audio element in the builder: editing a page should
          not be able to start playing music at the customer. */}
      {musicOn && !preview && <MusicToggle url={invitation.music.url!} />}
    </div>
  );
}
