"use client";

import { KolamBorder } from "@/components/decor";
import { ScrollReveal, StaggerItem, StaggerList } from "@/components/motion/primitives";
import type { InvitationJson } from "@/lib/invitation/types";

export function Gallery({ invitation }: { invitation: InvitationJson }) {
  const { gallery } = invitation;
  if (gallery.length === 0) return null;

  return (
    <section className="px-6 py-16" aria-labelledby="gallery-heading">
      <ScrollReveal className="text-center">
        <h2
          id="gallery-heading"
          className="text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          Moments
        </h2>
        <KolamBorder
          id="gallery-kolam"
          className="mx-auto mt-5 h-5 w-56 text-[var(--ds-gold)] opacity-70"
        />
      </ScrollReveal>

      <StaggerList className="mx-auto mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
        {gallery.map((photo, i) => (
          <StaggerItem key={`${photo.url}-${i}`}>
            <figure className="overflow-hidden rounded-[var(--ds-radius)] border border-[var(--ds-rule)]">
              <img
                src={photo.url}
                alt={photo.caption || ""}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
              {photo.caption && (
                <figcaption className="bg-[var(--ds-surface-alt)] px-2 py-1.5 text-center text-[11px] text-[var(--ds-ink-muted)]">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          </StaggerItem>
        ))}
      </StaggerList>
    </section>
  );
}
