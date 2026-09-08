import type { EventType } from "@prisma/client";
import type { AccentSwatch, TemplateManifest } from "@/lib/templates/types";
import { EVENT_TYPES } from "@/lib/events";

/**
 * Two template families, and the single source of truth for the marketing
 * gallery, the builder's picker and the renderer.
 *
 * Curated, not open (CLAUDE.md Section 5, post-pivot): a family owns its
 * layout, type scale and ornament outright. A customer chooses a family, one
 * swatch from its palette, one font pairing, and supplies their own photo and
 * words. There is deliberately no route from the builder to an arbitrary hex
 * or an arbitrary typeface.
 */

/** Tamil wedding materials, in the order they appear across the days. */
const MANDAPAM_ACCENTS: AccentSwatch[] = [
  { key: "kumkum", name: "Kumkum", hex: "#A81A2C" },
  { key: "turmeric", name: "Turmeric", hex: "#E0A32E" },
  { key: "mehendi", name: "Mehendi", hex: "#2F7D32" },
  { key: "kadamba", name: "Kadamba", hex: "#7B2D8E" },
  { key: "chandan", name: "Chandan", hex: "#C8622C" },
  { key: "peacock", name: "Peacock", hex: "#0E6E8C" },
];

/** Occasion-neutral: nothing here reads as wedding-specific. */
const DEEPAM_ACCENTS: AccentSwatch[] = [
  { key: "brass", name: "Brass", hex: "#A8781F" },
  { key: "vermilion", name: "Vermilion", hex: "#B3402F" },
  { key: "tulsi", name: "Tulsi", hex: "#3E7A4E" },
  { key: "indigo", name: "Indigo", hex: "#35507F" },
  { key: "plum", name: "Plum", hex: "#7A3A63" },
  { key: "teal", name: "Teal", hex: "#1E6E70" },
];

export const TEMPLATE_MANIFESTS: TemplateManifest[] = [
  {
    templateId: "mandapam-01",
    name: "Mandapam",
    tagline: "The pavilion the ceremony happens under",
    eventTypes: ["wedding"],
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    accents: MANDAPAM_ACCENTS,
    defaultAccentKey: "kumkum",
    // Each ceremony opens on the colour that day is actually dressed in.
    ceremonyAccentKeys: {
      mehendi: "mehendi",
      haldi: "turmeric",
      sangeet: "kadamba",
      muhurtham: "kumkum",
      nalangu: "chandan",
      baraat: "kumkum",
      reception: "peacock",
      engagement: "chandan",
    },
    fontPairings: ["classic", "inscribed", "fine"],
    defaultFontPairing: "classic",
    tokens: {
      surface: "#FBF6EC",
      surfaceAlt: "#F3E9D6",
      ink: "#2A1A12",
      inkMuted: "#7A6553",
      rule: "#D9C5A0",
      brand: "#A81A2C",
      brandDeep: "#71101D",
      gold: "#C08A2E",
      radius: "2px",
      motionIntensity: 1,
    },
    built: true,
  },
  {
    templateId: "deepam-01",
    name: "Deepam",
    tagline: "The lamp lit for every auspicious morning",
    // The general family: everything that is not specifically a wedding, and
    // weddings too for anyone who wants the quieter of the two.
    eventTypes: [...EVENT_TYPES] as EventType[],
    sections: ["cover", "couple", "event", "schedule", "gallery", "rsvp"],
    features: { music: true, countdown: true },
    accents: DEEPAM_ACCENTS,
    defaultAccentKey: "brass",
    ceremonyAccentKeys: {},
    fontPairings: ["inscribed", "classic", "fine"],
    defaultFontPairing: "inscribed",
    tokens: {
      surface: "#FDFBF5",
      surfaceAlt: "#F4EFE2",
      ink: "#241E14",
      inkMuted: "#6F6553",
      rule: "#DED5C0",
      brand: "#8A6B14",
      brandDeep: "#5E480C",
      gold: "#B8912F",
      radius: "10px",
      motionIntensity: 0.9,
    },
    built: true,
  },
];

export const DEFAULT_TEMPLATE_ID = "deepam-01";
export const WEDDING_TEMPLATE_ID = "mandapam-01";

export const BUILT_TEMPLATES = TEMPLATE_MANIFESTS.filter((t) => t.built);

export function getManifest(templateId: string): TemplateManifest {
  const manifest = TEMPLATE_MANIFESTS.find((t) => t.templateId === templateId);
  // An invitation pointing at a retired family must still render rather than
  // 500, so fall back to the default instead of throwing.
  return (
    manifest ??
    TEMPLATE_MANIFESTS.find((t) => t.templateId === DEFAULT_TEMPLATE_ID) ??
    TEMPLATE_MANIFESTS[0]
  );
}

/** The families an occasion may actually choose between. */
export function templatesForEvent(eventType: EventType): TemplateManifest[] {
  return BUILT_TEMPLATES.filter((t) => t.eventTypes.includes(eventType));
}

/** The family a newly created invitation starts on. */
export function defaultTemplateFor(eventType: EventType): string {
  return eventType === "wedding" ? WEDDING_TEMPLATE_ID : DEFAULT_TEMPLATE_ID;
}

/**
 * A family is selectable only if it is built *and* offered to this occasion —
 * otherwise a housewarming could be pointed at the wedding family through a
 * hand-made request.
 */
export function isSelectableTemplate(templateId: string, eventType: EventType): boolean {
  return templatesForEvent(eventType).some((t) => t.templateId === templateId);
}

/**
 * Accent resolution: the customer's chosen swatch, else the ceremony's
 * starting swatch, else the family default. A key that is not in this
 * family's palette is ignored rather than trusted — palettes differ between
 * families, and switching family must never leave a stale colour behind.
 */
export function resolveAccentColor(
  templateId: string,
  ceremonyType: string | null,
  accentKey?: string | null,
): string {
  const manifest = getManifest(templateId);
  const swatch = (key: string | null | undefined) =>
    key ? manifest.accents.find((a) => a.key === key) : undefined;

  const chosen =
    swatch(accentKey) ??
    swatch(ceremonyType ? manifest.ceremonyAccentKeys[ceremonyType as never] : null) ??
    swatch(manifest.defaultAccentKey);

  return chosen?.hex ?? manifest.accents[0].hex;
}
