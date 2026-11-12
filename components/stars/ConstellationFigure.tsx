import { RAASI_FIGURES } from "@/lib/constellations";

/**
 * One raasi, drawn as a constellation that draws itself.
 *
 * An SVG with CSS doing the animating: each line is a stroke whose dash is
 * pulled back to nothing, one after another in the order the figure is
 * listed, and each star arrives just as the line reaches it. Nothing is
 * computed per frame, so twelve of these on a page cost what twelve images
 * would — and under reduced motion the finished figure is simply shown.
 *
 * It draws when `drawn` is true. A caller that wants it to wait — until it
 * scrolls into view, until a form is submitted — holds that flag back.
 */
export function ConstellationFigure({
  raasi,
  drawn = true,
  color = "currentColor",
  className,
  title,
}: {
  /** 0–11, Mesham first. */
  raasi: number;
  drawn?: boolean;
  color?: string;
  className?: string;
  /** Read aloud in place of the figure; without one it is decorative. */
  title?: string;
}) {
  const figure = RAASI_FIGURES[raasi] ?? RAASI_FIGURES[0];
  // The moment each star is first touched by a line, so it can appear then.
  const reached = new Map<number, number>();
  figure.lines.forEach(([a, b], i) => {
    if (!reached.has(a)) reached.set(a, i);
    if (!reached.has(b)) reached.set(b, i + 0.6);
  });

  return (
    <svg
      viewBox="0 0 100 100"
      className={`cst ${className ?? ""}`}
      data-drawn={drawn || undefined}
      style={{ color }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {figure.lines.map(([a, b], i) => (
        <line
          key={`l${i}`}
          className="cst-line"
          x1={figure.stars[a][0]}
          y1={figure.stars[a][1]}
          x2={figure.stars[b][0]}
          y2={figure.stars[b][1]}
          pathLength={1}
          style={{ "--i": i } as React.CSSProperties}
        />
      ))}
      {figure.stars.map(([x, y, mag], i) => (
        <g
          key={`s${i}`}
          className="cst-star"
          style={{ "--i": reached.get(i) ?? i, transformOrigin: `${x}px ${y}px` } as React.CSSProperties}
        >
          <circle cx={x} cy={y} r={(4 - mag) * 2.1} className="cst-halo" />
          <circle cx={x} cy={y} r={2.1 - mag * 0.45} className="cst-core" />
        </g>
      ))}
    </svg>
  );
}
