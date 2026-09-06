import { z } from "zod";
import { CEREMONY_TYPES } from "@/lib/ceremonies";

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

export const weddingCreateSchema = z.object({
  coupleName1: z.string().trim().min(1, "Enter the first name").max(60),
  coupleName2: z.string().trim().min(1, "Enter the second name").max(60),
});

export const weddingUpdateSchema = weddingCreateSchema.partial();

export const invitationCreateSchema = z.object({
  ceremonyType: z.enum(CEREMONY_TYPES),
  customCeremonyName: z.string().trim().min(1).max(60).optional(),
  templateId: z.string().trim().min(1).optional(),
});

export const invitationUpdateSchema = z.object({
  ceremonyType: z.enum(CEREMONY_TYPES).optional(),
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

export const settingsUpdateSchema = z.object({
  musicEnabled: z.boolean().optional(),
  musicUrl: httpUrl.nullish(),
  countdownEnabled: z.boolean().optional(),
  galleryEnabled: z.boolean().optional(),
  rsvpEnabled: z.boolean().optional(),
  askMealPreference: z.boolean().optional(),
  rsvpCloseDate: isoDate.nullish(),
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
