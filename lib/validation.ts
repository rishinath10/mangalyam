import { z } from "zod";
import { CEREMONY_TYPES } from "@/lib/ceremonies";
import { EVENT_TYPES } from "@/lib/events";
import { FONT_PAIRING_KEYS } from "@/lib/templates/fonts";

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
  // Palette and pairing keys, never a hex or a font name — the route checks
  // the key against the chosen family's own manifest before it is stored.
  accentKey: z.string().trim().max(40).nullish(),
  fontPairing: z.enum(FONT_PAIRING_KEYS).nullish(),
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

/**
 * A bank account number as Malaysian banks print it: digits, sometimes broken
 * up with spaces or dashes. Kept strict rather than free text because this
 * string is displayed on a public page and offered to guests to copy — a
 * number that arrives looking like anything else is a mistake worth catching
 * while the host can still see the field they typed it into.
 */
const accountNumber = z
  .string()
  .trim()
  .min(5, "That account number looks too short")
  .max(34)
  .regex(/^[0-9][0-9 -]*$/, "Use digits, spaces and dashes only");

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

  // Gift money. `giftQrUrl` is deliberately not here: the image is written
  // only by the upload route, so no client can aim a public page's <img> at a
  // host of its own choosing.
  giftsEnabled: z.boolean().optional(),
  giftNote: z.string().trim().max(240).nullish(),
  giftBankName: z.string().trim().max(60).nullish(),
  giftAccountName: z.string().trim().max(80).nullish(),
  giftAccountNumber: accountNumber.nullish(),
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

/**
 * What the create wizard sends when a visitor finishes and signs in: the whole
 * invitation in one request, because until this moment none of it existed
 * anywhere but their browser.
 *
 * The cover photo is deliberately not here. It goes up afterwards through the
 * ordinary cover route, so image decoding keeps happening in exactly one place
 * with one set of size and type limits.
 */
export const draftClaimSchema = z.object({
  eventType: z.enum(EVENT_TYPES),
  hostNames: z.string().trim().min(1, "Tell us who this is for").max(120),
  ceremonyType: z.enum(CEREMONY_TYPES).nullish(),
  customCeremonyName: z.string().trim().max(60).nullish(),
  templateId: z.string().trim().min(1),
  accentKey: z.string().trim().max(40).nullish(),
  fontPairing: z.enum(FONT_PAIRING_KEYS).nullish(),
  date: isoDate.nullish(),
  startTime: hhmm.nullish(),
  endTime: hhmm.nullish(),
  venueName: z.string().trim().max(120).nullish(),
  address: z.string().trim().max(400).nullish(),
  mapLink: httpUrl.nullish(),
  description: z.string().trim().max(1200).nullish(),
  schedule: z.array(scheduleItemSchema).max(30).default([]),
  settings: settingsUpdateSchema.default({}),
});

/**
 * A design added from the admin screen.
 *
 * Colours are hex strings here rather than palette keys, which is the one
 * place in the product that is true: for the coded families a customer picks
 * a key so the palette can be retuned later and every invitation follows,
 * but a design created through a form has nowhere else for its colours to
 * live. The keys are generated from the names on the way in.
 */
const designHex = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex colour, like #A81A2C");

export const designTokensSchema = z.object({
  surface: designHex,
  surfaceAlt: designHex,
  ink: designHex,
  inkMuted: designHex,
  rule: designHex,
  brand: designHex,
  brandDeep: designHex,
  gold: designHex,
  radius: z.string().trim().max(12),
  motionIntensity: z.number().min(0).max(2),
});

export const designCreateSchema = z.object({
  name: z.string().trim().min(1, "Give the design a name").max(40),
  tagline: z.string().trim().min(1, "Say what it is, in a few words").max(80),
  eventTypes: z.array(z.enum(EVENT_TYPES)).min(1, "Choose at least one occasion"),
  accents: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        hex: designHex,
      }),
    )
    .min(1, "A design needs at least one accent colour")
    .max(8),
  fontPairing: z.enum(FONT_PAIRING_KEYS),
  tokens: designTokensSchema,
  groundFit: z.enum(["tile", "cover"]).optional(),
  groundVeil: z.number().min(0).max(1).optional(),
  published: z.boolean().optional(),
});

export const designUpdateSchema = designCreateSchema.partial();

export const rsvpCreateSchema = z.object({
  guestName: z.string().trim().min(1, "Please tell us your name").max(80),
  attending: z.boolean(),
  guestCount: z.number().int().min(0).max(30).optional(),
  mealPreference: z.string().trim().max(40).nullish(),
  message: z.string().trim().max(500).nullish(),
});
