/* eslint-disable @next/next/no-img-element */

/**
 * The ornament above the names.
 *
 * Rendered as an image rather than an inline glyph so a family can carry real
 * artwork — painted, shaded, foiled — instead of the handful of strokes a
 * component can draw. Decorative, so it is hidden from screen readers: the
 * names underneath carry the meaning.
 */
export function Crest({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      // Width comes from the class, never from here: an inline 100% beat every
      // size a caller asked for, which is how a section mark meant to be a
      // small flourish came out as wide as the page.
      className={className ?? "w-full"}
      style={{ display: "block", height: "auto" }}
    />
  );
}
