import Link from "next/link";
import { notFound } from "next/navigation";
import { customerDetail } from "@/lib/admin/queries";
import { humanise, ringgit, shortDate } from "@/lib/admin/format";
import { EventActions } from "@/components/admin/EventActions";
import { InvitationFrame } from "@/components/admin/InvitationFrame";

export const dynamic = "force-dynamic";

export default async function AdminCustomer({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await customerDetail(userId);
  if (!user) notFound();

  return (
    <div className="wrap">
      <p className="crumb">
        <Link href="/admin/customers">← Customers</Link>
      </p>

      <div className="page-head">
        <h1>{user.name || user.email}</h1>
        <p className="muted">
          {user.email} · joined {shortDate(user.createdAt)} · {user.events.length}{" "}
          {user.events.length === 1 ? "event" : "events"}
        </p>
      </div>

      {user.events.length === 0 && (
        <p className="muted">This customer has not created an event yet.</p>
      )}

      {user.events.map((event) => {
        const paid = event.purchases.filter((p) => p.status === "paid");
        const limit = event.entitlement?.invitationLimit ?? 0;

        return (
          <section className="panel" key={event.id} style={{ marginBottom: "1.6rem" }}>
            <div className="panel-head">
              <div>
                <h2>{event.hostNames}</h2>
                <p className="muted">
                  {humanise(event.eventType)} · created {shortDate(event.createdAt)}
                </p>
              </div>
              <div className="r">
                <span className="dim" style={{ fontSize: "var(--t-sm)" }}>
                  {event.invitations.length} of {limit || "0"} invitation
                  {limit === 1 ? "" : "s"} used
                </span>
              </div>
            </div>

            {/* Entitlement is the thing support actually has to fix: a payment
                that succeeded at the gateway but never created a row leaves a
                paying customer unable to publish. */}
            <EventActions
              eventId={event.id}
              invitationLimit={limit}
              hasEntitlement={Boolean(event.entitlement)}
            />

            <h3 className="sub">Purchases</h3>
            {event.purchases.length === 0 ? (
              <p className="muted">None. This event has never reached checkout.</p>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Gateway ref</th>
                      <th className="r">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.purchases.map((p) => (
                      <tr key={p.id}>
                        <td className="num">{shortDate(p.createdAt)}</td>
                        <td><span className={`pill pill-${p.status}`}>{p.status}</span></td>
                        <td className="dim mono">{p.paymentGatewayRef || "—"}</td>
                        <td className="r num">{ringgit(p.amountSen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {paid.length > 0 && (
              <p className="dim" style={{ fontSize: "var(--t-xs)", marginTop: ".5rem" }}>
                Paid total {ringgit(paid.reduce((n, p) => n + p.amountSen, 0))}
              </p>
            )}

            <h3 className="sub">Invitations</h3>
            {event.invitations.length === 0 ? (
              <p className="muted">None yet.</p>
            ) : (
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Link</th>
                      <th>Status</th>
                      <th>Design</th>
                      <th>Frame</th>
                      <th className="r">RSVPs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.invitations.map((inv) => (
                      <tr key={inv.id}>
                        <td className="mono">
                          {inv.status === "published" ? (
                            <a href={`/i/${inv.slug}`} target="_blank" rel="noreferrer">
                              /i/{inv.slug}
                            </a>
                          ) : (
                            /* A draft has no public page, and the builder is
                               ownership-scoped — an admin opening it would get
                               a 404, so there is deliberately no link here. */
                            <span className="dim">/i/{inv.slug}</span>
                          )}
                        </td>
                        <td><span className={`pill pill-${inv.status}`}>{inv.status}</span></td>
                        <td className="dim">
                          {inv.templateId}
                          {inv.ceremonyType ? ` · ${humanise(inv.ceremonyType)}` : ""}
                        </td>
                        <td>
                          <InvitationFrame invitationId={inv.id} frameUrl={inv.frameUrl} />
                        </td>
                        <td className="r num">{inv._count.rsvps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
