import type { CeremonyType, EventType, OpeningStyle } from "@prisma/client";
import { ceremonyLabel } from "@/lib/ceremonies";
import { EVENT_TYPE_LABELS } from "@/lib/events";
import type { InvitationSource } from "@/lib/invitation/compose";
import { slugify } from "@/lib/slugify";
import { defaultTemplateFor, templatesForEvent } from "@/lib/templates/registry";

/**
 * An invitation that does not exist yet.
 *
 * The create wizard runs before there is an account, so there is no row to
 * write to and no owner to check. Rather than invent anonymous database rows
 * — which would mean a second ownership story alongside the guards in
 * lib/auth/ownership.ts, for rows nobody owns — the whole draft lives in the
 * visitor's own browser until they sign in. Nothing about an unclaimed draft
 * touches the server, so there is nothing about it to guard.
 *
 * The shape is deliberately close to InvitationSource: `draftToSource` below
 * is the only mapping, and the preview then goes through the same
 * `composeInvitationJson` the published page uses (rule #3).
 */
export interface InvitationDraft {
  /** Bumped when the shape changes; a draft from an older version is dropped. */
  version: 1;
  eventType: EventType;
  hostNames: string;
  ceremonyType: CeremonyType | null;
  customCeremonyName: string | null;
  templateId: string;
  accentKey: string | null;
  fontPairing: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  venueName: string | null;
  address: string | null;
  mapLink: string | null;
  description: string | null;
  schedule: { time: string; title: string; description: string | null }[];
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
  /**
   * A downscaled JPEG data URL, not the original file.
   *
   * Holding the File itself would mean the photo vanishes on refresh while
   * every other answer survives, which is the confusing half-loss. Downscaled
   * it is a couple of hundred kilobytes, small enough for localStorage, good
   * enough for a phone-sized cover, and it is re-uploaded through the ordinary
   * cover route once the invitation exists — so the server sees a normal image
   * upload and applies its normal limits.
   */
  coverPhoto: string | null;
}

export const DRAFT_STORAGE_KEY = "mangalyam.draft.v1";

/** Longest edge of the stored cover, and its JPEG quality. */
export const COVER_MAX_EDGE = 1600;
export const COVER_QUALITY = 0.82;

export function emptyDraft(): InvitationDraft {
  return {
    version: 1,
    eventType: "wedding",
    hostNames: "",
    ceremonyType: "muhurtham",
    customCeremonyName: null,
    templateId: defaultTemplateFor("wedding"),
    accentKey: null,
    fontPairing: null,
    date: null,
    startTime: null,
    endTime: null,
    venueName: null,
    address: null,
    mapLink: null,
    description: null,
    schedule: [],
    settings: {
      musicEnabled: false,
      musicUrl: null,
      countdownEnabled: true,
      galleryEnabled: true,
      rsvpEnabled: true,
      askMealPreference: false,
      rsvpCloseDate: null,
      openingStyle: "doors",
      openingText: null,
      autoScroll: true,
      contactName: null,
      contactPhone: null,
    },
    coverPhoto: null,
  };
}

/**
 * Switching occasion changes what is even askable: only a wedding has
 * ceremonies, and the two families offer different palettes. Anything the new
 * occasion cannot express is dropped rather than carried along invisibly.
 */
export function withEventType(
  draft: InvitationDraft,
  eventType: EventType,
): InvitationDraft {
  if (draft.eventType === eventType) return draft;
  const families = templatesForEvent(eventType);
  const keepsFamily = families.some((f) => f.templateId === draft.templateId);
  return {
    ...draft,
    eventType,
    ceremonyType: eventType === "wedding" ? (draft.ceremonyType ?? "muhurtham") : null,
    customCeremonyName: eventType === "wedding" ? draft.customCeremonyName : null,
    templateId: keepsFamily ? draft.templateId : defaultTemplateFor(eventType),
    accentKey: keepsFamily ? draft.accentKey : null,
    fontPairing: keepsFamily ? draft.fontPairing : null,
  };
}

/** What the invitation is called, from whatever the draft has so far. */
export function draftLabel(draft: InvitationDraft): string {
  return draft.ceremonyType
    ? ceremonyLabel(draft.ceremonyType, draft.customCeremonyName)
    : EVENT_TYPE_LABELS[draft.eventType];
}

/** The link the invitation would get, shown under the preview. */
export function draftSlug(draft: InvitationDraft): string {
  return slugify(`${draft.hostNames} ${draftLabel(draft)}`) || "your-invitation";
}

/**
 * Draft -> the shared source shape, so the wizard's preview is rendered by the
 * exact component the guest-facing page mounts.
 *
 * Empty answers become stand-in text rather than blanks: a preview of nothing
 * teaches the visitor nothing, and the placeholders read obviously as
 * placeholders. They exist only here — the stored draft stays honestly empty,
 * so nothing invented on screen can be saved by accident.
 */
export function draftToSource(draft: InvitationDraft): InvitationSource {
  return {
    // Not real ids: nothing is persisted yet. The preview never calls an API
    // with them — PreviewPane renders in preview mode, where the RSVP form is
    // inert.
    invitationId: "draft",
    eventId: "draft",
    slug: draftSlug(draft),
    eventType: draft.eventType,
    ceremonyType: draft.ceremonyType,
    customCeremonyName: draft.customCeremonyName,
    templateId: draft.templateId,
    accentKey: draft.accentKey,
    fontPairing: draft.fontPairing,
    hostNames: draft.hostNames.trim() || "Your names",
    coverPhotoUrl: draft.coverPhoto,
    // Frame artwork is not part of self-serve any more; it is applied for
    // bespoke work from the admin side.
    frameUrl: null,
    description: draft.description,
    date: draft.date,
    startTime: draft.startTime,
    endTime: draft.endTime,
    venueName: draft.venueName?.trim() || "Your venue",
    address: draft.address,
    mapLink: draft.mapLink,
    schedule: draft.schedule.filter((item) => item.title.trim() && item.time),
    photos: [],
    settings: draft.settings,
  };
}

/** The fields without which there is nothing to publish. */
export function draftIssues(draft: InvitationDraft): string[] {
  const issues: string[] = [];
  if (!draft.hostNames.trim()) issues.push("Add who the invitation is from.");
  if (!draft.date) issues.push("Add the date.");
  if (!draft.venueName?.trim()) issues.push("Add the venue.");
  if (draft.ceremonyType === "custom" && !draft.customCeremonyName?.trim())
    issues.push("Name your ceremony.");
  return issues;
}

/**
 * What is sent to /api/drafts/claim. The cover photo is excluded on purpose:
 * it goes up afterwards through the ordinary cover route, so there is no
 * second image-decoding path to get wrong.
 */
export function claimPayload(draft: InvitationDraft) {
  const wedding = draft.eventType === "wedding";
  return {
    eventType: draft.eventType,
    hostNames: draft.hostNames.trim(),
    ceremonyType: wedding ? draft.ceremonyType : null,
    customCeremonyName: wedding ? draft.customCeremonyName : null,
    templateId: draft.templateId,
    accentKey: draft.accentKey,
    fontPairing: draft.fontPairing,
    date: draft.date,
    startTime: draft.startTime,
    endTime: draft.endTime,
    venueName: draft.venueName,
    address: draft.address,
    mapLink: draft.mapLink,
    description: draft.description,
    schedule: draft.schedule.filter((item) => item.title.trim() && item.time),
    settings: draft.settings,
  };
}
