import { ArchLine, FlameGlyph, KolamDots, LotusGlyph, ZariBand } from "@/components/decor";
import { FONT_PAIRINGS } from "@/lib/templates/fonts";
import type { TemplateManifest } from "@/lib/templates/types";

/**
 * A family as it shows itself in the gallery: a true miniature of the cover,
 * on the family's own ground, in the family's own display face — not an
 * abstract swatch. Two families means the card can afford to show the real
 * thing rather than stand in for it.
 */
export function DesignCard({
  design,
  coupleLine,
  ceremonyLabel,
  big = false,
}: {
  design: TemplateManifest;
  coupleLine: string;
  ceremonyLabel: string;
  big?: boolean;
}) {
  const t = design.tokens;
  const accent =
    design.accents.find((a) => a.key === design.defaultAccentKey)?.hex ?? t.brand;
  const display = FONT_PAIRINGS[design.defaultFontPairing].display;
  const centred = design.templateId === "mandapam-01";
  const scene = design.art?.sceneThumb ?? design.art?.scene;

  // A painted family shows its painting, with the sample names printed in the
  // space the painting leaves — the same arrangement as the real cover, so the
  // card is a small version of the invitation rather than a symbol for it.
  if (scene) {
    const box = design.art?.sceneText;
    return (
      <span
        className={`dsn dsn-painted ${big ? "dsn--big" : ""}`}
        style={{ background: t.surface, color: t.ink }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dsn-scene" src={scene} alt="" loading="lazy" decoding="async" />
        <span
          className="dsn-painted-text"
          style={{ top: `${box?.top ?? 31}%`, bottom: `${box?.bottom ?? 35}%` }}
        >
          <span className="dsn-ct" style={{ color: t.inkMuted }}>
            {ceremonyLabel}
          </span>
          <span className="dsn-cn" style={{ fontFamily: display, color: t.brandDeep }}>
            {coupleLine}
          </span>
        </span>
        <span
          className="dsn-name"
          style={{ color: t.ink, borderColor: t.rule, background: t.surface }}
        >
          {design.name}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`dsn ${big ? "dsn--big" : ""}`}
      style={{ background: t.surface, color: t.ink }}
      data-centred={centred || undefined}
    >
      {centred ? (
        <ArchLine className="dsn-arch" style={{ color: t.gold }} />
      ) : (
        <KolamDots className="dsn-dots" style={{ color: t.gold }} />
      )}

      <span className="dsn-body">
        {centred ? (
          <LotusGlyph className="dsn-mark" style={{ color: accent }} />
        ) : (
          <FlameGlyph className="dsn-mark" style={{ color: accent }} />
        )}
        <span className="dsn-ct" style={{ color: t.inkMuted }}>
          {ceremonyLabel}
        </span>
        <span className="dsn-cn" style={{ fontFamily: display, color: t.brandDeep }}>
          {coupleLine}
        </span>
        {centred ? (
          <ZariBand className="dsn-rule" style={{ color: t.gold }} />
        ) : (
          <span className="dsn-bar" style={{ background: accent }} />
        )}
      </span>

      <span className="dsn-name" style={{ color: t.inkMuted, borderColor: t.rule }}>
        {design.name}
      </span>
    </span>
  );
}
