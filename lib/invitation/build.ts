import type {
  Invitation,
  InvitationPhoto,
  InvitationScheduleItem,
  InvitationSettings,
  Wedding,
} from "@prisma/client";
import {
  composeInvitationJson,
  type InvitationSource,
} from "@/lib/invitation/compose";
import type { InvitationJson } from "@/lib/invitation/types";

export type InvitationWithRelations = Invitation & {
  wedding: Wedding;
  scheduleItems: InvitationScheduleItem[];
  photos: InvitationPhoto[];
  settings: InvitationSettings | null;
};

/** Prisma include that produces exactly `InvitationWithRelations`. */
export const invitationInclude = {
  wedding: true,
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
export function toInvitationSource(row: InvitationWithRelations): InvitationSource {
  const s = row.settings;
  return {
    invitationId: row.id,
    weddingId: row.weddingId,
    slug: row.slug,
    ceremonyType: row.ceremonyType,
    customCeremonyName: row.customCeremonyName,
    templateId: row.templateId,
    accentColorOverride: row.accentColorOverride,
    coupleName1: row.wedding.coupleName1,
    coupleName2: row.wedding.coupleName2,
    coverPhotoUrl: row.coverPhotoUrl,
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

export function buildInvitationJson(row: InvitationWithRelations): InvitationJson {
  return composeInvitationJson(toInvitationSource(row));
}
