"use client";

import { LotusGlyph, ZariBand } from "@/components/decor";
import { getManifest } from "@/lib/templates/registry";
import type { TemplateProps } from "@/lib/templates/types";
import { Couple } from "@/components/templates/sections/Couple";
import { Gallery } from "@/components/templates/sections/Gallery";
import { Greetings } from "@/components/templates/sections/Greetings";
import { Rsvp } from "@/components/templates/sections/Rsvp";
import { Schedule } from "@/components/templates/sections/Schedule";
import { Cover } from "./Cover";
import { Event } from "./Event";

/**
 * Mandapam — the wedding family. Symmetric and centred throughout, marked
 * with a lotus rosette.
 *
 * It takes the invitation JSON and nothing else (rule #2): no fetching, no
 * writes, no hardcoded couple. Section order comes from the manifest, and
 * neither the order nor the type scale is exposed to the builder.
 */
export function MandapamTemplate({ invitation, preview = false }: TemplateProps) {
  const manifest = getManifest(invitation.templateId);
  const MandapamRule = ({ className }: { className?: string }) => (
    <ZariBand className={`h-4 w-56 text-[var(--ds-gold)] opacity-70 ${className ?? ""}`} />
  );

  const shared = {
    invitation,
    Mark: LotusGlyph,
    Rule: MandapamRule,
    align: "center" as const,
    preview,
  };

  const sections = {
    cover: <Cover invitation={invitation} />,
    couple: <Couple {...shared} />,
    event: <Event invitation={invitation} />,
    schedule: <Schedule {...shared} />,
    gallery: <Gallery {...shared} />,
    greetings: <Greetings {...shared} />,
    rsvp: <Rsvp {...shared} />,
  } as const;

  return (
    <div className="min-h-full bg-[var(--ds-surface)] font-[family-name:var(--ds-font-body)] text-[var(--ds-ink)] antialiased">
      {manifest.sections.map((key) => (
        <div key={key}>{sections[key]}</div>
      ))}

      <footer className="px-6 pb-14 pt-4 text-center">
        <ZariBand className="mx-auto h-4 w-44 rotate-180 text-[var(--ds-accent)] opacity-45" />
        <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--ds-ink-muted)]">
          {invitation.couple.hostNames}
        </p>
      </footer>
    </div>
  );
}
