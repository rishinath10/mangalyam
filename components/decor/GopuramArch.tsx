import type { SVGProps } from "react";

/**
 * Temple arch used as a cover frame.
 *
 * Deliberately just the silhouette and finial: the tiered gopuram face this
 * replaced put horizontal rules straight across the couple's names, and
 * stretching it to fill a cover distorted every tier. On a cover this is a
 * frame, not a facade — so it stays a frame.
 */
export function GopuramArch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 260" fill="none" aria-hidden="true" preserveAspectRatio="none" {...props}>
      <path d="M6 260V96a94 94 0 0 1 188 0v164" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 260V98a84 84 0 0 1 168 0v162" stroke="currentColor" strokeWidth=".7" opacity=".65" />
      <path d="M100 8v14M93 22h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The full tiered tower, for places that want the facade rather than a frame —
 * it needs its own aspect ratio, so it never stretches.
 */
export function GopuramTower(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 260" fill="none" aria-hidden="true" {...props}>
      <path
        d="M100 20c14 0 22 10 22 22 0 10-5 17-12 22 12 6 20 17 20 32v14H70v-14c0-15 8-26 20-32-7-5-12-12-12-22 0-12 8-22 22-22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M46 110h108v18H46zM34 128h132v20H34zM22 148h156v22H22zM10 170h180v88H10z" stroke="currentColor" strokeWidth="2" />
      <path d="M28 258V186a72 72 0 0 1 144 0v72" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
