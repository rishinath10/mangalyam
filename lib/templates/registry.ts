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

/** Deep, saturated colours: this family is a printed card, not a wash. */
const THANGA_ACCENTS: AccentSwatch[] = [
  { key: "kumkum", name: "Kumkum", hex: "#9E1B2F" },
  { key: "turmeric", name: "Turmeric", hex: "#D99A21" },
  { key: "leaf", name: "Leaf", hex: "#2E6B3C" },
  { key: "amethyst", name: "Amethyst", hex: "#6B2D74" },
  { key: "sandal", name: "Sandal", hex: "#B9662B" },
  { key: "midnight", name: "Midnight", hex: "#26406B" },
];

/** Every section, in the order a guest reads them. */
const FULL_SECTIONS: TemplateManifest["sections"] = [
  "cover",
  "couple",
  "event",
  "schedule",
  "gallery",
  "greetings",
  "rsvp",
  // Last on purpose. Replying is the thing the host actually needs from a
  // guest; the gift block sits below it so it never competes with that.
  "blessings",
];

/**
 * The painted families.
 *
 * Each is a folder of artwork under /public/templates and the entry below —
 * no component. The paintings are stained to the family's `surface` colour
 * when they are prepared (scripts/prepare-art.mjs), so the two must be changed
 * together: a different surface here needs the scene re-stained to match, or
 * the cover shows as a rectangle on the page.
 */
const PAINTED_FAMILIES: TemplateManifest[] = [
  {
    templateId: "kalyana-mandapam-01",
    name: "Kalyana Mandapam",
    tagline: "A carved arch hung with marigold and jasmine",
    eventTypes: ["wedding"],
    sections: FULL_SECTIONS,
    features: { music: true, countdown: true },
    accents: [
      { key: "kumkum", name: "Kumkum", hex: "#A3202E" },
      { key: "marigold", name: "Marigold", hex: "#C96A12" },
      { key: "mango-leaf", name: "Mango leaf", hex: "#3F7A3A" },
      { key: "temple-brass", name: "Temple brass", hex: "#9A7420" },
      { key: "peacock", name: "Peacock", hex: "#12687E" },
      { key: "plum", name: "Plum", hex: "#7A2F63" },
    ],
    defaultAccentKey: "kumkum",
    ceremonyAccentKeys: {
      mehendi: "mango-leaf",
      haldi: "marigold",
      sangeet: "plum",
      muhurtham: "kumkum",
      nalangu: "marigold",
      baraat: "kumkum",
      reception: "peacock",
      engagement: "temple-brass",
    },
    fontPairings: ["classic", "inscribed", "fine"],
    defaultFontPairing: "classic",
    tokens: {
      surface: "#FBF4E6",
      surfaceAlt: "#F4E8D0",
      ink: "#2C1B10",
      inkMuted: "#7B6247",
      rule: "#E0C79A",
      brand: "#A3202E",
      brandDeep: "#74121E",
      gold: "#B98A2C",
      radius: "3px",
      motionIntensity: 1,
    },
    art: {
      scene: "/templates/kalyana-mandapam/scene.webp",
      closing: "/templates/kalyana-mandapam/closing.webp",
      crest: "/templates/kalyana-mandapam/crest.webp",
      divider: "/templates/kalyana-mandapam/divider.webp",
    },
    built: true,
  },
  {
    templateId: "malligai-01",
    name: "Malligai",
    tagline: "Strings of jasmine, the way a doorway is dressed",
    eventTypes: [...EVENT_TYPES] as EventType[],
    sections: FULL_SECTIONS,
    features: { music: true, countdown: true },
    accents: [
      { key: "sage", name: "Sage", hex: "#55795A" },
      { key: "rose", name: "Rose", hex: "#B5566B" },
      { key: "brass", name: "Brass", hex: "#96741F" },
      { key: "plum", name: "Plum", hex: "#754064" },
      { key: "peacock", name: "Peacock", hex: "#1F6E7A" },
      { key: "kumkum", name: "Kumkum", hex: "#A3263A" },
    ],
    defaultAccentKey: "sage",
    ceremonyAccentKeys: {
      mehendi: "sage",
      haldi: "brass",
      sangeet: "plum",
      muhurtham: "kumkum",
      reception: "peacock",
      engagement: "rose",
    },
    fontPairings: ["fine", "classic", "inscribed"],
    defaultFontPairing: "fine",
    tokens: {
      surface: "#F7F5EC",
      surfaceAlt: "#ECEBDD",
      ink: "#27301F",
      inkMuted: "#6C7361",
      rule: "#D3D6BF",
      brand: "#55795A",
      brandDeep: "#35523B",
      gold: "#B0914A",
      radius: "14px",
      motionIntensity: 1,
    },
    art: {
      scene: "/templates/malligai/scene.webp",
      sceneText: { top: 36, bottom: 30 },
      closing: "/templates/malligai/closing.webp",
      crest: "/templates/malligai/crest.webp",
      divider: "/templates/malligai/divider.webp",
    },
    built: true,
  },
  {
    templateId: "gopuram-01",
    name: "Gopuram",
    tagline: "The temple tower at first light",
    eventTypes: ["temple_consecration", "home_pooja", "community_event", "sixtieth_birthday", "custom"],
    sections: FULL_SECTIONS,
    features: { music: true, countdown: true },
    accents: [
      { key: "saffron", name: "Saffron", hex: "#BF5B12" },
      { key: "kumkum", name: "Kumkum", hex: "#A3202E" },
      { key: "temple-brass", name: "Temple brass", hex: "#96701C" },
      { key: "palm", name: "Palm", hex: "#3F7347" },
      { key: "indigo", name: "Indigo", hex: "#34507E" },
      { key: "plum", name: "Plum", hex: "#793A62" },
    ],
    defaultAccentKey: "saffron",
    ceremonyAccentKeys: {},
    fontPairings: ["inscribed", "classic", "fine"],
    defaultFontPairing: "inscribed",
    tokens: {
      surface: "#FCF5E8",
      surfaceAlt: "#F5E8D0",
      ink: "#2E1C10",
      inkMuted: "#7D6349",
      rule: "#E4CCA0",
      brand: "#BF5B12",
      brandDeep: "#7E3408",
      gold: "#BC8C2A",
      radius: "3px",
      motionIntensity: 1,
    },
    art: {
      scene: "/templates/gopuram/scene.webp",
      sceneText: { top: 25, bottom: 40 },
      closing: "/templates/gopuram/closing.webp",
      crest: "/templates/gopuram/crest.webp",
      divider: "/templates/gopuram/divider.webp",
    },
    built: true,
  },
  {
    templateId: "thamarai-01",
    name: "Thamarai",
    tagline: "A lotus pond, for beginnings and milestones",
    eventTypes: ["naming_ceremony", "sixtieth_birthday", "wedding", "home_pooja", "custom"],
    sections: FULL_SECTIONS,
    features: { music: true, countdown: true },
    accents: [
      { key: "lotus", name: "Lotus", hex: "#B84E72" },
      { key: "lily-pad", name: "Lily pad", hex: "#4F7A5B" },
      { key: "brass", name: "Brass", hex: "#96741F" },
      { key: "dusk", name: "Dusk", hex: "#5D5E96" },
      { key: "plum", name: "Plum", hex: "#7C3B68" },
      { key: "peacock", name: "Peacock", hex: "#1F6E7A" },
    ],
    defaultAccentKey: "lotus",
    ceremonyAccentKeys: {
      mehendi: "lily-pad",
      haldi: "brass",
      sangeet: "plum",
      muhurtham: "lotus",
      reception: "peacock",
      engagement: "lotus",
    },
    fontPairings: ["fine", "classic", "inscribed"],
    defaultFontPairing: "fine",
    tokens: {
      surface: "#FBF3F1",
      surfaceAlt: "#F4E4E2",
      ink: "#2F1D22",
      inkMuted: "#7C6268",
      rule: "#E6CACD",
      brand: "#B84E72",
      brandDeep: "#7C2A49",
      gold: "#B58E45",
      radius: "16px",
      motionIntensity: 1,
    },
    art: {
      scene: "/templates/thamarai/scene.webp",
      sceneText: { top: 24, bottom: 39 },
      closing: "/templates/thamarai/closing.webp",
      crest: "/templates/thamarai/crest.webp",
      divider: "/templates/thamarai/divider.webp",
    },
    built: true,
  },
  {
    templateId: "griha-pravesham-01",
    name: "Griha Pravesham",
    tagline: "The front door, dressed for the first day",
    eventTypes: ["housewarming", "home_pooja", "custom"],
    sections: FULL_SECTIONS,
    features: { music: true, countdown: true },
    accents: [
      { key: "mango-leaf", name: "Mango leaf", hex: "#3F7A3A" },
      { key: "marigold", name: "Marigold", hex: "#C2640F" },
      { key: "teak", name: "Teak", hex: "#7A4A26" },
      { key: "kumkum", name: "Kumkum", hex: "#A3202E" },
      { key: "brass", name: "Brass", hex: "#96741F" },
      { key: "indigo", name: "Indigo", hex: "#34507E" },
    ],
    defaultAccentKey: "mango-leaf",
    ceremonyAccentKeys: {},
    fontPairings: ["classic", "inscribed", "fine"],
    defaultFontPairing: "classic",
    tokens: {
      surface: "#FAF3E3",
      surfaceAlt: "#F1E5CB",
      ink: "#2B1D10",
      inkMuted: "#786148",
      rule: "#DEC79B",
      brand: "#7A4A26",
      brandDeep: "#532E14",
      gold: "#B88A2B",
      radius: "3px",
      motionIntensity: 1,
    },
    art: {
      scene: "/templates/griha-pravesham/scene.webp",
      sceneText: { top: 27, bottom: 37, width: 58 },
      closing: "/templates/griha-pravesham/closing.webp",
      crest: "/templates/griha-pravesham/crest.webp",
      divider: "/templates/griha-pravesham/divider.webp",
    },
    built: true,
  },
  {
    templateId: "mayil-01",
    name: "Mayil",
    tagline: "Two peacocks in gold, on a midnight ground",
    eventTypes: ["wedding", "sixtieth_birthday", "community_event", "custom"],
    sections: FULL_SECTIONS,
    features: { music: true, countdown: true },
    // Light, bright swatches only: on a night ground the accent is what text
    // is set in, so a deep colour here would be unreadable.
    accents: [
      { key: "gold", name: "Gold", hex: "#E3C47A" },
      { key: "jade", name: "Jade", hex: "#7FD1B4" },
      { key: "pearl", name: "Pearl", hex: "#EDE6D3" },
      { key: "rose-gold", name: "Rose gold", hex: "#E9A98F" },
      { key: "sky", name: "Sky", hex: "#8EC9E6" },
      { key: "champagne", name: "Champagne", hex: "#F0D9A8" },
    ],
    defaultAccentKey: "gold",
    ceremonyAccentKeys: { sangeet: "jade", reception: "gold", engagement: "rose-gold" },
    fontPairings: ["classic", "fine", "inscribed"],
    defaultFontPairing: "classic",
    tokens: {
      surface: "#0F313A",
      surfaceAlt: "#16404B",
      ink: "#F1EBDC",
      inkMuted: "#A9BEC0",
      rule: "#2F5A64",
      brand: "#E3C47A",
      brandDeep: "#F0DCA6",
      gold: "#D9B45F",
      radius: "3px",
      motionIntensity: 1,
      dark: true,
    },
    art: {
      scene: "/templates/mayil/scene.webp",
      sceneText: { top: 29, bottom: 27, width: 52 },
      closing: "/templates/mayil/closing.webp",
      crest: "/templates/mayil/crest.webp",
      divider: "/templates/mayil/divider.webp",
    },
    built: true,
  },
  {
    templateId: "deepa-oli-01",
    name: "Deepa Oli",
    tagline: "Rows of lamps and a kolam at the door",
    eventTypes: ["community_event", "housewarming", "home_pooja", "custom"],
    sections: FULL_SECTIONS,
    features: { music: true, countdown: true },
    accents: [
      { key: "flame", name: "Flame", hex: "#F3B24C" },
      { key: "marigold", name: "Marigold", hex: "#F08A3C" },
      { key: "rangoli", name: "Rangoli pink", hex: "#F07BA6" },
      { key: "pearl", name: "Pearl", hex: "#F1E6D6" },
      { key: "champagne", name: "Champagne", hex: "#EDD3A0" },
      { key: "jade", name: "Jade", hex: "#86D0AE" },
    ],
    defaultAccentKey: "flame",
    ceremonyAccentKeys: {},
    fontPairings: ["inscribed", "classic", "fine"],
    defaultFontPairing: "inscribed",
    tokens: {
      surface: "#2D0D1F",
      surfaceAlt: "#3D1630",
      ink: "#F6EBDD",
      inkMuted: "#C3A9B4",
      rule: "#5A2A46",
      brand: "#F3B24C",
      brandDeep: "#F8D08A",
      gold: "#E5B45C",
      radius: "4px",
      motionIntensity: 1,
      dark: true,
    },
    art: {
      scene: "/templates/deepavali/scene.webp",
      sceneText: { top: 34, bottom: 29 },
      closing: "/templates/deepavali/closing.webp",
      crest: "/templates/deepavali/crest.webp",
      divider: "/templates/deepavali/divider.webp",
    },
    built: true,
  },
];

export const TEMPLATE_MANIFESTS: TemplateManifest[] = [
  ...PAINTED_FAMILIES,
  {
    templateId: "mandapam-01",
    name: "Mandapam",
    tagline: "The pavilion the ceremony happens under",
    eventTypes: ["wedding"],
    sections: [
      "cover",
      "couple",
      "event",
      "schedule",
      "gallery",
      "greetings",
      "rsvp",
      // Last on purpose. Replying is the thing the host actually needs from a
      // guest; the gift block sits below it so it never competes with that.
      "blessings",
    ],
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
    sections: [
      "cover",
      "couple",
      "event",
      "schedule",
      "gallery",
      "greetings",
      "rsvp",
      // Last on purpose. Replying is the thing the host actually needs from a
      // guest; the gift block sits below it so it never competes with that.
      "blessings",
    ],
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
  {
    templateId: "thanga-kolam-01",
    name: "Thanga Kolam",
    tagline: "A gold border, drawn the way a printed card is",
    // Offered to everything: a border and a crest carry no wedding in them.
    eventTypes: [...EVENT_TYPES] as EventType[],
    sections: [
      "cover",
      "couple",
      "event",
      "schedule",
      "gallery",
      "greetings",
      "rsvp",
      // Last on purpose. Replying is the thing the host actually needs from a
      // guest; the gift block sits below it so it never competes with that.
      "blessings",
    ],
    features: { music: true, countdown: true },
    accents: THANGA_ACCENTS,
    defaultAccentKey: "kumkum",
    ceremonyAccentKeys: {
      mehendi: "leaf",
      haldi: "turmeric",
      sangeet: "amethyst",
      muhurtham: "kumkum",
      nalangu: "sandal",
      baraat: "kumkum",
      reception: "midnight",
      engagement: "sandal",
    },
    fontPairings: ["classic", "inscribed", "fine"],
    defaultFontPairing: "classic",
    tokens: {
      surface: "#FDF9F0",
      surfaceAlt: "#F5EDDC",
      ink: "#2B1F14",
      inkMuted: "#75634C",
      rule: "#DCC79C",
      brand: "#9E1B2F",
      brandDeep: "#6E1020",
      gold: "#B8912F",
      radius: "4px",
      motionIntensity: 1,
    },
    /**
     * The first family with no component of its own — it is these four files
     * and the manifest around them. Replacing the artwork replaces the design;
     * copying this entry with a different folder adds another.
     */
    art: {
      ground: "/templates/thanga-kolam/ground.svg",
      groundFit: "tile",
      groundVeil: 0.92,
      frame: "/templates/thanga-kolam/frame.svg",
      crest: "/templates/thanga-kolam/crest.svg",
      divider: "/templates/thanga-kolam/divider.svg",
    },
    built: true,
  },
];

export const DEFAULT_TEMPLATE_ID = "malligai-01";
export const WEDDING_TEMPLATE_ID = "kalyana-mandapam-01";

/**
 * The family each occasion opens on — the painting made for it. Anything not
 * listed starts on the default, which is offered to every occasion.
 */
const STARTING_TEMPLATE: Partial<Record<EventType, string>> = {
  wedding: WEDDING_TEMPLATE_ID,
  naming_ceremony: "thamarai-01",
  housewarming: "griha-pravesham-01",
  sixtieth_birthday: "thamarai-01",
  temple_consecration: "gopuram-01",
  home_pooja: "gopuram-01",
  community_event: "deepa-oli-01",
};

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
  return STARTING_TEMPLATE[eventType] ?? DEFAULT_TEMPLATE_ID;
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
  return accentFromManifest(getManifest(templateId), ceremonyType, accentKey);
}

/**
 * The same resolution against a manifest the caller already holds.
 *
 * A design that exists only in the database is invisible to `getManifest`, so
 * anything that has resolved one on the server — the composer above all — must
 * resolve its accent against that manifest rather than by id.
 */
export function accentFromManifest(
  manifest: TemplateManifest,
  ceremonyType: string | null,
  accentKey?: string | null,
): string {
  const swatch = (key: string | null | undefined) =>
    key ? manifest.accents.find((a) => a.key === key) : undefined;

  const chosen =
    swatch(accentKey) ??
    swatch(ceremonyType ? manifest.ceremonyAccentKeys[ceremonyType as never] : null) ??
    swatch(manifest.defaultAccentKey);

  return chosen?.hex ?? manifest.accents[0].hex;
}
