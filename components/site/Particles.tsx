"use client";

import { useEffect, useRef } from "react";
import { RAASI_FIGURES } from "@/lib/constellations";

type Mote = {
  x: number; y: number; r: number;
  vy: number; drift: number; a: number; t: number;
};
type Star = { x: number; y: number; r: number; a: number; t: number; speed: number };
/** One raasi being drawn somewhere in the sky, then left to fade. */
type Sketch = { figure: number; x: number; y: number; size: number; born: number };

/** How long a constellation takes to draw, hold, and fade, in milliseconds. */
const DRAW_MS = 3200;
const HOLD_MS = 3600;
const FADE_MS = 2400;
/** The quiet between one constellation and the next. */
const REST_MS = 2600;

/**
 * The sky behind the dark sections: fixed stars that twinkle, gold dust that
 * drifts upward, and every so often one of the twelve raasi drawing itself
 * somewhere, line by line, before it fades.
 *
 * One canvas for the whole page. The counts scale with the viewport so a
 * phone does less work, only one constellation is ever on screen, and the
 * loop stops entirely when the tab is hidden — an animation nobody is looking
 * at should not be draining a battery. Under reduced motion nothing runs.
 */
export function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf: number | null = null;
    const motes: Mote[] = [];
    const stars: Star[] = [];
    let sketch: Sketch | null = null;
    let nextSketchAt = performance.now() + 1800;
    let lastFigure = -1;

    const spawn = (y: number): Mote => ({
      x: Math.random() * w,
      y,
      r: Math.random() * 1.7 + 0.5,
      vy: -(Math.random() * 0.22 + 0.05),
      drift: (Math.random() - 0.5) * 0.16,
      a: Math.random() * 0.5 + 0.18,
      t: Math.random() * 6.28,
    });

    const size = () => {
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const wantMotes = Math.round(Math.min(48, (w * h) / 38000));
      while (motes.length < wantMotes) motes.push(spawn(Math.random() * h));
      motes.length = wantMotes;

      const wantStars = Math.round(Math.min(110, (w * h) / 12000));
      stars.length = 0;
      for (let i = 0; i < wantStars; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 0.9 + 0.3,
          a: Math.random() * 0.45 + 0.12,
          t: Math.random() * 6.28,
          speed: Math.random() * 0.02 + 0.006,
        });
      }
    };

    /** Somewhere new, a different figure from last time, sized to the screen. */
    const beginSketch = (now: number) => {
      let figure = Math.floor(Math.random() * RAASI_FIGURES.length);
      if (figure === lastFigure) figure = (figure + 1) % RAASI_FIGURES.length;
      lastFigure = figure;
      const s = Math.min(Math.max(w, h) * 0.22, 260);
      sketch = {
        figure,
        size: s,
        x: Math.random() * Math.max(1, w - s * 1.2) + s * 0.1,
        y: Math.random() * Math.max(1, h - s * 1.2) + s * 0.1,
        born: now,
      };
    };

    const drawSketch = (now: number) => {
      if (!sketch) return;
      const age = now - sketch.born;
      const total = DRAW_MS + HOLD_MS + FADE_MS;
      if (age > total) {
        sketch = null;
        nextSketchAt = now + REST_MS;
        return;
      }
      const figure = RAASI_FIGURES[sketch.figure];
      const fade = age > DRAW_MS + HOLD_MS ? 1 - (age - DRAW_MS - HOLD_MS) / FADE_MS : 1;
      const progress = Math.min(1, age / DRAW_MS) * figure.lines.length;
      const at = (i: number) => [
        sketch!.x + (figure.stars[i][0] / 100) * sketch!.size,
        sketch!.y + (figure.stars[i][1] / 100) * sketch!.size,
      ] as const;

      ctx.strokeStyle = "#EBD79B";
      ctx.lineWidth = 0.8;
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.34 * fade;
      ctx.beginPath();
      figure.lines.forEach(([a, b], i) => {
        const p = Math.max(0, Math.min(1, progress - i));
        if (p <= 0) return;
        const [ax, ay] = at(a);
        const [bx, by] = at(b);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (bx - ax) * p, ay + (by - ay) * p);
      });
      ctx.stroke();

      // A star appears once the first line to reach it has started.
      ctx.fillStyle = "#F6ECCB";
      figure.stars.forEach(([, , mag], i) => {
        const first = figure.lines.findIndex(([a, b]) => a === i || b === i);
        if (first === -1 || progress < first) return;
        const [x, y] = at(i);
        ctx.globalAlpha = 0.75 * fade;
        ctx.beginPath();
        ctx.arc(x, y, 2.4 - mag * 0.5, 0, 6.283);
        ctx.fill();
        ctx.globalAlpha = 0.1 * fade;
        ctx.beginPath();
        ctx.arc(x, y, (4 - mag) * 2.6, 0, 6.283);
        ctx.fill();
      });
    };

    const frame = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#FFFFFF";
      for (const s of stars) {
        s.t += s.speed;
        ctx.globalAlpha = s.a * (0.55 + Math.sin(s.t) * 0.45);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.283);
        ctx.fill();
      }

      if (!sketch && now >= nextSketchAt) beginSketch(now);
      drawSketch(now);

      ctx.fillStyle = "#D9BC63";
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.y += m.vy;
        m.x += m.drift + Math.sin(m.t) * 0.14;
        m.t += 0.01;
        if (m.y < -12) { motes[i] = spawn(h + 12); continue; }
        ctx.globalAlpha = m.a * (0.6 + Math.sin(m.t * 1.7) * 0.4);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const start = () => { if (raf === null) raf = requestAnimationFrame(frame); };
    const stop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };
    const onVis = () => (document.hidden ? stop() : start());

    size();
    addEventListener("resize", size);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      removeEventListener("resize", size);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
