"use client";

import { ScrollReveal, StaggerItem, StaggerList } from "@/components/motion/primitives";
import { alignClasses, type SectionProps } from "@/components/templates/sections/types";

export function Gallery({ invitation, Rule, align }: SectionProps) {
  const { gallery } = invitation;
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
            <figure className="overflow-hidden rounded-[var(--ds-radius)] border border-[var(--ds-rule)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
