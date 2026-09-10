import Link from "next/link";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/ownership";
import { invitationLimitFor } from "@/lib/entitlements";
import { EVENT_TYPE_LABELS } from "@/lib/events";
import { withFigures } from "@/lib/typography";

export const metadata = { title: "Your events" };

export default async function DashboardPage() {
  const userId = await requireUserId();

  // An event is the owned, billed unit — this lists events, and invitations
  // live one level down inside each (a wedding may hold several, one per
  // ceremony; every other occasion holds exactly one).
  const events = await db.event.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { entitlement: true, _count: { select: { invitations: true } } },
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Your events</h1>
          <p>A wedding holds a separate invitation for every ceremony. Every other occasion holds one.</p>
        </div>
      </div>

      {/* There is one way to start an invitation, and it is the same one a
          visitor with no account uses: the wizard at /create. Keeping a second,
          shorter form here would mean two flows to hold in step with each
          other, and the short one always drifts behind. */}
      {events.length === 0 ? (
        <div className="t empty">
          <h2>Nothing here yet</h2>
          <p>
            Build an e-invitation for any event you are holding — see it working
            on your own phone before you decide anything.
          </p>
          <div style={{ marginTop: "1.6rem" }}>
            <Link className="btn btn-gold" href="/create">
              Create an invitation
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="bento">
            {events.map((event) => {
              const limit = invitationLimitFor(event.entitlement);
              const used = event._count.invitations;
              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="t t--lift c4"
                >
                  <p className="kick">{EVENT_TYPE_LABELS[event.eventType]}</p>
                  <h2 style={{ fontSize: "var(--t-xl)", marginTop: ".4rem" }}>{event.hostNames}</h2>
                  <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".6rem" }}>
                    {withFigures(String(used))} of {withFigures(String(limit))} invitation
                    {used === 1 ? "" : "s"}
                  </p>
                  {!event.entitlement && (
                    <span className="pill pill-draft" style={{ marginTop: "1rem" }}>
                      Purchase pending
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="t" style={{ maxWidth: "30rem", marginTop: "2.4rem" }}>
            <h2 style={{ fontSize: "var(--t-md)" }}>Another occasion</h2>
            <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".6rem" }}>
              Each occasion is billed on its own, and starts the same way the
              first one did.
            </p>
            <div style={{ marginTop: "1.2rem" }}>
              <Link className="btn btn-line" href="/create">
                Start another invitation
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
