/* eslint-disable @next/next/no-img-element */

/**
 * The rule between sections. Falls back to a plain hairline when the family
 * has no artwork for it, so a half-finished art set still reads as designed
 * rather than as broken.
 */
export function Divider({ src, className }: { src?: string; className?: string }) {
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={`mx-auto block h-px w-24 bg-[var(--ds-accent)] opacity-50 ${className ?? ""}`}
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`mx-auto block ${className ?? ""}`}
      style={{ width: "min(230px, 62%)", height: "auto" }}
    />
  );
}
