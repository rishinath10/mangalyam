"use client";

import { useEffect, useRef, useState } from "react";
import { ConstellationFigure } from "@/components/stars/ConstellationFigure";
import { RAASIS, starNames } from "@/lib/birthstar";
import { splitHostNames } from "@/lib/format";
import type { SectionProps } from "@/components/templates/sections/types";

/**
 * The birth stars, when the host has chosen to show them.
 *
 * A window of night sky in the middle of the invitation: each person's raasi
 * draws itself as a constellation, and for a couple a thread of light then
 * joins the two. For a naming ceremony or a sixtieth — both timed by the
 * birth star — it is the one figure, larger.
 *
 * The sky is always dark, whatever the design around it, because stars on
 * cream paper are not stars. Its colours are fixed here for that reason
 * rather than taken from the design's tokens.
 *
 * Drawing waits until the section is actually on screen: the animation is the
 * point, and one that has already finished below the fold has no point.
 */
export function Stars({ invitation }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  const entries = (invitation.stars ?? []).filter((s) => s !== null);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  if (entries.length === 0) return null;

  const [first, second] = splitHostNames(invitation.couple.hostNames);
  const names = [first, second];
  // Names are matched to stars by position, so a star given only for the
  // second name still sits under the second name.
  const people = (invitation.stars ?? [])
    .map((entry, i) => (entry ? { entry, name: second ? names[i] : null } : null))
    .filter((p) => p !== null);
  const pair = people.length === 2;

  return (
    <section className="inv-stars" aria-labelledby="stars-heading">
      <div className="inv-stars-sky" ref={ref} data-pair={pair || undefined} data-seen={seen || undefined}>
        <p className="inv-stars-kicker">{pair ? "Two stars, one sky" : "Born under"}</p>
        <h2 id="stars-heading" className="sr-only">
          Birth stars
        </h2>

        <div className="inv-stars-row">
          {people.map(({ entry, name }, i) => {
            const star = starNames(entry.star);
            const raasi = RAASIS[entry.raasi];
            return (
              <figure key={i} className="inv-stars-one">
                <ConstellationFigure
                  raasi={entry.raasi}
                  drawn={seen}
                  color="#EBD79B"
                  title={`The constellation of ${raasi.tamil}, ${raasi.western}`}
                />
                <figcaption>
                  {name && <span className="inv-stars-who">{name}</span>}
                  <b>{star.tamil}</b>
                  <span className="inv-stars-raasi">
                    {raasi.tamil} · {raasi.western}
                  </span>
                </figcaption>
              </figure>
            );
          })}
          {pair && <span className="inv-stars-thread" aria-hidden="true" />}
        </div>
      </div>
    </section>
  );
}
