"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function remaining(target: Date): Parts | null {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

/**
 * Starts empty and fills in after mount. The server and the guest's phone are
 * in different instants, so rendering a countdown during SSR guarantees a
 * hydration mismatch.
 */
export function Countdown({ target }: { target: Date }) {
  const [parts, setParts] = useState<Parts | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParts(remaining(target));
    const id = setInterval(() => setParts(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!mounted) {
    return <div className="h-[76px]" aria-hidden="true" />;
  }

  if (!parts) {
    return (
      <p className="text-sm uppercase tracking-[0.3em] text-[var(--ds-ink-muted)]">
        The celebration has begun
      </p>
    );
  }

  const cells: [number, string][] = [
    [parts.days, "Days"],
    [parts.hours, "Hours"],
    [parts.minutes, "Minutes"],
    [parts.seconds, "Seconds"],
  ];

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-5">
      {cells.map(([value, label]) => (
        <div key={label} className="min-w-[62px] text-center">
          <div
            className="rounded-[var(--ds-radius)] border border-[var(--ds-accent-line)] bg-[var(--ds-accent-soft)] px-2 py-3 font-[family-name:var(--ds-font-display)] text-2xl tabular-nums text-[var(--ds-ink)] sm:text-3xl"
            // Seconds change every tick; announcing that to a screen reader
            // would be constant noise.
            aria-hidden={label === "Seconds"}
          >
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[var(--ds-ink-muted)]">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
