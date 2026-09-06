import type { SVGProps } from "react";

/**
 * Jasmine/marigold swag used as a section divider. Two flower sizes alternate
 * along a shallow catenary so it reads as a hung garland, not a dotted line.
 */
export function Garland(props: SVGProps<SVGSVGElement>) {
  const flowers = Array.from({ length: 21 }, (_, i) => {
    const t = i / 20;
    const x = 10 + t * 280;
    const y = 8 + Math.sin(Math.PI * t) * 22;
    return { x, y, r: i % 2 === 0 ? 4.6 : 2.8 };
  });

  return (
    <svg viewBox="0 0 300 40" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 8Q150 44 290 8"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.5"
      />
      {flowers.map((f, i) => (
        <circle
          key={i}
          cx={f.x}
          cy={f.y}
          r={f.r}
          fill={i % 2 === 0 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.1"
          opacity={i % 2 === 0 ? 0.85 : 1}
        />
      ))}
    </svg>
  );
}
