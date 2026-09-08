import type { Entitlement } from "@prisma/client";
import { db } from "@/lib/db";
import { forbidden } from "@/lib/api";

/**
 * Self-serve is always exactly one invitation (CLAUDE.md Section 8) — there
 * are no tiers to size this differently. An event with no entitlement row has
 * not been paid for yet; it gets a single draft invitation so the customer
 * can try the builder, and publishing is blocked until checkout creates a
 * real entitlement.
 */
export const UNPAID_DRAFT_ALLOWANCE = 1;

/** Where to send someone who has used their one self-serve invitation. */
export const CONTACT_MESSAGE =
  "Need another ceremony, or something custom? Contact us and we'll quote it directly.";

export function invitationLimitFor(entitlement: Entitlement | null): number {
  return entitlement?.invitationLimit ?? UNPAID_DRAFT_ALLOWANCE;
}

export async function assertCanAddInvitation(
  eventId: string,
  entitlement: Entitlement | null,
): Promise<void> {
  const limit = invitationLimitFor(entitlement);
  const used = await db.invitation.count({ where: { eventId } });
  if (used >= limit) {
    throw forbidden(entitlement ? CONTACT_MESSAGE : "Complete your purchase to add an invitation.");
  }
}

export async function invitationUsage(eventId: string, entitlement: Entitlement | null) {
  const limit = invitationLimitFor(entitlement);
  const used = await db.invitation.count({ where: { eventId } });
  return { used, limit, remaining: Math.max(0, limit - used) };
}
