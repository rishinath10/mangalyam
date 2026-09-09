import type { Entitlement } from "@prisma/client";
import { db } from "@/lib/db";
import { forbidden } from "@/lib/api";

/**
 * Self-serve is always exactly one invitation (CLAUDE.md Section 8) — there
 * are no tiers to size this differently. An event with no entitlement row has
 * not been paid for yet; it gets a single draft invitation so the customer can
 * build and preview the whole thing, and publishing is blocked until checkout
 * creates a real entitlement.
 *
 * The two halves of that sentence are separate checks on purpose, because
 * they answer different questions: `assertCanAddInvitation` asks how many
 * invitations may exist, and `assertCanPublish` asks whether any of them may
 * be public. Reading the draft allowance as a publish allowance is what let an
 * unpaid event publish once — the whole free half of the product is the
 * building, never the publishing.
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

/**
 * The paywall, and the only place it lives.
 *
 * An event with no entitlement can publish nothing at all, whatever its draft
 * allowance. With one, the limit is what was actually bought, counted against
 * invitations that are already live.
 */
export async function assertCanPublish(
  eventId: string,
  entitlement: Entitlement | null,
): Promise<void> {
  if (!entitlement) {
    throw forbidden("Complete your purchase to publish this invitation.");
  }
  const live = await db.invitation.count({
    where: { eventId, status: "published" },
  });
  if (live >= entitlement.invitationLimit) throw forbidden(CONTACT_MESSAGE);
}

export async function invitationUsage(eventId: string, entitlement: Entitlement | null) {
  const limit = invitationLimitFor(entitlement);
  const used = await db.invitation.count({ where: { eventId } });
  return { used, limit, remaining: Math.max(0, limit - used) };
}
