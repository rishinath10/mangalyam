import {
  COVER_MAX_EDGE,
  COVER_QUALITY,
  DRAFT_STORAGE_KEY,
  emptyDraft,
  type InvitationDraft,
} from "@/lib/draft";
import { CEREMONY_TYPES } from "@/lib/ceremonies";
import { EVENT_TYPES } from "@/lib/events";
import { OPENING_STYLES } from "@/lib/validation";
import { getManifest, templatesForEvent } from "@/lib/templates/registry";
import { isFontPairingKey } from "@/lib/templates/fonts";

/**
 * Browser-side persistence for an unclaimed draft. Every entry point tolerates
 * localStorage being unavailable or throwing outright — private windows, a
 * full quota and "block site data" all fail here, and none of them is a reason
 * for the wizard to stop working. A draft that cannot be stored is still a
 * draft that can be finished in this tab.
 */

/**
 * Anything read back out of localStorage is untrusted input: it may be from an
 * older release, hand-edited, or truncated by a quota failure mid-write. Rather
 * than trust the blob, each field is checked and anything unrecognised falls
 * back to the default — so a bad draft degrades to a blank one instead of
 * crashing the wizard or, worse, reaching the claim route as nonsense.
 */
function normalise(raw: unknown): InvitationDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  if (input.version !== 1) return null;

  const base = emptyDraft();
  const str = (v: unknown, max: number): string | null =>
    typeof v === "string" && v.trim() ? v.slice(0, max) : null;
  const bool = (v: unknown, fallback: boolean) =>
    typeof v === "boolean" ? v : fallback;

  const eventType = EVENT_TYPES.includes(input.eventType as never)
    ? (input.eventType as InvitationDraft["eventType"])
    : base.eventType;

  const wedding = eventType === "wedding";
  const families = templatesForEvent(eventType);
  const templateId = families.some((f) => f.templateId === input.templateId)
    ? (input.templateId as string)
    : base.templateId;
  const manifest = getManifest(templateId);

  const settings =
    input.settings && typeof input.settings === "object"
      ? (input.settings as Record<string, unknown>)
      : {};

  return {
    version: 1,
    eventType,
    hostNames: str(input.hostNames, 120) ?? "",
    ceremonyType:
      wedding && CEREMONY_TYPES.includes(input.ceremonyType as never)
        ? (input.ceremonyType as InvitationDraft["ceremonyType"])
        : wedding
          ? base.ceremonyType
          : null,
    customCeremonyName: wedding ? str(input.customCeremonyName, 60) : null,
    templateId,
    accentKey: manifest.accents.some((a) => a.key === input.accentKey)
      ? (input.accentKey as string)
      : null,
    fontPairing:
      typeof input.fontPairing === "string" &&
      isFontPairingKey(input.fontPairing) &&
      manifest.fontPairings.includes(input.fontPairing)
        ? input.fontPairing
        : null,
    date: str(input.date, 10),
    startTime: str(input.startTime, 5),
    endTime: str(input.endTime, 5),
    venueName: str(input.venueName, 120),
    address: str(input.address, 400),
    mapLink: str(input.mapLink, 500),
    description: str(input.description, 1200),
    schedule: Array.isArray(input.schedule)
      ? input.schedule.slice(0, 30).flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const row = item as Record<string, unknown>;
          return [
            {
              time: str(row.time, 5) ?? "09:00",
              title: str(row.title, 80) ?? "",
              description: str(row.description, 300),
            },
          ];
        })
      : [],
    settings: {
      musicEnabled: bool(settings.musicEnabled, base.settings.musicEnabled),
      musicUrl: str(settings.musicUrl, 500),
      countdownEnabled: bool(settings.countdownEnabled, base.settings.countdownEnabled),
      galleryEnabled: bool(settings.galleryEnabled, base.settings.galleryEnabled),
      rsvpEnabled: bool(settings.rsvpEnabled, base.settings.rsvpEnabled),
      askMealPreference: bool(settings.askMealPreference, base.settings.askMealPreference),
      rsvpCloseDate: str(settings.rsvpCloseDate, 10),
      openingStyle: OPENING_STYLES.includes(settings.openingStyle as never)
        ? (settings.openingStyle as InvitationDraft["settings"]["openingStyle"])
        : base.settings.openingStyle,
      openingText: str(settings.openingText, 24),
      autoScroll: bool(settings.autoScroll, base.settings.autoScroll),
      contactName: str(settings.contactName, 60),
      contactPhone: str(settings.contactPhone, 24),
    },
    // Only a data: image is accepted back — a stored http(s) URL would make
    // the preview fetch something this browser put there, which is not what
    // this field is for.
    coverPhoto:
      typeof input.coverPhoto === "string" && input.coverPhoto.startsWith("data:image/")
        ? input.coverPhoto
        : null,
  };
}

export function loadDraft(): InvitationDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? normalise(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Returns false when the draft could not be stored — usually a full quota. */
export function saveDraft(draft: InvitationDraft): boolean {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    /* nothing to clean up if the store was never reachable */
  }
}

/**
 * Re-encodes a chosen photo to something a draft can hold: a phone-sized JPEG
 * data URL. The original never leaves the file input — a 12MP photo is several
 * megabytes, and localStorage gives us about five in total.
 */
export async function toCoverDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, COVER_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not read that image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", COVER_QUALITY);
}

/** The same photo, as a File the ordinary cover-upload route will accept. */
export async function coverDataUrlToFile(dataUrl: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], "cover.jpg", { type: "image/jpeg" });
}
