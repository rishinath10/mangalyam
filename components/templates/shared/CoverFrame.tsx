/**
 * Wraps a cover's content in customer-supplied frame artwork.
 *
 * Without a frame this renders nothing of its own — the families are designed
 * to look complete unframed, and the overwhelming majority of invitations will
 * have no artwork at all.
 *
 * With one, the cover becomes a 3:4 card rather than a full-bleed screen. That
 * is not a stylistic preference: a border must keep all four of its edges, and
 * a phone screen is roughly 9:19.5. Stretching 3:4 artwork to fill that would
 * distort it, and object-cover would crop the left and right borders away
 * entirely — the two things a frame cannot survive. Locking the stage to the
 * artwork's own ratio is the only composition where the border stays intact,
 * and it happens to be exactly how a printed card sits on a table.
 */
export function CoverFrame({
  frame,
  children,
}: {
  frame: string | null;
  children: React.ReactNode;
}) {
  if (!frame) return <>{children}</>;

  return (
    <div className="inv-frame-stage">
      {/* Decorative: every word a guest needs is live text inside the safe
          area, so the artwork is never announced. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frame} alt="" className="inv-frame-art" />
      <div className="inv-frame-safe">{children}</div>
    </div>
  );
}
