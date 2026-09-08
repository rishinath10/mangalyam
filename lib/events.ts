import type { EventType } from "@prisma/client";

/**
 * The occasions Mangalyam covers. Only `wedding` has sub-ceremonies
 * (CeremonyType, in lib/ceremonies.ts) — every other type gets exactly one
 * invitation, labelled from this table instead of a chosen ceremony.
 */
export const EVENT_TYPES = [
  "wedding",
  "naming_ceremony",
  "housewarming",
  "sixtieth_birthday",
  "temple_consecration",
  "home_pooja",
  "community_event",
  "custom",
] as const satisfies readonly EventType[];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  naming_ceremony: "Naming Ceremony",
  housewarming: "Housewarming",
  sixtieth_birthday: "60th Birthday",
  temple_consecration: "Temple Consecration",
  home_pooja: "Home Pooja",
  community_event: "Community Event",
  custom: "Celebration",
};

/** The line under each occasion in the picker. */
export const EVENT_TYPE_BLURBS: Record<EventType, string> = {
  wedding: "A separate invitation for every ceremony",
  naming_ceremony: "Welcoming the newest member of the family",
  housewarming: "Griha Pravesham — blessing a new home",
  sixtieth_birthday: "Sashtiabdapoorthi — a milestone celebrated in full",
  temple_consecration: "Kumbhabhishekam and the community that builds it",
  home_pooja: "A prayer at home, guests welcome",
  community_event: "Deepavali open house, and gatherings like it",
  custom: "Yours to name",
};

/**
 * Only a wedding has sub-ceremonies. Every other occasion's single invitation
 * carries `ceremonyType: null`, and templates fall back to this label.
 */
export function isWeddingEvent(eventType: EventType): boolean {
  return eventType === "wedding";
}
