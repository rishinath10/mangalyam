import { z } from "zod";

/**
 * Admin write payloads.
 *
 * These are validated exactly as strictly as customer input. An admin form is
 * still a browser request, and being signed in as the owner does not make a
 * malformed body safe to hand to Prisma.
 */

export const QUOTE_STATUSES = ["new", "quoted", "accepted", "declined", "delivered"] as const;

/** Ringgit in, sen out: the database never sees a float. */
const ringgitToSen = z
  .number()
  .nonnegative()
  .max(1_000_000)
  .transform((v) => Math.round(v * 100));

export const quoteCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal("")).transform((v) => v || null),
  phone: z.string().trim().max(40).optional().or(z.literal("")).transform((v) => v || null),
  occasion: z.string().trim().max(160).optional().or(z.literal("")).transform((v) => v || null),
  details: z.string().trim().min(1).max(4000),
  amount: ringgitToSen.nullable().optional(),
  status: z.enum(QUOTE_STATUSES).default("new"),
  notes: z.string().trim().max(4000).optional().or(z.literal("")).transform((v) => v || null),
});

export const quoteUpdateSchema = quoteCreateSchema.partial();

/**
 * Re-granting an invitation allowance after a failed payment or as part of a
 * custom job. Capped: self-serve is one, and a typo here is the difference
 * between fixing an account and handing out unlimited invitations.
 */
export const entitlementSchema = z.object({
  eventId: z.string().uuid(),
  invitationLimit: z.number().int().min(0).max(20),
});

export const slugSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only"),
});
