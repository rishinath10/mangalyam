"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActionBar } from "@/components/templates/shared/ActionBar";
import { Opening } from "@/components/templates/shared/Openings";
import type { InvitationJson } from "@/lib/invitation/types";

/** How long the longest opening animation runs before the cover is removed. */
const COVER_LIFETIME_MS = 1600;
/** Pause after the reveal so the guest sees the cover page before it drifts. */
const AUTOSCROLL_DELAY_MS = 1800;
/** Reading pace, in CSS pixels per second. Slow enough to read over. */
const AUTOSCROLL_SPEED = 26;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The element that actually scrolls. On the published page that is the window;
 * inside the builder's phone frame it is the framing div, so the drift has to
 * find its own scroller rather than assume one.
 */
function findScroller(from: HTMLElement | null): HTMLElement | null {
  for (let el = from?.parentElement; el; el = el.parentElement) {
    const overflow = getComputedStyle(el).overflowY;
    if (
      (overflow === "auto" || overflow === "scroll") &&
      el.scrollHeight > el.clientHeight + 4
    ) {
      return el;
    }
  }
  return null; // null means the window
}

/**
 * Everything that wraps a template: the cover a guest taps to open, the drift
 * down the page afterwards, the music that starts on that same tap, and the
 * action bar.
 *
 * It sits in the renderer rather than in a template so all six designs get the
 * same behaviour and rule #3 still holds — preview and published mount this
 * identical component.
 *
 * Two separate facts, because the owner previewing their own unpublished draft
 * needs one of each: `preview` says replies cannot be submitted yet, and
 * `live` says the side effects — audio, the page drifting on its own — should
 * run. Inside the builder both are off; on a published page both are on; on a
 * draft the owner opens on their phone, the drift and the music are real and
 * only the RSVP is held back.
 */
export function InvitationShell({
  invitation,
  preview = false,
  live = !preview,
  children,
}: {
  invitation: InvitationJson;
  preview?: boolean;
  live?: boolean;
  children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const musicAvailable =
    invitation.music.enabled && Boolean(invitation.music.url) && live;

  const open = useCallback(() => {
    setOpened((was) => {
      if (was) return was;
      // The tap is the user gesture browsers require before audio may start,
      // so this is the one moment music can begin without being blocked.
      const audio = audioRef.current;
      if (audio) void audio.play().catch(() => setPlaying(false));
      return true;
    });
  }, []);

  // Remove the cover once its animation has finished. The invitation stays
  // clamped to one screen until then: the cover is sized against the shell, so
  // releasing the clamp any earlier stretches it down the whole page and the
  // opening animates somewhere below the fold.
  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => setCoverGone(true), COVER_LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [opened]);

  // The drift. Any deliberate input hands control straight back to the guest.
  useEffect(() => {
    if (!opened || !live) return;
    if (!invitation.opening.autoScroll) return;
    if (prefersReducedMotion()) return;

    const scroller = findScroller(shellRef.current);
    const read = () => (scroller ? scroller.scrollTop : window.scrollY);
    const limit = () =>
      scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

    const EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

    let frame = 0;
    let previous = 0;
    let position = read();
    let cancelled = false;

    const stop = () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      for (const type of EVENTS) window.removeEventListener(type, stop);
    };

    const step = (now: number) => {
      if (cancelled) return;
      if (previous) {
        position += ((now - previous) / 1000) * AUTOSCROLL_SPEED;
        if (position >= limit()) {
          stop();
          return;
        }
        // Whole pixels only: a fractional scrollTop is rounded by the browser
        // and the leftover would be lost on every frame.
        const y = Math.round(position);
        if (scroller) scroller.scrollTop = y;
        else window.scrollTo(0, y);
      }
      previous = now;
      frame = requestAnimationFrame(step);
    };

    const begin = setTimeout(() => {
      position = read();
      for (const type of EVENTS) {
        window.addEventListener(type, stop, { passive: true, once: true });
      }
      frame = requestAnimationFrame(step);
    }, AUTOSCROLL_DELAY_MS);

    return () => {
      clearTimeout(begin);
      stop();
    };
  }, [opened, live, invitation.opening.autoScroll]);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }

  return (
    <div
      className="inv-shell"
      ref={shellRef}
      data-open={opened || undefined}
      data-revealed={coverGone || undefined}
      data-preview={preview || undefined}
    >
      {/* Closed, the invitation is inert: it is behind a full-screen cover, so
          it must not be reachable by keyboard or announced underneath it. */}
      <div className="inv-stage" inert={!opened}>
        {children}
      </div>

      {coverGone && (
        <ActionBar
          invitation={invitation}
          musicAvailable={musicAvailable}
          playing={playing}
          onToggleMusic={toggleMusic}
        />
      )}

      {!coverGone && <Opening invitation={invitation} open={opened} onOpen={open} />}

      {musicAvailable && (
        <audio
          ref={audioRef}
          src={invitation.music.url!}
          loop
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
