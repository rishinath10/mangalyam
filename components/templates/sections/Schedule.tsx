"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StaggerItem, StaggerList, ScrollReveal } from "@/components/motion/primitives";
import { formatTime } from "@/lib/format";
import { alignClasses, type SectionProps } from "@/components/templates/sections/types";

export function Schedule({ invitation, align }: SectionProps) {
  const { schedule } = invitation;
  const reduce = useReducedMotion();
  if (schedule.length === 0) return null;
  const a = alignClasses(align);

  return (
    <section className="px-6 py-16" aria-labelledby="schedule-heading">
      <ScrollReveal className={a.text}>
        <h2
          id="schedule-heading"
          className="text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          Order of the day
        </h2>
      </ScrollReveal>

      {/* The <ol> is the stagger parent itself, so the <li>s stay its direct
          children — the list reads as a list, and last:pb-0 means the last
          entry rather than every entry. */}
      <div className={`relative mt-10 max-w-md ${a.block}`}>
        {/* The thread the day hangs on, drawn downward as it scrolls into
            view. A sibling of the list rather than its border, so it can be
            animated without the list items animating with it. */}
        <motion.span
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 w-px origin-top bg-[var(--ds-rule)]"
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
        />
      <StaggerList as="ol" className="relative pl-8">
        {schedule.map((item, i) => (
          <StaggerItem as="li" key={`${item.time}-${i}`} className="relative pb-9 last:pb-0">
            <span
              className="absolute -left-[37px] top-1.5 h-[9px] w-[9px] rounded-full border border-[var(--ds-accent)] bg-[var(--ds-surface)]"
              aria-hidden="true"
            />
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ds-accent)]">
              {formatTime(item.time)}
            </p>
            <p className="mt-1.5 font-[family-name:var(--ds-font-display)] text-lg text-[var(--ds-ink)]">
              {item.title}
            </p>
            {item.description && (
              <p className="mt-1 text-sm leading-relaxed text-[var(--ds-ink-muted)]">
                {item.description}
              </p>
            )}
          </StaggerItem>
        ))}
      </StaggerList>
      </div>
    </section>
  );
}
