import type { CeremonyType, EventType, OpeningStyle } from "@prisma/client";
import { ceremonyLabel } from "@/lib/ceremonies";
import { EVENT_TYPE_LABELS } from "@/lib/events";
import { getManifest, resolveAccentColor } from "@/lib/templates/registry";
import { isFontPairingKey } from "@/lib/templates/fonts";
import type { InvitationJson } from "@/lib/invitation/types";

/**
 * A flat, plain-data description of an invitation: no Prisma types, no Date
 * objects, safe to hold in React state and to serialise across the
 * server/client boundary.
 *
 * Both sides of the app produce one of these and hand it to
 * `composeInvitationJson` — the server maps database rows into it, the builder
 * maps its form state into it. That is what stops the live preview from
 * becoming a second implementation of the content contract (rule #3): the
 * shape is assembled in exactly one place.
 */
export interface InvitationSource {
  invitationId: string;
  eventId: string;
  eventType: EventType;
  slug: string;
  /** Only meaningful when eventType is "wedding"; null otherwise. */
  ceremonyType: CeremonyType | null;
  customCeremonyName: string | null;
  templateId: string;
  accentKey: string | null;
  fontPairing: string | null;
  hostNames: string;
  coverPhotoUrl: string | null;
  frameUrl: string | null;
  description: string | null;
  date: string | null; // yyyy-mm-dd
  startTime: string | null; // HH:mm
  endTime: string | null; // HH:mm
  venueName: string | null;
  address: string | null;
  mapLink: string | null;
  schedule: { time: string; title: string; description: string | null }[];
  photos: { url: string; caption: string | null; sortOrder: number }[];
  settings: {
    musicEnabled: boolean;
    musicUrl: string | null;
    countdownEnabled: boolean;
    galleryEnabled: boolean;
    rsvpEnabled: boolean;
    askMealPreference: boolean;
    rsvpCloseDate: string | null;
    openingStyle: OpeningStyle;
    openingText: string | null;
    autoScroll: boolean;
    contactName: string | null;
    contactPhone: string | null;
  };
}

export function composeInvitationJson(source: InvitationSource): InvitationJson {
  return {
    invitationId: source.invitationId,
    eventId: source.eventId,
    eventType: source.eventType,
    slug: source.slug,
    ceremonyType: source.ceremonyType,
    // A wedding names its chosen ceremony; every other occasion is labelled
    // from its EventType, since it has no ceremony to choose.
    ceremonyLabel: source.ceremonyType
      ? ceremonyLabel(source.ceremonyType, source.customCeremonyName)
      : EVENT_TYPE_LABELS[source.eventType],
    templateId: source.templateId,
    accentColor: resolveAccentColor(
      source.templateId,
      source.ceremonyType,
      source.accentKey,
    ),
    // An unknown or absent pairing falls back to the family's own default
    // rather than to a hardcoded face.
    fontPairing:
      source.fontPairing && isFontPairingKey(source.fontPairing)
        ? source.fontPairing
        : getManifest(source.templateId).defaultFontPairing,
    frame: source.frameUrl,
    couple: {
      hostNames: source.hostNames,
      coverPhoto: source.coverPhotoUrl,
      message: source.description,
    },
    event: {
      date: source.date,
      startTime: source.startTime,
      endTime: source.endTime,
      venueName: source.venueName,
      address: source.address,
      mapLink: source.mapLink,
    },
    schedule: source.schedule.map((item) => ({
      time: item.time,
      title: item.title,
      description: item.description ?? "",
    })),
    gallery: source.settings.galleryEnabled
      ? source.photos.map((photo) => ({
          url: photo.url,
          caption: photo.caption ?? "",
          order: photo.sortOrder,
        }))
      : [],
    rsvp: {
      enabled: source.settings.rsvpEnabled,
      askMealPreference: source.settings.askMealPreference,
      closeDate: source.settings.rsvpCloseDate,
    },
    music: {
      enabled: source.settings.musicEnabled,
      url: source.settings.musicUrl,
    },
    countdown: { enabled: source.settings.countdownEnabled },
    opening: {
      style: source.settings.openingStyle,
      text: source.settings.openingText,
      autoScroll: source.settings.autoScroll,
    },
    contact: {
      name: source.settings.contactName,
      phone: source.settings.contactPhone,
    },
  };
}
