import { z } from "zod";
import { CEREMONY_TYPES } from "@/lib/ceremonies";
import { EVENT_TYPES } from "@/lib/events";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour like #8A1C1C");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD");

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time, e.g. 14:30");

/**
 * Only http(s) links are accepted for map links and music: a stored
 * `javascript:` URL would become a rendered anchor on a public page.
 */
const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), "Must be an http(s) link");

export const eventCreateSchema = z.object({
  hostNames: z.string().trim().min(1, "Tell us who this is for").max(120),
  eventType: z.enum(EVENT_TYPES),
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const invitationCreateSchema = z.object({
  // Only meaningful for a wedding event; ignored (and stored as null) for
  // every other occasion, which has no ceremony to choose.
  ceremonyType: z.enum(CEREMONY_TYPES).optional(),
  customCeremonyName: z.string().trim().min(1).max(60).optional(),
  templateId: z.string().trim().min(1).optional(),
});

export const invitationUpdateSchema = z.object({
  ceremonyType: z.enum(CEREMONY_TYPES).nullish(),
  customCeremonyName: z.string().trim().max(60).nullish(),
  templateId: z.string().trim().min(1).optional(),
  accentColorOverride: hexColor.nullish(),
  date: isoDate.nullish(),
  startTime: hhmm.nullish(),
  endTime: hhmm.nullish(),
  venueName: z.string().trim().max(120).nullish(),
  address: z.string().trim().max(400).nullish(),
  mapLink: httpUrl.nullish(),
  description: z.string().trim().max(1200).nullish(),
  coverPhotoUrl: httpUrl.nullish(),
});

export const OPENING_STYLES = ["doors", "envelope", "veil"] as const;

/**
 * A phone number is only ever rendered inside `tel:` and displayed as typed,
 * so the guard is on shape, not on Malaysian numbering: no spaces-only
 * strings, nothing that could carry a scheme or markup into the href.
 */
const phone = z
  .string()
  .trim()
  .min(6, "That number looks too short")
  .max(24)
  .regex(/^\+?[0-9][0-9 ()-]*$/, "Use digits, spaces, brackets and dashes only");

export const settingsUpdateSchema = z.object({
  musicEnabled: z.boolean().optional(),
  musicUrl: httpUrl.nullish(),
  countdownEnabled: z.boolean().optional(),
  galleryEnabled: z.boolean().optional(),
  rsvpEnabled: z.boolean().optional(),
  askMealPreference: z.boolean().optional(),
  rsvpCloseDate: isoDate.nullish(),
  openingStyle: z.enum(OPENING_STYLES).optional(),
  openingText: z.string().trim().max(24).nullish(),
  autoScroll: z.boolean().optional(),
  contactName: z.string().trim().max(60).nullish(),
  contactPhone: phone.nullish(),
});

export const scheduleItemSchema = z.object({
  time: hhmm,
  title: z.string().trim().min(1, "Give this step a title").max(80),
  description: z.string().trim().max(300).nullish(),
});

/** Whole-list replace: the builder reorders by drag, so sending the full
 *  ordered array is simpler and more consistent than patching sort_order. */
export const scheduleReplaceSchema = z.object({
  items: z.array(scheduleItemSchema).max(30),
});

export const photoUpdateSchema = z.object({
  caption: z.string().trim().max(120).nullish(),
  sortOrder: z.number().int().min(0).max(200).optional(),
});

export const photoReorderSchema = z.object({
  ids: z.array(z.string().uuid()).max(60),
});

export const rsvpCreateSchema = z.object({
  guestName: z.string().trim().min(1, "Please tell us your name").max(80),
  attending: z.boolean(),
  guestCount: z.number().int().min(0).max(30).optional(),
  mealPreference: z.string().trim().max(40).nullish(),
  message: z.string().trim().max(500).nullish(),
});
