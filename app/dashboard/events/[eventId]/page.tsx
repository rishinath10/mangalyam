import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { isAdmin } from "@/lib/auth/admin";
import { requireEvent } from "@/lib/auth/ownership";
import { CONTACT_MESSAGE, invitationUsage } from "@/lib/entitlements";
import { ceremonyLabel } from "@/lib/ceremonies";
import { EVENT_TYPE_LABELS } from "@/lib/events";
import { formatShortDate, formatTimeRange } from "@/lib/format";
import { isPurchasable } from "@/lib/pricing";
import { resolveAccentColor } from "@/lib/templates/registry";
import { withFigures } from "@/lib/typography";
import { AddInvitationForm } from "@/components/dashboard/AddInvitationForm";
import { PurchasePanel } from "@/components/dashboard/PurchasePanel";

type Params = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
};

export default async function EventPage({ params, searchParams }: Params) {
  const { eventId } = await params;
  const query = await searchParams;

  // requireEvent throws a 404 ApiError for an event the caller does not own;
  // in a page that has to become Next's notFound(), not a JSON body.
  let event;
  try {
    ({ event } = await requireEvent(eventId));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const usage = await invitationUsage(event.id, event.entitlement);
  const admin = await isAdmin();
  const invitations = await db.invitation.findMany({
    where: { eventId: event.id },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { rsvps: true } } },
  });

  const canAdd = usage.remaining > 0;

  return (
    <>
      <Link href="/dashboard" className="crumb">
        ← All events
      </Link>

      <div className="page-head" style={{ marginTop: "1rem" }}>
        <div>
          <p className="kick">{EVENT_TYPE_LABELS[event.eventType]}</p>
          <h1 style={{ marginTop: ".3rem" }}>{event.hostNames}</h1>
          <p>
            {withFigures(String(usage.used))} of {withFigures(String(usage.limit))} invitation
            {usage.used === 1 ? "" : "s"} used
            {!event.entitlement && " · purchase pending"}
          </p>
        </div>
      </div>

      {query.paid && !event.entitlement && (
        <p className="notice notice-good" style={{ marginBottom: "1.5rem" }}>
          Payment received. Bank transfers can take a few minutes to confirm — this page
          will update as soon as it clears.
        </p>
      )}
      {query.cancelled && (
        <p className="notice notice-bad" style={{ marginBottom: "1.5rem" }}>
          Checkout was cancelled. Nothing has been charged.
        </p>
      )}

      {!event.entitlement && (
        <section style={{ marginBottom: "2.6rem" }}>
          <h2 style={{ fontSize: "var(--t-md)", marginBottom: "1rem" }}>Pay to publish</h2>
          <p className="muted" style={{ fontSize: "var(--t-sm)", marginBottom: "1.2rem", maxWidth: "56ch" }}>
            You can build and preview without paying. Payment is what lets you publish and
            share — one payment for this event, no subscription.
          </p>
          {/* An admin can publish this already. The checkout stays on the page
              rather than being hidden, because testing it is the other half of
              why the account exists. */}
          {admin && (
            <p className="notice notice-good" style={{ marginBottom: "1.2rem" }}>
              Publishing is unlocked on this account, so you can go live without paying.
              Checkout below still works if you want to test it end to end.
            </p>
          )}
          <PurchasePanel eventId={event.id} purchasable={isPurchasable()} />
        </section>
      )}

      <h2 style={{ fontSize: "var(--t-md)", marginBottom: "1rem" }}>Invitations</h2>

      {invitations.length === 0 ? (
        <p className="t dim" style={{ fontSize: "var(--t-sm)" }}>
          No invitation yet. Add it below.
        </p>
      ) : (
        <div className="stack">
          {invitations.map((invitation) => {
            const accent = resolveAccentColor(
              invitation.templateId,
              invitation.ceremonyType,
              invitation.accentKey,
            );
            const label = invitation.ceremonyType
              ? ceremonyLabel(invitation.ceremonyType, invitation.customCeremonyName)
              : EVENT_TYPE_LABELS[event.eventType];
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
                  <b>{label}</b>
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
        <h2 style={{ fontSize: "var(--t-md)" }}>Add an invitation</h2>
        {canAdd ? (
          <div style={{ marginTop: "1.2rem" }}>
            <AddInvitationForm eventId={event.id} eventType={event.eventType} />
          </div>
        ) : (
          <p className="notice notice-bad" style={{ marginTop: "1rem" }}>
            {event.entitlement ? CONTACT_MESSAGE : "Complete your purchase to add an invitation."}
          </p>
        )}
      </div>
    </>
  );
}
