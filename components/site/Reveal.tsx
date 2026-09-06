"use client";

import { useEffect } from "react";

/**
 * Adds the reveal class from JS rather than in the stylesheet, so a page with
 * JavaScript disabled shows every tile instead of a screen of invisible ones.
 * A timeout backstop guarantees nothing stays hidden if the observer misfires.
 */
export function Reveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("reveal-on");
    const tiles = Array.from(document.querySelectorAll<HTMLElement>(".rv"));

    tiles.forEach((el) => {
      const d = el.dataset.delay;
      if (d) el.style.transitionDelay = `${d}ms`;
    });

    const show = (el: Element) => el.classList.add("in");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    tiles.forEach((el) => io.observe(el));

    // anything already on screen appears immediately, not on a scroll
    const raf = requestAnimationFrame(() => {
      tiles.forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight) show(el);
      });
    });
    const backstop = setTimeout(() => tiles.forEach(show), 3000);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(backstop);
      root.classList.remove("reveal-on");
    };
  }, []);

  return null;
}
