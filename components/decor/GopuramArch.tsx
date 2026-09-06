import type { SVGProps } from "react";

/**
 * South Indian temple gopuram silhouette, used as the cover frame in Temple
 * Heritage. Drawn on a 200x260 grid and stroked in `currentColor` so callers
 * set the colour with a token (`text-[var(--ds-gold)]`) rather than a prop.
 */
export function GopuramArch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      {...props}
    >
      <path
        d="M100 6 106 20H94ZM100 20c14 0 22 10 22 22 0 10-5 17-12 22 12 6 20 17 20 32v14H70v-14c0-15 8-26 20-32-7-5-12-12-12-22 0-12 8-22 22-22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M46 110h108v18H46zM34 128h132v20H34zM22 148h156v22H22zM10 170h180v88H10z"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Tiered kudu niches — the repeating arch motif of a gopuram face. */}
      {[0, 1, 2].map((tier) => {
        const y = 114 + tier * 20;
        const count = 3 + tier;
        const span = 96 + tier * 24;
        const left = 100 - span / 2;
        return Array.from({ length: count }, (_, i) => (
          <path
            key={`${tier}-${i}`}
            d={`M${left + (span / count) * (i + 0.5) - 5} ${y + 12}a5 6 0 0 1 10 0`}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ));
      })}
      <path d="M28 258V186a72 72 0 0 1 144 0v72" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
