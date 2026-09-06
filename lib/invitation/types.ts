import type { CeremonyType } from "@prisma/client";

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
  weddingId: string;
  slug: string;
  ceremonyType: CeremonyType;
  ceremonyLabel: string;
  templateId: string;
  accentColor: string;
  couple: {
    name1: string;
    name2: string;
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
  music: { enabled: boolean; url: string | null };
  countdown: { enabled: boolean };
}

export interface ScheduleEntry {
  time: string;
  title: string;
  description: string;
}

export interface GalleryEntry {
  url: string;
  caption: string;
  order: number;
}
