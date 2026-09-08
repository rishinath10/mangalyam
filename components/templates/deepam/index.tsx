"use client";

import { FlameGlyph } from "@/components/decor";
import { getManifest } from "@/lib/templates/registry";
import type { TemplateProps } from "@/lib/templates/types";
import { Couple } from "@/components/templates/sections/Couple";
import { Gallery } from "@/components/templates/sections/Gallery";
import { Rsvp } from "@/components/templates/sections/Rsvp";
import { Schedule } from "@/components/templates/sections/Schedule";
import { Cover } from "./Cover";
import { Event } from "./Event";

/**
 * Deepam — the general-occasion family: naming ceremonies, housewarmings,
 * milestone birthdays, temple consecrations, home poojas, community events,
 * and weddings for anyone who prefers the quieter of the two.
 *
 * Left-aligned where Mandapam is centred, marked with a flame instead of a
 * lotus, and it never assumes the host line is a pair.
 */
export function DeepamTemplate({ invitation, preview = false }: TemplateProps) {
  const manifest = getManifest(invitation.templateId);
  // Deepam's divider is the same bare accent rule its cover and footer use;
  // it has no woven-border motif to echo.
  const DeepamRule = ({ className }: { className?: string }) => (
    <span
      className={`block h-px w-16 bg-[var(--ds-accent)] opacity-60 ${className ?? ""}`}
      aria-hidden="true"
    />
  );

  const shared = {
    invitation,
    Mark: FlameGlyph,
    Rule: DeepamRule,
    align: "left" as const,
    preview,
  };

  const sections = {
    cover: <Cover invitation={invitation} />,
    couple: <Couple {...shared} />,
    event: <Event invitation={invitation} />,
    schedule: <Schedule {...shared} />,
    gallery: <Gallery {...shared} />,
    rsvp: <Rsvp {...shared} />,
  } as const;

  return (
    <div className="min-h-full bg-[var(--ds-surface)] font-[family-name:var(--ds-font-body)] text-[var(--ds-ink)] antialiased">
      {manifest.sections.map((key) => (
        <div key={key}>{sections[key]}</div>
      ))}

      <footer className="px-7 pb-14 pt-4">
        <span className="block h-px w-12 bg-[var(--ds-accent)] opacity-60" aria-hidden="true" />
        <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--ds-ink-muted)]">
          {invitation.couple.hostNames}
        </p>
      </footer>
    </div>
  );
}
