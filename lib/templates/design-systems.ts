import { FONT_PAIRINGS, type FontPairingKey } from "@/lib/templates/fonts";
import type { TemplateManifest } from "@/lib/templates/types";

/**
 * The single seam between a family's tokens and its markup: the manifest, the
 * customer's accent and their font pairing become inline CSS custom
 * properties. Template markup reads `var(--ds-*)` and never a hex literal or
 * a font name, which is what keeps the curation real — there is no way for a
 * component to reach past the palette.
 */
export function designSystemStyle(
  manifest: TemplateManifest,
  accentColor: string,
  fontPairing: FontPairingKey,
): React.CSSProperties {
  const t = manifest.tokens;
  const font = FONT_PAIRINGS[fontPairing] ?? FONT_PAIRINGS[manifest.defaultFontPairing];

  return {
    "--ds-surface": t.surface,
    "--ds-surface-alt": t.surfaceAlt,
    "--ds-ink": t.ink,
    "--ds-ink-muted": t.inkMuted,
    "--ds-rule": t.rule,
    "--ds-brand": t.brand,
    "--ds-brand-deep": t.brandDeep,
    "--ds-gold": t.gold,
    "--ds-radius": t.radius,
    "--ds-accent": accentColor,
    "--ds-accent-soft": `color-mix(in srgb, ${accentColor} 14%, transparent)`,
    "--ds-accent-line": `color-mix(in srgb, ${accentColor} 45%, transparent)`,
    "--ds-motion": String(t.motionIntensity),
    // Emitted here and nowhere else. These were referenced by every template
    // long before anything defined them, so invitation headings silently fell
    // back to the browser's default serif.
    "--ds-font-display": font.display,
    "--ds-font-body": font.body,
  } as React.CSSProperties;
}
