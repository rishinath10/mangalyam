import type { Entitlement } from "@prisma/client";
import { db } from "@/lib/db";
import { forbidden } from "@/lib/api";

/**
 * Package tier decides how many ceremony invitations a wedding may hold
 * (CLAUDE.md Section 8). A wedding with no entitlement row has not been paid
 * for yet; it gets a single draft invitation so the customer can try the
 * builder, and publishing is blocked until Phase 7 creates a real entitlement.
 */
export const UNPAID_DRAFT_ALLOWANCE = 1;

export function invitationLimitFor(entitlement: Entitlement | null): number | null {
  if (!entitlement) return UNPAID_DRAFT_ALLOWANCE;
  // null on the row means unlimited (bespoke).
  return entitlement.invitationLimit;
}

export async function assertCanAddInvitation(
  weddingId: string,
  entitlement: Entitlement | null,
): Promise<void> {
  const limit = invitationLimitFor(entitlement);
  if (limit === null) return; // unlimited

  const used = await db.invitation.count({ where: { weddingId } });
  if (used >= limit) {
    throw forbidden(
      entitlement
        ? `Your package includes ${limit} ceremony invitation${limit === 1 ? "" : "s"}. Upgrade to add more.`
        : "Complete your purchase to add more ceremony invitations.",
    );
  }
}

export async function invitationUsage(
  weddingId: string,
  entitlement: Entitlement | null,
) {
  const limit = invitationLimitFor(entitlement);
  const used = await db.invitation.count({ where: { weddingId } });
  return { used, limit, remaining: limit === null ? null : Math.max(0, limit - used) };
}
