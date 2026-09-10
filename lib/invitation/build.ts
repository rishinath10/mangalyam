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
  /** Only the two public columns — see invitationInclude. */
  rsvps: { guestName: string; message: string | null; createdAt: Date }[];
};

/** Prisma include that produces exactly `InvitationWithRelations`. */
export const invitationInclude = {
  event: true,
  scheduleItems: { orderBy: { sortOrder: "asc" } },
  photos: { orderBy: { sortOrder: "asc" } },
  settings: true,
  /**
   * Greetings for the public wall.
   *
   * `rsvps` is owner-only-read (rule #4) and stays that way: only two columns
   * are selected, and neither says whether anyone is coming, how many they are
   * bringing or what they eat. A guest with the link can read what other
   * guests wrote to the couple; they still cannot read the headcount off the
   * page. Rows with no message never appear.
   */
  rsvps: {
    where: { message: { not: null } },
    select: { guestName: true, message: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  },
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
    greetings: row.rsvps.map((r) => ({
      guestName: r.guestName,
      message: r.message ?? "",
      at: r.createdAt.toISOString(),
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
      giftsEnabled: s?.giftsEnabled ?? false,
      giftNote: s?.giftNote ?? null,
      giftQrUrl: s?.giftQrUrl ?? null,
      giftBankName: s?.giftBankName ?? null,
      giftAccountName: s?.giftAccountName ?? null,
      giftAccountNumber: s?.giftAccountNumber ?? null,
    },
  };
}

export function buildInvitationJson(
  row: InvitationWithRelations,
  art?: TemplateArt,
): InvitationJson {
  return composeInvitationJson(toInvitationSource(row, art));
}
