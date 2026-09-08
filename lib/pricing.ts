/**
 * One flat price for one invitation, full stop (CLAUDE.md Section 8 pivot) —
 * no public tiers or bundles. Anything beyond the standard single invitation
 * (a second ceremony, bespoke design work) is a conversation, not a checkout.
 */
export const STANDARD_ENTITLEMENT = { invitationLimit: 1 } as const;

export const CURRENCY = process.env.PAYMENT_CURRENCY ?? "myr";

/**
 * The price lives in the environment, never in the codebase — the brief
 * leaves the ringgit figure open, and an unset price must stop checkout
 * loudly rather than quietly charging the wrong amount or zero.
 */
export function priceSen(): number {
  const raw = process.env.PRICE_STANDARD_SEN;
  const value = Number(raw);
  if (!raw || !Number.isInteger(value) || value <= 0) {
    throw new Error(
      "PRICE_STANDARD_SEN is not set to a positive integer number of sen. " +
        "Set it before selling invitations.",
    );
  }
  return value;
}

/** True once a price is actually configured — used to hide checkout otherwise. */
export function isPurchasable(): boolean {
  try {
    priceSen();
    return true;
  } catch {
    return false;
  }
}
