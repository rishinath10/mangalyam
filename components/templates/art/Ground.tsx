import type { TemplateArt } from "@/lib/templates/types";

/**
 * The family's own ground, behind everything.
 *
 * A flat colour is the single clearest tell that a card was drawn in a browser
 * — printed invitations sit on paper, silk or marble, and the eye reads that
 * texture before it reads anything else. This lays the family's texture over
 * the surface token rather than replacing it, so the accent system still shows
 * through and one texture serves every colourway.
 */
export function Ground({ art }: { art: TemplateArt }) {
  if (!art.ground) return null;
  const tile = art.groundFit !== "cover";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url(${art.ground})`,
        backgroundRepeat: tile ? "repeat" : "no-repeat",
        backgroundSize: tile ? "320px" : "cover",
        backgroundPosition: "center",
        opacity: 1 - (art.groundVeil ?? 0.86),
      }}
    />
  );
}
