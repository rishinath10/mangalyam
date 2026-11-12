/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

/**
 * A border around the cover, with the invitation printed inside it.
 *
 * The stage takes the artwork's own proportions. It used to be locked to 3:4
 * with the image stretched to fill, which was right for exactly one shape of
 * artwork and quietly distorted every other — a square border came out tall
 * and thin-sided. Now the image sets the height, and 3:4 is only what the
 * space is reserved at until it has loaded, so the page does not jump.
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
    <div className="relative mx-auto w-full max-w-[min(100%,460px)]">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none block h-auto w-full select-none"
        style={{ aspectRatio: "auto 3 / 4" }}
      />
      <div className="absolute inset-0 grid place-items-center px-[15%] py-[13%] text-center">
        {children}
      </div>
    </div>
  );
}
