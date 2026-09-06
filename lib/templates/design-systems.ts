import type { DesignSystemKey, DesignTokens } from "@/lib/templates/types";

/**
 * The three launch design systems (CLAUDE.md Section 6). Only Temple Heritage
 * has a template built against it so far — Kolam Classic and Kalash Royal are
 * Phase 8. Their tokens are defined here already so Phase 8 is a component
 * exercise, not a token-design exercise.
 */
export const DESIGN_SYSTEMS: Record<DesignSystemKey, DesignTokens> = {
  "temple-heritage": {
    surface: "#FBF6EC",
    surfaceAlt: "#F3E9D6",
    ink: "#2A1A12",
    inkMuted: "#7A6553",
    rule: "#D9C5A0",
    brand: "#8A1C1C",
    brandDeep: "#5C1010",
    gold: "#C08A2E",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-body)",
    radius: "2px",
    motionIntensity: 1,
  },
  "kolam-classic": {
    surface: "#FDFAF3",
    surfaceAlt: "#F6EFE1",
    ink: "#33291F",
    inkMuted: "#8A7A66",
    rule: "#E2D4B7",
    brand: "#B8860B",
    brandDeep: "#8A6408",
    gold: "#D4AF37",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-body)",
    radius: "10px",
    motionIntensity: 0.85,
  },
  "kalash-royal": {
    surface: "#FFF8EE",
    surfaceAlt: "#F7E7CE",
    ink: "#241009",
    inkMuted: "#6E5445",
    rule: "#C9A227",
    brand: "#7A0F1E",
    brandDeep: "#4E0812",
    gold: "#C9A227",
    fontDisplay: "var(--font-display)",
    fontBody: "var(--font-body)",
    radius: "0px",
    motionIntensity: 1.2,
  },
};

/**
 * Turns a design system plus the invitation's accent colour into inline CSS
 * custom properties. This is the single seam between tokens and markup:
 * templates style themselves with `var(--ds-*)` and never see a hex literal.
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
