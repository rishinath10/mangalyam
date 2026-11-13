"use client";

import { Mascot } from "@/components/mascot/Mascot";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ConstellationFigure } from "@/components/stars/ConstellationFigure";
import {
  BIRTH_PLACES,
  RAASIS,
  STAR_LORE,
  birthStar,
  starNames,
  type BirthPlaceId,
  type BirthStar,
  type StarPosition,
} from "@/lib/birthstar";

/** Raasi shown one after another while the stage is waiting for a birthday. */
const IDLE_CYCLE_MS = 5200;

function describe(position: StarPosition) {
  const names = starNames(position.star);
  return { ...names, raasi: RAASIS[position.raasi], lore: STAR_LORE[position.star] };
}

/**
 * Find your natchathiram: a birth date, optionally a time, and where the
 * clock was set, resolved to the birth star and moon sign and drawn as the
 * constellation the Moon stood in.
 *
 * It is a real calculation (lib/birthstar.ts), and the copy is careful to say
 * what kind: where the Moon was, not what that means for anyone. Everything
 * happens in the browser — a birthday is not something this page has any
 * business sending to a server, and it does not.
 */
export function BirthStarFinder() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState<BirthPlaceId>("my");
  const [result, setResult] = useState<BirthStar | null>(null);
  // Bumped on every reveal so the figure redraws even for the same raasi.
  const [drawing, setDrawing] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [idle, setIdle] = useState(0);
  const [shared, setShared] = useState(false);
  const [today, setToday] = useState<string | undefined>(undefined);

  // The newest allowed birthday is today, and "today" is only known in the
  // browser; computing it during render would disagree with the server.
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  // Until someone asks, the stage walks through the twelve signs so it is a
  // sky rather than an empty box.
  useEffect(() => {
    if (result) return;
    const id = setInterval(() => setIdle((i) => (i + 1) % 12), IDLE_CYCLE_MS);
    return () => clearInterval(id);
  }, [result]);

  function reveal(e: React.FormEvent) {
    e.preventDefault();
    const found = birthStar(date, time || null, place);
    if (!found) {
      setError("That date doesn’t look complete yet.");
      return;
    }
    setError(null);
    setShared(false);
    setResult(found);
    setDrawing((n) => n + 1);
  }

  const main = result ? describe(result.position) : null;
  const other = result?.alternative ? describe(result.alternative) : null;

  async function share() {
    if (!main) return;
    const text = `My natchathiram is ${main.tamil} (${main.sanskrit}), and my raasi is ${main.raasi.tamil}. Find yours:`;
    const url = `${location.origin}/#stars`;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
    } catch {
      // Dismissing the share sheet is not an error worth reporting.
    }
  }

  return (
    <div className="bento">
      <div className="t t--lift rv c5 star-form">
        <Mascot pose="think" height={112} className="star-mascot" />
        <p className="kick">Natchathiram and raasi</p>
        <h3 style={{ marginTop: ".5rem" }}>Which star were you born under?</h3>
        <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".5rem" }}>
          Your birth star is where the Moon stood at the moment you were born. Tell
          us when, and we will work it out and draw the constellation.
        </p>

        <form onSubmit={reveal} style={{ marginTop: "1.4rem", display: "grid", gap: "1rem" }}>
          <div className="field">
            <label htmlFor="star-date">Birth date</label>
            <input
              id="star-date"
              type="date"
              required
              value={date}
              min="1900-01-01"
              max={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="star-row">
            <div className="field">
              <label htmlFor="star-time">Birth time, if you know it</label>
              <input
                id="star-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="star-place">Born in</label>
              <select
                id="star-place"
                value={place}
                onChange={(e) => setPlace(e.target.value as BirthPlaceId)}
              >
                {BIRTH_PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="notice notice-bad" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-gold" style={{ justifySelf: "start" }}>
            Find my star
          </button>
          <p className="dim" style={{ fontSize: "var(--t-xs)" }}>
            Worked out on your own device. Your birthday is never sent to us.
          </p>
        </form>
      </div>

      <div className="t t--2 c7 star-stage" data-found={result ? "" : undefined}>
        <div className="star-sky">
          <ConstellationFigure
            // A new key restarts the drawing: the animation is CSS, so the
            // only way to replay it is to mount a fresh element.
            key={result ? `r${drawing}` : `i${idle}`}
            raasi={result ? result.position.raasi : idle}
            color={result ? "var(--gold-lt)" : "rgba(235,215,155,.55)"}
            title={
              main
                ? `The constellation of ${main.raasi.tamil}, ${main.raasi.western}`
                : undefined
            }
          />
          {!result && <span className="star-sky-name">{RAASIS[idle].tamil}</span>}
        </div>

        <div className="star-result" aria-live="polite">
          {main && result ? (
            <>
              <p className="kick">Your natchathiram</p>
              <h3 className="star-name">
                {main.tamil}
                <span>
                  {main.sanskrit} · pada {result.position.pada}
                </span>
              </h3>
              <p className="star-raasi">
                Raasi <b>{main.raasi.tamil}</b>
                <span>
                  {main.raasi.sanskrit} · {main.raasi.western}
                </span>
              </p>

              <dl className="star-facts">
                <div>
                  <dt>Emblem</dt>
                  <dd>{main.lore.symbol}</dd>
                </div>
                <div>
                  <dt>Deity</dt>
                  <dd>{main.lore.deity}</dd>
                </div>
                <div>
                  <dt>Graha</dt>
                  <dd>{main.lore.ruler}</dd>
                </div>
              </dl>

              {other && result.doubt === "no-time" && (
                <p className="star-doubt">
                  The Moon moved from one star to the next that day, so it could also be{" "}
                  <b>{other.tamil}</b> ({other.sanskrit}). Add the birth time to settle it.
                </p>
              )}
              {other && result.doubt === "near-boundary" && (
                <p className="star-doubt">
                  The Moon was within an hour of the line between this star and{" "}
                  <b>{other.tamil}</b> ({other.sanskrit}). A few minutes either way in the
                  birth time decides it — your family&rsquo;s own chart is the one to trust.
                </p>
              )}

              <div className="star-actions">
                <Link className="btn btn-gold btn-sm" href="/create">
                  Put it on an invitation
                </Link>
                <button type="button" className="btn btn-line btn-sm" onClick={share}>
                  {shared ? "Shared" : "Share"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="kick">The twelve raasi</p>
              <p className="dim star-placeholder">
                Twenty-seven stars and twelve signs, each a stretch of the sky the Moon
                crosses every month. Yours is the one it was in when you arrived.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
