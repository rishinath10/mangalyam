import type { EventType } from "@prisma/client";
import type { ReactNode } from "react";

/**
 * One line glyph per occasion, drawn to the same rules as CeremonyIcon: flat
 * strokes on a 38px grid, where anything more detailed turns to mush.
 *
 * Each is the object the day is actually recognised by — a thali, a cradle, a
 * lamp — rather than a generic symbol for "event".
 */
const PATHS: Record<EventType, ReactNode> = {
  // The thali tied at the muhurtham: the moment a wedding turns on.
  wedding: (
    <><path d="M6.5 10c4 7 8.3 10.7 12.5 10.7S27.5 17 31.5 10" /><path d="M19 20.7v2.8" /><path d="M19 23.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" /><circle cx="19" cy="28.5" r="1.5" /></>
  ),
  // A cradle on its rockers.
  naming_ceremony: (
    <><path d="M7.5 15h23l-1.6 9.5a5 5 0 0 1-4.9 4.2h-10a5 5 0 0 1-4.9-4.2Z" /><path d="M10 15c1.6-4.4 4.8-6.6 9-6.6s7.4 2.2 9 6.6" /><path d="M6 31.5c3.4 2 6.8 2 10.2 0s6.8-2 10.2 0" /></>
  ),
  // A doorway with the threshold lamp lit beside it.
  housewarming: (
    <><path d="M6 18.5 19 8l13 10.5" /><path d="M9.5 16.4V30h19V16.4" /><path d="M15.6 30v-7.4a3.4 3.4 0 0 1 6.8 0V30" /><circle cx="19" cy="25.4" r="1" /></>
  ),
  // A garland hung for the sashtiabdapoorthi.
  sixtieth_birthday: (
    <><path d="M8 11.5c0 10.5 4.9 16.5 11 16.5s11-6 11-16.5" /><path d="M8 11.5a3 3 0 1 1 6 0M24 11.5a3 3 0 1 1 6 0" /><circle cx="14.2" cy="20.5" r="1.1" /><circle cx="19" cy="23.2" r="1.1" /><circle cx="23.8" cy="20.5" r="1.1" /><path d="M19 28v3.5" /></>
  ),
  // The kalasham raised over the gopuram at a kumbhabhishekam.
  temple_consecration: (
    <><path d="M19 5.5v3" /><path d="M15.6 12.2c0-2 1.5-3.4 3.4-3.4s3.4 1.4 3.4 3.4c0 1.6-1.2 2.4-1.2 3.6h-4.4c0-1.2-1.2-2-1.2-3.6Z" /><path d="M11.5 19.5h15l1.8 5h-18.6z" /><path d="M8.5 27h21l2 5.5h-25z" /></>
  ),
  // A single standing lamp, one flame.
  home_pooja: (
    <><path d="M19 8c4.2 6 3.6 10.8 0 13.2-3.6-2.4-4.2-7.2 0-13.2Z" /><path d="M11.5 24.5h15" /><path d="M19 21.2v3.3" /><path d="M14.5 24.5c0 4 2 6.5 4.5 6.5s4.5-2.5 4.5-6.5" /></>
  ),
  // A row of lamps along a threshold: an open house.
  community_event: (
    <><path d="M6 27.5h26" /><path d="M10.5 27.5c0-2.6 1.3-4.2 3-4.2s3 1.6 3 4.2" /><path d="M21.5 27.5c0-2.6 1.3-4.2 3-4.2s3 1.6 3 4.2" /><path d="M13.5 23.3c1.9-2.4 1.7-4.4 0-6.3-1.7 1.9-1.9 3.9 0 6.3Z" /><path d="M24.5 23.3c1.9-2.4 1.7-4.4 0-6.3-1.7 1.9-1.9 3.9 0 6.3Z" /><path d="M19 9v5" /></>
  ),
  // Yours to name: a struck star, no object at all.
  custom: (
    <><path d="M19 7v24M7 19h24" /><path d="m11.2 11.2 15.6 15.6M26.8 11.2 11.2 26.8" opacity=".55" /><circle cx="19" cy="19" r="3.2" /></>
  ),
};

export function EventIcon({
  eventType,
  className,
}: {
  eventType: EventType;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 38 38"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[eventType]}
    </svg>
  );
}
