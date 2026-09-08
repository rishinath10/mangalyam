import type { CeremonyType } from "@prisma/client";
import { CEREMONY_ACCENT_DEFAULTS } from "@/lib/ceremonies";
import type { DesignSystemKey, TemplateManifest } from "@/lib/templates/types";

/**
 * The six launch designs, and the single source of truth for both the
 * marketing gallery and the builder's template picker.
 *
 * `built` is the honest bit: only a design with a renderer behind it can be
 * chosen. The rest are listed so the gallery can show the full set without the
 * builder ever offering something that would render as a blank page.
 */
export const TEMPLATE_MANIFESTS: TemplateManifest[] = [
  {
    templateId: "kanjivaram-01",
    name: "Kanjivaram",
    tagline: "Woven silk",
    designSystem: "kanjivaram",
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    ceremonyAccentDefaults: CEREMONY_ACCENT_DEFAULTS,
    defaultAccent: "#116B52",
    silk: { field: "#116B52", gradient: "linear-gradient(168deg,#1B8E6C,#116B52 48%,#094A3A)", deco: "weave" },
    premium: false,
    built: false,
  },
  {
    templateId: "gopuram-01",
    name: "Gopuram",
    tagline: "Temple tower",
    designSystem: "gopuram",
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    ceremonyAccentDefaults: CEREMONY_ACCENT_DEFAULTS,
    defaultAccent: "#A81A2C",
    silk: { field: "#A81A2C", gradient: "linear-gradient(168deg,#C93044,#A81A2C 48%,#71101D)", deco: "korvai" },
    premium: false,
    built: true,
  },
  {
    templateId: "mahal-01",
    name: "Mahal",
    tagline: "Mughal marble",
    designSystem: "mahal",
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    ceremonyAccentDefaults: CEREMONY_ACCENT_DEFAULTS,
    defaultAccent: "#B21E56",
    silk: { field: "#B21E56", gradient: "linear-gradient(168deg,#D33A75,#B21E56 48%,#7C0F3C)", deco: "frame" },
    premium: true,
    built: false,
  },
  {
    templateId: "jali-01",
    name: "Jali",
    tagline: "Pierced lattice",
    designSystem: "jali",
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    ceremonyAccentDefaults: CEREMONY_ACCENT_DEFAULTS,
    defaultAccent: "#0D6480",
    silk: { field: "#0D6480", gradient: "linear-gradient(168deg,#1385A6,#0D6480 48%,#07455A)", deco: "lattice" },
    premium: true,
    built: false,
  },
  {
    templateId: "mayil-01",
    name: "Mayil",
    tagline: "Peacock plume",
    designSystem: "mayil",
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    ceremonyAccentDefaults: CEREMONY_ACCENT_DEFAULTS,
    defaultAccent: "#552042",
    silk: { field: "#552042", gradient: "linear-gradient(168deg,#752C5C,#552042 48%,#37112C)", deco: "rule" },
    premium: true,
    built: false,
  },
  {
    templateId: "kolam-01",
    name: "Kolam",
    tagline: "Rice-flour line",
    designSystem: "kolam",
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    ceremonyAccentDefaults: CEREMONY_ACCENT_DEFAULTS,
    defaultAccent: "#D89412",
    silk: { field: "#D89412", gradient: "linear-gradient(168deg,#F0B842,#D89412 48%,#A96D06)", deco: "dots" },
    premium: false,
    built: false,
  },
];

export const DEFAULT_TEMPLATE_ID = "gopuram-01";

export const BUILT_TEMPLATES = TEMPLATE_MANIFESTS.filter((t) => t.built);

export function getManifest(templateId: string): TemplateManifest {
  const manifest = TEMPLATE_MANIFESTS.find((t) => t.templateId === templateId);
  // An invitation pointing at a retired design must still render rather than
  // 500, so fall back to the default instead of throwing.
  return (
    manifest ??
    TEMPLATE_MANIFESTS.find((t) => t.templateId === DEFAULT_TEMPLATE_ID) ??
    TEMPLATE_MANIFESTS[0]
  );
}

/** Only a design with a renderer behind it may be selected. */
export function isSelectableTemplate(templateId: string): boolean {
  return TEMPLATE_MANIFESTS.some((t) => t.templateId === templateId && t.built);
}

/**
 * Accent resolution order (CLAUDE.md Sections 4.4 and 7):
 *   1. the customer's explicit override
 *   2. the design's default for this ceremony
 *   3. the design's own default accent — which is where `custom` lands
 */
export function resolveAccentColor(
  templateId: string,
  ceremonyType: CeremonyType | null,
  override?: string | null,
): string {
  if (override && /^#[0-9a-fA-F]{6}$/.test(override)) return override;
  const manifest = getManifest(templateId);
  // No ceremony (every occasion but a wedding) lands on the design's own
  // default, the same place "custom" does for a wedding ceremony.
  if (!ceremonyType) return manifest.defaultAccent;
  return manifest.ceremonyAccentDefaults[ceremonyType] ?? manifest.defaultAccent;
}

export type { DesignSystemKey };
