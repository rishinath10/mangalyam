import type { SVGProps } from "react";

/**
 * Repeating kolam lattice rendered as a tiling SVG pattern, so one instance
 * stretches to any width without distorting the motif.
 */
export function KolamBorder({
  id = "kolam",
  ...props
}: SVGProps<SVGSVGElement> & { id?: string }) {
  return (
    <svg viewBox="0 0 240 24" fill="none" aria-hidden="true" {...props}>
      <defs>
        <pattern id={id} width="40" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M20 3 32 12 20 21 8 12Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.1" />
          <path d="M0 12h8M32 12h8" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="0" cy="12" r="1.4" fill="currentColor" />
          <circle cx="40" cy="12" r="1.4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="240" height="24" fill={`url(#${id})`} />
    </svg>
  );
}
