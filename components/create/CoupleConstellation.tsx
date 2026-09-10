"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The moment a wedding gets its two names.
 *
 * Two small constellations draw themselves, one for each name, and then a
 * line of light joins them — which is the whole idea said without saying it.
 * It plays once per draft (the `celebrated` flag), because a delight that
 * repeats every time someone steps backwards has become a loading screen.
 *
 * Everything is a fixed SVG with CSS animations rather than a canvas: the
 * shape is the same every time, so there is nothing to compute per frame, and
 * a reduced-motion visitor can be handed the finished picture instead of a
 * fast-forwarded one.
 */

/** Each cluster: star positions, and which of them are joined. */
const LEFT = [
  [46, 104],
  [68, 68],
  [94, 94],
  [72, 134],
  [110, 126],
] as const;

const RIGHT = [
  [214, 94],
  [238, 62],
  [268, 88],
  [274, 128],
  [238, 136],
] as const;

const EDGES = [
  [1, 0],
  [0, 3],
  [3, 4],
  [4, 2],
  [2, 1],
] as const;

/** Scattered dust, so the field is a sky rather than two diagrams. */
const DUST = [
  [24, 44], [136, 34], [178, 150], [300, 52], [160, 176],
  [58, 168], [292, 158], [122, 62], [196, 40], [252, 172],
] as const;

const RUN_MS = 3000;
const REDUCED_MS = 1500;

function Cluster({ stars, side }: { stars: readonly (readonly [number, number])[]; side: 0 | 1 }) {
  // The two clusters are offset so they do not draw in lockstep, which would
  // read as one animation mirrored rather than two constellations appearing.
  const base = side === 0 ? 0 : 0.22;
  return (
    <g>
      {EDGES.map(([a, b], i) => (
        <line
          key={`e${i}`}
          className="cn-line"
          x1={stars[a][0]}
          y1={stars[a][1]}
          x2={stars[b][0]}
          y2={stars[b][1]}
          pathLength={1}
          style={{ animationDelay: `${base + 0.5 + i * 0.09}s` }}
        />
      ))}
      {stars.map(([x, y], i) => (
        <g key={`s${i}`} className="cn-star" style={{ animationDelay: `${base + i * 0.1}s` }}>
          <circle cx={x} cy={y} r={2.4} />
          <circle className="cn-halo" cx={x} cy={y} r={6} />
        </g>
      ))}
    </g>
  );
}

export function CoupleConstellation({
  groom,
  bride,
  onDone,
}: {
  groom: string;
  bride: string;
  onDone: () => void;
}) {
  const [reduced, setReduced] = useState(false);
  // Portalled to <body>: .wz-body-wrap opens its own stacking context, so no
  // z-index declared inside it can reach past the bar above. A moment that has
  // the page's chrome sitting on top of it is not a moment.
  const [mounted, setMounted] = useState(false);
  // onDone is called from a timer; keeping it in a ref means a re-render with a
  // new closure cannot restart the clock partway through.
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const quiet = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(quiet);
    setMounted(true);
    const timer = setTimeout(() => done.current(), quiet ? REDUCED_MS : RUN_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && done.current();
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    /* A tap anywhere skips it. Nobody should have to watch three seconds of
       anything twice, and the second time through is exactly when they will. */
    <div
      className="cn"
      data-quiet={reduced ? "" : undefined}
      role="status"
      aria-live="polite"
      onClick={() => done.current()}
    >
      <div className="cn-in">
        <svg viewBox="0 0 320 200" className="cn-sky" aria-hidden="true">
          {DUST.map(([x, y], i) => (
            <circle
              key={`d${i}`}
              className="cn-dust"
              cx={x}
              cy={y}
              r={1}
              style={{ animationDelay: `${i * 0.13}s` }}
            />
          ))}

          <Cluster stars={LEFT} side={0} />
          <Cluster stars={RIGHT} side={1} />

          {/* The join. It draws last, and it is the only curve on screen. */}
          <path
            className="cn-bridge"
            d="M94 94 Q160 66 214 94"
            pathLength={1}
            fill="none"
          />
        </svg>

        <p className="cn-names">
          {groom}
          <i>&amp;</i>
          {bride}
        </p>
        <p className="cn-say">Written in the stars</p>
        <p className="cn-sub">Some people are simply a perfect match.</p>
      </div>
    </div>,
    document.body,
  );
}
