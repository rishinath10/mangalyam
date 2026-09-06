import type { CeremonyType } from "@prisma/client";

/**
 * Canonical ceremony presets (CLAUDE.md Section 7). Templates may override
 * these in their manifest's `ceremonyAccentDefaults`; this table is the base a
 * manifest starts from and the fallback when a manifest omits a ceremony.
 */
export const CEREMONY_TYPES = [
  "mehendi",
  "sangeet",
  "haldi",
  "baraat",
  "reception",
  "engagement",
  "custom",
] as const satisfies readonly CeremonyType[];

export const CEREMONY_LABELS: Record<CeremonyType, string> = {
  mehendi: "Mehendi Ceremony",
  sangeet: "Sangeet",
  haldi: "Haldi Ceremony",
  baraat: "Baraat & Pheras",
  reception: "Reception",
  engagement: "Engagement",
  custom: "Ceremony",
};

/**
 * `custom` is intentionally absent: a custom ceremony has no inherent colour
 * and falls back to the selected template's default accent (Section 7).
 */
export const CEREMONY_ACCENT_DEFAULTS: Partial<Record<CeremonyType, string>> = {
  haldi: "#F4B400",
  mehendi: "#4C7A3D",
  sangeet: "#7B2D8E",
  baraat: "#8A1C1C",
  reception: "#8A1C1C",
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
