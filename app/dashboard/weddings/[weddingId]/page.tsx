import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { requireWedding } from "@/lib/auth/ownership";
import { invitationUsage } from "@/lib/entitlements";
import { ceremonyLabel } from "@/lib/ceremonies";
import { formatShortDate, formatTimeRange } from "@/lib/format";
import { resolveAccentColor } from "@/lib/templates/registry";
import { withFigures } from "@/lib/typography";
import { AddInvitationForm } from "@/components/dashboard/AddInvitationForm";
import { PurchasePanel } from "@/components/dashboard/PurchasePanel";
import { PACKAGE_ENTITLEMENTS, PACKAGE_NAMES, isPurchasable } from "@/lib/packages";

type Params = {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
};

const TIER_COPY = {
  essential: ["Standard designs", "Unlimited RSVPs", "Gallery, timeline and countdown", "WhatsApp sharing"],
  signature: ["Everything in Essential", "All designs, premium included", "Background music", "Meal preferences for your caterer"],
  bespoke: ["Everything in Signature", "A card drawn for you by hand", "Mangalyam branding removed", "Priority support"],
} as const;

export default async function WeddingPage({ params, searchParams }: Params) {
  const { weddingId } = await params;
  const query = await searchParams;

  // requireWedding throws a 404 ApiError for a wedding the caller does not
  // own; in a page that has to become Next's notFound(), not a JSON body.
  let wedding;
  try {
    ({ wedding } = await requireWedding(weddingId));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const usage = await invitationUsage(wedding.id, wedding.entitlement);
  const invitations = await db.invitation.findMany({
    where: { weddingId: wedding.id },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { rsvps: true } } },
  });

  const canAdd = usage.remaining === null || usage.remaining > 0;

  return (
    <>
      <Link href="/dashboard" className="crumb">
        ← All weddings
      </Link>

      <div className="page-head" style={{ marginTop: "1rem" }}>
        <div>
          <h1>
            {wedding.coupleName1} &amp; {wedding.coupleName2}
          </h1>
          <p>
            {withFigures(String(usage.used))} of{" "}
            {usage.limit === null ? "unlimited" : withFigures(String(usage.limit))} ceremony
            invitation{usage.used === 1 ? "" : "s"} used
            {!wedding.entitlement && " · purchase pending"}
          </p>
        </div>
      </div>

      {query.paid && !wedding.entitlement && (
        <p className="notice notice-good" style={{ marginBottom: "1.5rem" }}>
          Payment received. Bank transfers can take a few minutes to confirm — this page
          will show your package as soon as it clears.
        </p>
      )}
      {query.cancelled && (
        <p className="notice notice-bad" style={{ marginBottom: "1.5rem" }}>
          Checkout was cancelled. Nothing has been charged.
        </p>
      )}

      {!wedding.entitlement && (
        <section style={{ marginBottom: "2.6rem" }}>
          <h2 style={{ fontSize: "var(--t-md)", marginBottom: "1rem" }}>Choose a package</h2>
          <p className="muted" style={{ fontSize: "var(--t-sm)", marginBottom: "1.2rem", maxWidth: "56ch" }}>
            You can build and preview without paying. A package is what lets you publish
            and share — one payment for this wedding, no subscription.
          </p>
          <PurchasePanel
            weddingId={wedding.id}
            tiers={(["essential", "signature", "bespoke"] as const).map((pkg) => {
              const limit = PACKAGE_ENTITLEMENTS[pkg].invitationLimit;
              return {
                pkg,
                name: PACKAGE_NAMES[pkg],
                inc:
                  limit === null
                    ? "Unlimited ceremony invitations"
                    : `${limit} ceremony invitation${limit === 1 ? "" : "s"}`,
                items: [...TIER_COPY[pkg]],
                feature: pkg === "signature",
                purchasable: isPurchasable(pkg),
              };
            })}
          />
        </section>
      )}

      <h2 style={{ fontSize: "var(--t-md)", marginBottom: "1rem" }}>Ceremonies</h2>

      {invitations.length === 0 ? (
        <p className="t dim" style={{ fontSize: "var(--t-sm)" }}>
          No ceremony invitations yet. Add your first one below.
        </p>
      ) : (
        <div className="stack">
          {invitations.map((invitation) => {
            const accent = resolveAccentColor(
              invitation.templateId,
              invitation.ceremonyType,
              invitation.accentColorOverride,
            );
            const when = [
              formatShortDate(invitation.date ? invitation.date.toISOString().slice(0, 10) : null),
              formatTimeRange(invitation.startTime, invitation.endTime),
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <Link
                key={invitation.id}
                href={`/dashboard/invitations/${invitation.id}`}
                className="t t--lift row-card"
              >
                <span className="swatch" style={{ background: accent }} aria-hidden="true" />
                <span className="body">
                  <b>{ceremonyLabel(invitation.ceremonyType, invitation.customCeremonyName)}</b>
                  <span>{when || "No date set yet"}</span>
                </span>
                {invitation._count.rsvps > 0 && (
                  <span className="dim" style={{ fontSize: "var(--t-sm)", whiteSpace: "nowrap" }}>
                    {withFigures(String(invitation._count.rsvps))} repl
                    {invitation._count.rsvps === 1 ? "y" : "ies"}
                  </span>
                )}
                <span className={`pill ${invitation.status === "published" ? "pill-live" : "pill-draft"}`}>
                  {invitation.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="t" style={{ marginTop: "2.4rem" }}>
        <h2 style={{ fontSize: "var(--t-md)" }}>Add a ceremony</h2>
        {canAdd ? (
          <div style={{ marginTop: "1.2rem" }}>
            <AddInvitationForm weddingId={wedding.id} />
          </div>
        ) : (
          <p className="notice notice-bad" style={{ marginTop: "1rem" }}>
            {wedding.entitlement
              ? `Your package includes ${usage.limit} ceremony invitation${usage.limit === 1 ? "" : "s"}. Upgrade to add more.`
              : "Complete your purchase to add more ceremony invitations."}
          </p>
        )}
      </div>
    </>
  );
}
