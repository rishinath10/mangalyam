import type { CeremonyType, EventType } from "@prisma/client";
import type { FontPairingKey } from "@/lib/templates/fonts";
import type { InvitationJson } from "@/lib/invitation/types";

export type SectionKey =
  | "cover"
  | "couple"
  | "event"
  | "schedule"
  | "gallery"
  | "rsvp";

/**
 * One swatch in a family's curated palette. The customer picks a key, never a
 * hex — so a palette can be retuned later and every invitation follows,
 * instead of thousands of frozen hex strings drifting away from the design.
 */
export interface AccentSwatch {
  key: string;
  name: string;
  hex: string;
}

/**
 * What a template family declares (CLAUDE.md Section 4.4, post-pivot).
 *
 * Two families ship: one for weddings, one for every other occasion. What a
 * customer may change is exactly what is listed here — a swatch from
 * `accents`, a pairing from `fontPairings`, their own photo and words.
 * Section order, type scale and ornament belong to the family and are not
 * exposed anywhere in the builder.
 */
export interface TemplateManifest {
  templateId: string;
  name: string;
  tagline: string;
  /** Which occasions may choose this family. Wedding-only families list one. */
  eventTypes: EventType[];
  sections: SectionKey[];
  features: { music: boolean; countdown: boolean };
  /** The only colours this family offers. */
  accents: AccentSwatch[];
  /** Used when nothing else resolves — must be a key in `accents`. */
  defaultAccentKey: string;
  /** Per-ceremony starting swatch, keyed into `accents`. Weddings only. */
  ceremonyAccentKeys: Partial<Record<CeremonyType, string>>;
  /** The pairings offered for this family, in picker order. */
  fontPairings: FontPairingKey[];
  defaultFontPairing: FontPairingKey;
  tokens: DesignTokens;
  /**
   * Artwork, when the family is drawn rather than stroked.
   *
   * A family with `art` needs no component of its own: ArtTemplate lays these
   * pieces out and prints live text over them, so adding a design is adding a
   * folder and a manifest entry. That is the only way to get to a gallery —
   * nobody hand-writes twelve React components.
   *
   * Absent, the family falls back to its own coded renderer, which is what the
   * two original line-drawn families still use.
   */
  art?: TemplateArt;
  /** False until a renderer exists — the picker must never offer a blank page. */
  built: boolean;
}

/**
 * The four pieces a drawn family is made of. Every one is optional: a design
 * with only a frame is still a design, and a missing file must degrade to the
 * plain ground rather than to a broken image.
 *
 * The hard rule for all of them: **no text baked in**. The names, the date and
 * the venue are printed as live text over the centre, which is what makes the
 * invitation personal, keeps the font pairings meaningful, keeps it readable
 * to a screen reader, and lets someone change the venue after publishing. Art
 * with a couple's names inside it is a picture, not a template.
 */
export interface TemplateArt {
  /** Fills the whole invitation. A tileable texture, or a large soft image. */
  ground?: string;
  /** How the ground repeats. "tile" for a seamless texture, "cover" for a scene. */
  groundFit?: "tile" | "cover";
  /** A 3:4 border drawn around the cover, with a clear centre. */
  frame?: string;
  /** The ornament above the names on the cover. */
  crest?: string;
  /** The rule between sections, in place of a stroked band. */
  divider?: string;
  /** 0–1. How far to knock the ground back so text stays readable over it. */
  groundVeil?: number;
}

/**
 * Design tokens live with the family, not scattered through component logic
 * (CLAUDE.md Section 5). `designSystemStyle()` emits them as CSS custom
 * properties, so template markup reads `var(--ds-*)` and never a hex literal.
 */
export interface DesignTokens {
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
  rule: string;
  /** The family's own colour, distinct from the customer's chosen accent. */
  brand: string;
  brandDeep: string;
  gold: string;
  radius: string;
  /** Scales every animation's duration; keep low for patchy venue data. */
  motionIntensity: number;
}

/** Every template component takes exactly this — the JSON and nothing else. */
export interface TemplateProps {
  invitation: InvitationJson;
  /** True inside the builder preview: suppresses live side effects like autoplay. */
  preview?: boolean;
}
