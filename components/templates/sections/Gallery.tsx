"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ScrollReveal, StaggerItem, StaggerList } from "@/components/motion/primitives";
import { Lightbox } from "@/components/templates/shared/Lightbox";
import { alignClasses, type SectionProps } from "@/components/templates/sections/types";

export function Gallery({ invitation, Rule, align }: SectionProps) {
  const { gallery } = invitation;
  // Which photograph is open full size. Null while the section is just a grid.
  const [open, setOpen] = useState<number | null>(null);
  if (gallery.length === 0) return null;
  const a = alignClasses(align);

  return (
    <section className="px-6 py-16" aria-labelledby="gallery-heading">
      <ScrollReveal className={a.text}>
        <h2
          id="gallery-heading"
          className="text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          Moments
        </h2>
        <Rule className={`mt-5 ${a.block}`} />
      </ScrollReveal>

      <StaggerList className={`mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3 ${a.block}`}>
        {gallery.map((photo, i) => (
          <StaggerItem key={`${photo.url}-${i}`}>
            {/* A button, not a div with a handler: this opens something, and a
                guest on a keyboard has to be able to reach it. */}
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="gal-tile block w-full overflow-hidden rounded-[var(--ds-radius)] border border-[var(--ds-rule)] text-left"
            >
              <img
                src={photo.url}
                alt={photo.caption || `Photograph ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
              {photo.caption && (
                <span className="block bg-[var(--ds-surface-alt)] px-2 py-1.5 text-center text-[11px] text-[var(--ds-ink-muted)]">
                  {photo.caption}
                </span>
              )}
            </button>
          </StaggerItem>
        ))}
      </StaggerList>

      <Lightbox gallery={gallery} index={open} onClose={() => setOpen(null)} onMove={setOpen} />
    </section>
  );
}
