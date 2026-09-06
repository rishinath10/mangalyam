import type { SVGProps } from "react";

/**
 * Quarter mandala for framing corners. Rotate with a CSS transform to reuse the
 * same component on all four corners.
 */
export function MandalaCorner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      {[28, 46, 64, 82, 100].map((r, i) => (
        <path
          key={r}
          d={`M0 ${r}A${r} ${r} 0 0 0 ${r} 0`}
          stroke="currentColor"
          strokeWidth={i % 2 ? 1 : 1.6}
          opacity={1 - i * 0.13}
        />
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (Math.PI / 2) * (i / 6);
        return (
          <line
            key={i}
            x1={Math.cos(a) * 26}
            y1={Math.sin(a) * 26}
            x2={Math.cos(a) * 100}
            y2={Math.sin(a) * 100}
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.5"
          />
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 2) * ((i + 0.5) / 6);
        return (
          <circle
            key={i}
            cx={Math.cos(a) * 73}
            cy={Math.sin(a) * 73}
            r="3.2"
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}
