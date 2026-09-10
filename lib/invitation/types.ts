import type { CeremonyType, EventType, OpeningStyle } from "@prisma/client";
import type { TemplateArt } from "@/lib/templates/types";
import type { FontPairingKey } from "@/lib/templates/fonts";

/**
 * The content contract (CLAUDE.md Section 4.3).
 *
 * This is the *only* thing a template component ever receives. Templates never
 * fetch, never mutate, and never reach past this shape into the database
 * (rule #2). Both the live preview and the published page build this same
 * object and hand it to the same renderer (rule #3).
 */
export interface InvitationJson {
  invitationId: string;
  eventId: string;
  eventType: EventType;
  slug: string;
  /** Null for every occasion except a wedding, which alone has sub-ceremonies. */
  ceremonyType: CeremonyType | null;
  ceremonyLabel: string;
  templateId: string;
  /** Resolved from the family's palette — components never see a key. */
  accentColor: string;
  fontPairing: FontPairingKey;
  /**
   * Decorative border drawn around the cover at full strength, expected 3:4
   * with an empty centre. Null for the great majority of invitations — the
   * families are designed to look complete without one.
   */
  frame: string | null;
  /**
   * The template family's artwork, resolved server-side. The renderer reads it
   * from here rather than from the registry, so an admin upload reaches a card
   * without the browser ever touching the database.
   */
  art?: TemplateArt;
  couple: {
    /** "Ashwin & Kalyani", "The Kumar Family", or a single name. */
    hostNames: string;
    coverPhoto: string | null;
    message: string | null;
  };
  event: {
    date: string | null; // ISO yyyy-mm-dd
    startTime: string | null; // HH:mm
    endTime: string | null; // HH:mm
    venueName: string | null;
    address: string | null;
    mapLink: string | null;
  };
  schedule: ScheduleEntry[];
  gallery: GalleryEntry[];
  rsvp: { enabled: boolean; askMealPreference: boolean; closeDate: string | null };
  /**
   * What guests wrote when they replied, shown back on the page.
   *
   * Only ever the name and the message — never whether someone is coming, how
   * many they are bringing or what they eat. That is the host's list, and a
   * guest opening the link should not be able to read the headcount off it.
   */
  greetings: Greeting[];
  music: { enabled: boolean; url: string | null };
  countdown: { enabled: boolean };
  /** The cover a guest taps before the invitation is revealed. */
  opening: { style: OpeningStyle; text: string | null; autoScroll: boolean };
  /** The person guests ring about this occasion. */
  contact: { name: string | null; phone: string | null };
  /**
   * Where a guest sends gift money, when the host has chosen to show it.
   *
   * `enabled` is not the same as "has something to show": a host can turn the
   * section on and not have filled it in yet, and the renderer must draw
   * nothing rather than an empty heading over a blank space.
   */
  blessings: Blessings;
}

export interface Blessings {
  enabled: boolean;
  /** The host's own line of context, above the details. */
  note: string | null;
  /** A stored image, written only by the upload route. */
  qr: string | null;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
}

export interface ScheduleEntry {
  time: string;
  title: string;
  description: string;
}

export interface Greeting {
  guestName: string;
  message: string;
  /** ISO date. The wall reads newest first. */
  at: string;
}

export interface GalleryEntry {
  url: string;
  caption: string;
  order: number;
}
