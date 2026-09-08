/**
 * Ornament for the two template families — drawn from zero for the curated
 * design system, and deliberately flat and geometric.
 *
 * The lesson that produced this set: every earlier attempt to *depict* an
 * object (a hanging lamp, a peacock, a tiered temple facade) read as clip art
 * at any size. These are architectural lines, repeats and rosettes instead —
 * abstract enough that there is nothing to look fake. Each takes `className`
 * and paints in `currentColor`, so colour comes from the design tokens.
 */

type Props = { className?: string; style?: React.CSSProperties };

/* An arch used as a full-page frame has to reach all four edges, and a phone
   screen is far taller than any arch's natural ratio. Letting it stretch is
   correct here rather than lazy: a tall pavilion arch is a real shape, whereas
   preserving the ratio letterboxes the frame and leaves the cover floating. */
type ArchProps = Props & { preserveAspectRatio?: string };

/* A run of temple triangles over a rule: zari, the border of a silk. */
const ZARI_TEETH = Array.from({ length: 20 }, (_, i) => {
  const x = i * 12;
  return `M${x} 14L${x + 6} 4L${x + 12} 14`;
}).join("");

/* A pulli kolam grid — the dots drawn before the line is ever traced. */
const KOLAM_DOTS = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => ({ cx: 12 + col * 12, cy: 12 + row * 12 })),
).flat();

/** The pavilion arch, silhouette only — no tiers, no facade. */
export function ArchLine({ className, style, preserveAspectRatio }: ArchProps) {
  return (
    <svg
      viewBox="0 0 200 260"
      fill="none"
      className={className}
      style={style}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
    >
      {/* non-scaling-stroke: without it a stretched frame draws the uprights
          hairline-thin and the crown heavy, which reads as a rendering fault. */}
      <path
        d="M12 260V116C12 60 51 14 100 14C149 14 188 60 188 116V260"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M26 260V120C26 70 59 30 100 30C141 30 174 70 174 120V260"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** A zari band. Sits under a heading or between sections. */
export function ZariBand({ className, style }: Props) {
  return (
    <svg viewBox="0 0 240 16" fill="none" className={className} style={style} aria-hidden="true">
      <path d={ZARI_TEETH} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M0 14H240" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Kolam dots, as texture behind or beside a block of type. */
export function KolamDots({ className, style }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} style={style} aria-hidden="true">
      {KOLAM_DOTS.map((d) => (
        <circle key={`${d.cx}-${d.cy}`} cx={d.cx} cy={d.cy} r="1.5" fill="currentColor" />
      ))}
    </svg>
  );
}

/** A rosette: five petals struck around a centre. The Mandapam section mark. */
export function LotusGlyph({ className, style }: Props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="24"
          cy="15"
          rx="4.5"
          ry="9.5"
          transform={`rotate(${angle} 24 24)`}
          stroke="currentColor"
          strokeWidth="1.1"
        />
      ))}
      <circle cx="24" cy="24" r="2.4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

/** A flame over a lip — the Deepam section mark, and not a drawing of a lamp. */
export function FlameGlyph({ className, style }: Props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M24 9C31 19 30 27 24 31C18 27 17 19 24 9Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M13 36H35" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 36V41" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** Two nested rails turning a corner. Frames a panel without boxing it in. */
export function CornerFret({ className, style }: Props) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} style={style} aria-hidden="true">
      <path d="M4 64V20A16 16 0 0 1 20 4H64" stroke="currentColor" strokeWidth="1.3" />
      <path d="M14 64V25A11 11 0 0 1 25 14H64" stroke="currentColor" strokeWidth="0.7" opacity="0.65" />
    </svg>
  );
}
