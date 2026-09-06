"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Floating music control. Browsers block unprompted audio, so this never tries
 * to autoplay — the guest opts in, and the button reflects real element state
 * rather than an optimistic local flag.
 *
 * In the builder preview `enabled` is passed false so editing a page does not
 * start playing music at the customer.
 */
export function MusicToggle({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
    };
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        // Autoplay policy or a bad URL — leave the button in its off state.
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pause music" : "Play music"}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ds-accent-line)] bg-[var(--ds-surface)]/90 text-[var(--ds-brand)] shadow-lg backdrop-blur transition hover:bg-[var(--ds-surface)]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M9 18V5l10-2v13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="16.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          {!playing && (
            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>
    </>
  );
}
