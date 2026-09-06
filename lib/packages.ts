import type { Package } from "@prisma/client";

/**
 * What each package grants. This is structure, which the brief fixes
 * (CLAUDE.md Section 8) — a null invitation limit means unlimited.
 */
export const PACKAGE_ENTITLEMENTS: Record<
  Package,
  {
    invitationLimit: number | null;
    premiumTemplates: boolean;
    giftRegistry: boolean;
    customDomain: boolean;
    removeBranding: boolean;
  }
> = {
  essential: {
    invitationLimit: 1,
    premiumTemplates: false,
    giftRegistry: false,
    customDomain: false,
    removeBranding: false,
  },
  signature: {
    invitationLimit: 4,
    premiumTemplates: true,
    giftRegistry: false,
    customDomain: false,
    removeBranding: false,
  },
  bespoke: {
    invitationLimit: null,
    premiumTemplates: true,
    giftRegistry: true,
    customDomain: true,
    removeBranding: true,
  },
};

export const PACKAGE_NAMES: Record<Package, string> = {
  essential: "Essential",
  signature: "Signature",
  bespoke: "Bespoke",
};

export const CURRENCY = process.env.PAYMENT_CURRENCY ?? "myr";

const PRICE_ENV: Record<Package, string> = {
  essential: "PRICE_ESSENTIAL_SEN",
  signature: "PRICE_SIGNATURE_SEN",
  bespoke: "PRICE_BESPOKE_SEN",
};

/**
 * Prices live in the environment, never in the codebase — the brief leaves
 * the ringgit figures open (Section 14) and an unset price must stop checkout
 * loudly rather than quietly charging the wrong amount or zero.
 */
export function priceSen(pkg: Package): number {
  const raw = process.env[PRICE_ENV[pkg]];
  const value = Number(raw);
  if (!raw || !Number.isInteger(value) || value <= 0) {
    throw new Error(
      `${PRICE_ENV[pkg]} is not set to a positive integer number of sen. ` +
        `Set it before selling the ${pkg} package.`,
    );
  }
  return value;
}

/** True when a package can actually be sold — used to hide unpriced tiers. */
export function isPurchasable(pkg: Package): boolean {
  try {
    priceSen(pkg);
    return true;
  } catch {
    return false;
  }
}
