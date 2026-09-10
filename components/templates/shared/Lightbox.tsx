"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { GalleryEntry } from "@/lib/invitation/types";

/**
 * A photograph, full size, over the invitation.
 *
 * Portalled to <body>: the gallery sits inside the invitation's own stacking
 * context, and a z-index declared in there cannot reach past the action bar
 * pinned to the bottom of the page.
 *
 * Keyboard and screen-reader behaviour is the part that is easy to skip and
 * the part that makes it usable — Escape closes, the arrows move between
 * photographs, focus is taken when it opens and given back when it closes, and
 * the page behind cannot scroll while it is up.
 */
export function Lightbox({
  gallery,
  index,
  onClose,
  onMove,
}: {
  gallery: GalleryEntry[];
  index: number | null;
  onClose: () => void;
  onMove: (next: number) => void;
}) {
  const open = index !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  // Where focus was before this opened, so it can be handed back.
  const restoreTo = useRef<Element | null>(null);

  const step = useCallback(
    (delta: number) => {
      if (index === null || gallery.length < 2) return;
      onMove((index + delta + gallery.length) % gallery.length);
    },
    [index, gallery.length, onMove],
  );

  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Back to the thumbnail that opened it, not to the top of the page.
      if (restoreTo.current instanceof HTMLElement) restoreTo.current.focus();
    };
  }, [open, onClose, step]);

  if (!open || typeof document === "undefined") return null;
  const photo = gallery[index];
  if (!photo) return null;

  return createPortal(
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || `Photograph ${index + 1} of ${gallery.length}`}
      onClick={onClose}
    >
      <button ref={closeRef} type="button" className="lb-x" onClick={onClose}>
        <span className="sr-only">Close</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {gallery.length > 1 && (
        <>
          <button
            type="button"
            className="lb-arrow lb-prev"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            <span className="sr-only">Previous photograph</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="lb-arrow lb-next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            <span className="sr-only">Next photograph</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Stops a tap on the photograph itself from closing it. */}
      <figure className="lb-stage" onClick={(e) => e.stopPropagation()}>
        <img src={photo.url} alt={photo.caption || ""} />
        <figcaption>
          {photo.caption && <span className="lb-cap">{photo.caption}</span>}
          {gallery.length > 1 && (
            <span className="lb-count">
              {index + 1} / {gallery.length}
            </span>
          )}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}
