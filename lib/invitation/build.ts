import type {
  Event,
  Invitation,
  InvitationPhoto,
  InvitationScheduleItem,
  InvitationSettings,
} from "@prisma/client";
import {
  composeInvitationJson,
  type InvitationSource,
} from "@/lib/invitation/compose";
import type { InvitationJson } from "@/lib/invitation/types";
import type { TemplateArt } from "@/lib/templates/types";

export type InvitationWithRelations = Invitation & {
  event: Event;
  scheduleItems: InvitationScheduleItem[];
  photos: InvitationPhoto[];
  settings: InvitationSettings | null;
};

/** Prisma include that produces exactly `InvitationWithRelations`. */
export const invitationInclude = {
  event: true,
  scheduleItems: { orderBy: { sortOrder: "asc" } },
  photos: { orderBy: { sortOrder: "asc" } },
  settings: true,
} as const;

const isoDate = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 10) : null;

/**
 * Database rows -> the plain source shape. Settings may legitimately be absent
 * on a freshly imported row, so the defaults here are the same ones the schema
 * declares.
 */
export function toInvitationSource(
  row: InvitationWithRelations,
  /** Resolved by the caller through lib/templates/art-store — the pure mapping
   *  here must stay free of database calls. */
  art?: TemplateArt,
): InvitationSource {
  const s = row.settings;
  return {
    invitationId: row.id,
    eventId: row.eventId,
    eventType: row.event.eventType,
    slug: row.slug,
    ceremonyType: row.ceremonyType,
    customCeremonyName: row.customCeremonyName,
    templateId: row.templateId,
    accentKey: row.accentKey,
    fontPairing: row.fontPairing,
    hostNames: row.event.hostNames,
    coverPhotoUrl: row.coverPhotoUrl,
    frameUrl: row.frameUrl,
    art,
    description: row.description,
    date: isoDate(row.date),
    startTime: row.startTime,
    endTime: row.endTime,
    venueName: row.venueName,
    address: row.address,
    mapLink: row.mapLink,
    schedule: row.scheduleItems.map((item) => ({
      time: item.time,
      title: item.title,
      description: item.description,
    })),
    photos: row.photos.map((photo) => ({
      url: photo.url,
      caption: photo.caption,
      sortOrder: photo.sortOrder,
    })),
    settings: {
      musicEnabled: s?.musicEnabled ?? false,
      musicUrl: s?.musicUrl ?? null,
      countdownEnabled: s?.countdownEnabled ?? true,
      galleryEnabled: s?.galleryEnabled ?? true,
      rsvpEnabled: s?.rsvpEnabled ?? true,
      askMealPreference: s?.askMealPreference ?? false,
      rsvpCloseDate: isoDate(s?.rsvpCloseDate),
      openingStyle: s?.openingStyle ?? "doors",
      openingText: s?.openingText ?? null,
      autoScroll: s?.autoScroll ?? true,
      contactName: s?.contactName ?? null,
      contactPhone: s?.contactPhone ?? null,
    },
  };
}

export function buildInvitationJson(
  row: InvitationWithRelations,
  art?: TemplateArt,
): InvitationJson {
  return composeInvitationJson(toInvitationSource(row, art));
}
