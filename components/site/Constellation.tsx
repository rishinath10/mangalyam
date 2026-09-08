"use client";

import { useEffect, useRef, useState } from "react";
import { buildReading, type StarReading } from "@/lib/starsign";

/**
 * The landing page's "reveal your stars" moment. A birth date (and, if given,
 * a time) resolves to a sign built from Malaysian Indian celebration objects
 * — a temple bell, a kalasam, a jasmine strand — rather than the usual zodiac
 * glyphs, then draws it as a small constellation.
 *
 * Deliberately not real astrology, and the copy says so out loud: this is a
 * delight mechanic for the landing page, not a claim about anyone's future.
 * Nothing here is sent anywhere — the reading is computed and drawn entirely
 * in the browser, which is also why there is no loading state to design for.
 */
export function Constellation() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reading, setReading] = useState<StarReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  function reveal(e: React.FormEvent) {
    e.preventDefault();
    const result = buildReading(date, time || null);
    if (!result) {
      setError("That date doesn’t look complete yet.");
      return;
    }
    setError(null);
    setReading(result);
  }

  // Draws the sign's line art once a reading exists. Stars pop in one at a
  // time, then the connecting strokes, then everything settles into a slow
  // twinkle — skipped entirely under reduced motion, which just draws the
  // finished shape on the first frame instead of animating toward it.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !reading) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const points = reading.sign.art.flat();
    const toXY = ([x, y]: readonly [number, number]) => [
      size / 2 + (x / 100) * (size * 0.36),
      size / 2 + (y / 100) * (size * 0.36),
    ] as const;

    const start = performance.now();
    const starDuration = reduced ? 0 : 900;
    const lineDuration = reduced ? 0 : 1100;
    const lineStart = reduced ? 0 : 500;

    const draw = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, size, size);

      // Strokes: each one draws in over `lineDuration`, offset by its index
      // so multi-part shapes (the lamp's flame, the scale's two pans) arrive
      // in a sequence rather than all at once.
      reading.sign.art.forEach((stroke, si) => {
        if (stroke.length < 2) return;
        const segStart = lineStart + si * 140;
        const p = Math.max(0, Math.min(1, (t - segStart) / lineDuration));
        if (p <= 0) return;
        const segments = stroke.length - 1;
        const drawn = p * segments;
        ctx.strokeStyle = reading.sign.color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        for (let i = 0; i < Math.ceil(drawn); i++) {
          const a = toXY(stroke[i]);
          const bIdx = Math.min(i + 1, segments);
          const b = toXY(stroke[bIdx]);
          const segP = Math.min(1, drawn - i);
          const bx = a[0] + (b[0] - a[0]) * segP;
          const by = a[1] + (b[1] - a[1]) * segP;
          if (i === 0) ctx.moveTo(a[0], a[1]);
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
      });

      // Stars: pop in with a quick overshoot, then twinkle gently forever.
      points.forEach(([x, y], i) => {
        const delay = i * 70;
        const p = Math.max(0, Math.min(1, (t - delay) / starDuration));
        if (p <= 0) return;
        const pos = toXY([x, y]);
        const pop = p < 1 ? Math.sin(p * Math.PI * 0.5) : 1;
        const twinkle = p >= 1 ? 0.75 + Math.sin(t / 480 + i) * 0.25 : 1;
        const r = (1.6 + (i % 3) * 0.5) * pop;
        ctx.globalAlpha = pop * twinkle;
        ctx.fillStyle = reading.sign.color;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = pop * twinkle * 0.35;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      if (!reduced) rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reading]);

  return (
    <div className="bento">
      <div className="t t--lift rv c5 star-form">
        <p className="kick">Just for fun</p>
        <h3 style={{ marginTop: ".5rem" }}>What does the sky say about you?</h3>
        <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".5rem" }}>
          Not a real reading — just a nice touch. Enter a birthday and we&rsquo;ll
          find your sign among the things every celebration needs.
        </p>

        <form onSubmit={reveal} style={{ marginTop: "1.4rem", display: "grid", gap: "1rem" }}>
          <div className="field">
            <label htmlFor="star-date">Birth date</label>
            <input
              id="star-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="field">
            <label htmlFor="star-time">Birth time (optional)</label>
            <input
              id="star-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          {error && (
            <p className="notice notice-bad" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-gold" style={{ justifySelf: "start" }}>
            Reveal my stars
          </button>
        </form>
      </div>

      <div className="t t--2 c7 star-stage">
        <canvas ref={canvasRef} className="star-canvas" aria-hidden="true" />
        <div className="star-result" aria-live="polite">
          {reading ? (
            <>
              <p className="kick" style={{ color: reading.sign.color }}>
                {reading.sign.name} <span className="dim">· {reading.sign.range}</span>
              </p>
              <h3 style={{ marginTop: ".5rem" }}>Marked by {reading.sign.motif}</h3>
              <p className="muted" style={{ marginTop: ".6rem" }}>
                {reading.sign.meaning} — you&rsquo;re {reading.sign.traits[0]}, and{" "}
                {reading.sign.traits[1]}.
              </p>
              <p className="muted" style={{ marginTop: ".8rem" }}>{reading.timeLine}</p>
            </>
          ) : (
            <p className="dim star-placeholder">
              Your constellation appears here once you&rsquo;ve told us when to look for it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
