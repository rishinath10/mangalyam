"use client";

import { useEffect, useRef } from "react";

type Mote = {
  x: number; y: number; r: number;
  vy: number; drift: number; a: number; t: number;
};

/**
 * Gold dust behind the dark sections. The count scales with the viewport so a
 * phone does less work, and the loop stops entirely when the tab is hidden —
 * an animation nobody is looking at should not be draining a battery.
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
      const want = Math.round(Math.min(72, (w * h) / 26000));
      while (motes.length < want) motes.push(spawn(Math.random() * h));
      motes.length = want;
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
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
