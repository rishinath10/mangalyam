import type {
  Invitation,
  InvitationPhoto,
  InvitationScheduleItem,
  InvitationSettings,
  Wedding,
} from "@prisma/client";
import { ceremonyLabel } from "@/lib/ceremonies";
import { resolveAccentColor } from "@/lib/templates/registry";
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

const isoDate = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

/**
 * The single place database rows become the content contract (Section 4.3).
 * Both the builder's live preview and the published page call this, which is
 * what makes rule #3 (one renderer) hold end to end rather than just at the
 * component boundary.
 */
export function buildInvitationJson(row: InvitationWithRelations): InvitationJson {
  const settings = row.settings;

  return {
    invitationId: row.id,
    weddingId: row.weddingId,
    slug: row.slug,
    ceremonyType: row.ceremonyType,
    ceremonyLabel: ceremonyLabel(row.ceremonyType, row.customCeremonyName),
    templateId: row.templateId,
    accentColor: resolveAccentColor(
      row.templateId,
      row.ceremonyType,
      row.accentColorOverride,
    ),
    couple: {
      name1: row.wedding.coupleName1,
      name2: row.wedding.coupleName2,
      coverPhoto: row.coverPhotoUrl,
      message: row.description,
    },
    event: {
      date: isoDate(row.date),
      startTime: row.startTime,
      endTime: row.endTime,
      venueName: row.venueName,
      address: row.address,
      mapLink: row.mapLink,
    },
    schedule: row.scheduleItems.map((item) => ({
      time: item.time,
      title: item.title,
      description: item.description ?? "",
    })),
    gallery:
      settings?.galleryEnabled === false
        ? []
        : row.photos.map((photo) => ({
            url: photo.url,
            caption: photo.caption ?? "",
            order: photo.sortOrder,
          })),
    rsvp: {
      enabled: settings?.rsvpEnabled ?? true,
      askMealPreference: settings?.askMealPreference ?? false,
      closeDate: isoDate(settings?.rsvpCloseDate ?? null),
    },
    music: {
      enabled: settings?.musicEnabled ?? false,
      url: settings?.musicUrl ?? null,
    },
    countdown: { enabled: settings?.countdownEnabled ?? true },
  };
}
