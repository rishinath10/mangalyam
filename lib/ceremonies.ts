import type { CeremonyType } from "@prisma/client";

/**
 * Canonical ceremony presets (CLAUDE.md Section 7). Templates may override
 * these in their manifest's `ceremonyAccentDefaults`; this table is the base a
 * manifest starts from and the fallback when a manifest omits a ceremony.
 */
export const CEREMONY_TYPES = [
  "mehendi",
  "haldi",
  "sangeet",
  "muhurtham",
  "nalangu",
  "baraat",
  "reception",
  "engagement",
  "custom",
] as const satisfies readonly CeremonyType[];

export const CEREMONY_LABELS: Record<CeremonyType, string> = {
  mehendi: "Mehendi",
  haldi: "Haldi",
  sangeet: "Sangeet",
  muhurtham: "Muhurtham",
  nalangu: "Nalangu",
  baraat: "Baraat",
  reception: "Reception",
  engagement: "Engagement",
  custom: "Ceremony",
};

/** The line under each ceremony in the picker — what the day actually is. */
export const CEREMONY_BLURBS: Record<CeremonyType, string> = {
  mehendi: "Henna night",
  haldi: "Turmeric",
  sangeet: "Music night",
  muhurtham: "The ceremony",
  nalangu: "Games & blessing",
  baraat: "The procession",
  reception: "The party",
  engagement: "The promise",
  custom: "Yours to name",
};

/**
 * `custom` is intentionally absent: a custom ceremony has no inherent colour
 * and falls back to the selected template's default accent (Section 7).
 */
export const CEREMONY_ACCENT_DEFAULTS: Partial<Record<CeremonyType, string>> = {
  haldi: "#F2A916",
  mehendi: "#2F7D32",
  sangeet: "#7B2D8E",
  muhurtham: "#B01B2E",
  nalangu: "#C8622C",
  baraat: "#8A1C1C",
  reception: "#0E6E8C",
  engagement: "#B8860B",
};

export function ceremonyLabel(
  ceremonyType: CeremonyType,
  customCeremonyName?: string | null,
): string {
  if (ceremonyType === "custom") {
    return customCeremonyName?.trim() || CEREMONY_LABELS.custom;
  }
  return CEREMONY_LABELS[ceremonyType];
}
