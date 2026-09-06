import type { SVGProps } from "react";

/** Peacock silhouette with a fanned tail. */
export function Peacock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" {...props}>
      <path
        d="M52 30c0-7-5-12-11-12s-11 5-11 12c0 5 3 9 7 11-6 4-10 11-10 19 0 12 9 21 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M30 22 22 18m8 8-9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M41 14v-5m-5 6-3-5m13 5 3-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {Array.from({ length: 5 }, (_, i) => {
        const angle = -50 + i * 25;
        return (
          <g key={i} transform={`rotate(${angle} 48 62)`}>
            <path d="M48 62 48 20" stroke="currentColor" strokeWidth="1.4" opacity="0.75" />
            <ellipse cx="48" cy="18" rx="5" ry="7" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="48" cy="18" r="2" fill="currentColor" opacity="0.8" />
          </g>
        );
      })}
    </svg>
  );
}
