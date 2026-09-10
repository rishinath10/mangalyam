/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

/**
 * A border around the cover, with the invitation printed inside it.
 *
 * The stage is locked to 3:4 because a border has to keep all four edges — let
 * it stretch to the viewport and the corners pull apart. Same reasoning as
 * CoverFrame, which does this for a single customer-supplied frame; this is
 * the family's own artwork doing the same job.
 *
 * Nothing about the frame constrains the text: the children sit in the middle
 * with their own padding, so a long name grows into the clear centre rather
 * than into the ornament.
 */
export function ArtFrame({ src, children }: { src?: string; children: ReactNode }) {
  if (!src) return <>{children}</>;

  // Fills the cover rather than sitting in it as a smaller card: a border
  // floating in the middle of a blank field reads as a sticker, not as the
  // edge of the invitation.
  return (
    <div className="relative mx-auto w-full max-w-[min(100%,460px)]" style={{ aspectRatio: "3 / 4" }}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{ objectFit: "fill" }}
      />
      <div className="absolute inset-0 grid place-items-center px-[15%] py-[13%] text-center">
        {children}
      </div>
    </div>
  );
}
