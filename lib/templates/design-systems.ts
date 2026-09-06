import type { DesignSystemKey, DesignTokens } from "@/lib/templates/types";

/**
 * Design tokens belong to the design system, not to component logic
 * (CLAUDE.md Section 5). `designSystemStyle` emits them as CSS custom
 * properties, so template markup reads `var(--ds-*)` and never a hex literal —
 * which is what makes adding the next design a component exercise rather than
 * a rewrite.
 *
 * All six are defined even though one has a renderer so far; Phase 8 builds
 * components against tokens that already exist.
 */
export const DESIGN_SYSTEMS: Record<DesignSystemKey, DesignTokens> = {
  gopuram: {
    surface: "#FBF6EC", surfaceAlt: "#F3E9D6", ink: "#2A1A12", inkMuted: "#7A6553",
    rule: "#D9C5A0", brand: "#A81A2C", brandDeep: "#71101D", gold: "#C08A2E",
    fontDisplay: "var(--font-serif)", fontBody: "var(--font-ui)",
    radius: "2px", motionIntensity: 1,
  },
  kanjivaram: {
    surface: "#FCF8EF", surfaceAlt: "#F1EADA", ink: "#22241C", inkMuted: "#6E7263",
    rule: "#D5D2B8", brand: "#116B52", brandDeep: "#094A3A", gold: "#C9A227",
    fontDisplay: "var(--font-serif)", fontBody: "var(--font-ui)",
    radius: "4px", motionIntensity: 0.9,
  },
  mahal: {
    surface: "#FEF9F6", surfaceAlt: "#F7E9EE", ink: "#2E1520", inkMuted: "#7C5C68",
    rule: "#E6CBD6", brand: "#B21E56", brandDeep: "#7C0F3C", gold: "#D4AF37",
    fontDisplay: "var(--font-serif)", fontBody: "var(--font-ui)",
    radius: "12px", motionIntensity: 0.85,
  },
  jali: {
    surface: "#F7FAFB", surfaceAlt: "#E8F0F3", ink: "#12262E", inkMuted: "#5E7078",
    rule: "#C6D8DE", brand: "#0D6480", brandDeep: "#07455A", gold: "#B9942F",
    fontDisplay: "var(--font-serif)", fontBody: "var(--font-ui)",
    radius: "0px", motionIntensity: 0.8,
  },
  mayil: {
    surface: "#FBF7FA", surfaceAlt: "#F0E6EE", ink: "#241020", inkMuted: "#6E5468",
    rule: "#DCC8D6", brand: "#552042", brandDeep: "#37112C", gold: "#C9A227",
    fontDisplay: "var(--font-serif)", fontBody: "var(--font-ui)",
    radius: "16px", motionIntensity: 1.15,
  },
  kolam: {
    surface: "#FFFCF4", surfaceAlt: "#F8EFDA", ink: "#3A2408", inkMuted: "#836B44",
    rule: "#E4D2A8", brand: "#D89412", brandDeep: "#A96D06", gold: "#B8860B",
    fontDisplay: "var(--font-serif)", fontBody: "var(--font-ui)",
    radius: "8px", motionIntensity: 0.75,
  },
};

/**
 * The single seam between tokens and markup: a design system plus the
 * invitation's accent colour become inline CSS custom properties.
 */
export function designSystemStyle(
  key: DesignSystemKey,
  accentColor: string,
): React.CSSProperties {
  const t = DESIGN_SYSTEMS[key];
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
  } as React.CSSProperties;
}
