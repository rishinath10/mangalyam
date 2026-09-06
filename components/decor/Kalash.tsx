import type { SVGProps } from "react";

/** Kalash (sacred pot with coconut and mango leaves). */
export function Kalash(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 80" fill="none" aria-hidden="true" {...props}>
      <ellipse cx="32" cy="19" rx="9" ry="11" stroke="currentColor" strokeWidth="2" />
      <path
        d="M32 30c-6 0-11-3-14-8m14 8c6 0 11-3 14-8M18 22c-4-4-9-5-14-4 3 6 8 9 14 8Zm28 0c4-4 9-5 14-4-3 6-8 9-14 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M16 34h32l-3 6H19z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M19 40c-6 6-9 13-9 21 0 9 10 15 22 15s22-6 22-15c0-8-3-15-9-21"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M14 56h36" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
    </svg>
  );
}
