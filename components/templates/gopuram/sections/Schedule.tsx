"use client";

import { StaggerItem, StaggerList, ScrollReveal } from "@/components/motion/primitives";
import { formatTime } from "@/lib/format";
import type { InvitationJson } from "@/lib/invitation/types";

export function Schedule({ invitation }: { invitation: InvitationJson }) {
  const { schedule } = invitation;
  if (schedule.length === 0) return null;

  return (
    <section className="px-6 py-16" aria-labelledby="schedule-heading">
      <ScrollReveal className="text-center">
        <h2
          id="schedule-heading"
          className="text-[11px] uppercase tracking-[0.36em] text-[var(--ds-ink-muted)]"
        >
          Order of the day
        </h2>
      </ScrollReveal>

      <StaggerList className="mx-auto mt-10 max-w-md">
        <ol className="relative border-l border-[var(--ds-rule)] pl-8">
          {schedule.map((item, i) => (
            <StaggerItem key={`${item.time}-${i}`}>
              <li className="relative pb-9 last:pb-0">
                <span
                  className="absolute -left-[37px] top-1.5 h-[9px] w-[9px] rounded-full border border-[var(--ds-accent)] bg-[var(--ds-surface)]"
                  aria-hidden="true"
                />
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ds-accent)]">
                  {formatTime(item.time)}
                </p>
                <p className="mt-1.5 font-[family-name:var(--font-display)] text-lg text-[var(--ds-ink)]">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm leading-relaxed text-[var(--ds-ink-muted)]">
                    {item.description}
                  </p>
                )}
              </li>
            </StaggerItem>
          ))}
        </ol>
      </StaggerList>
    </section>
  );
}
