import Link from "next/link";
import { activity, overview, recentPurchases } from "@/lib/admin/queries";
import { humanise, ringgit, shortDate } from "@/lib/admin/format";
import { isPurchasable } from "@/lib/pricing";

// Money and signups must never be served from a cached render.
export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [stats, purchases, days] = await Promise.all([
    overview(),
    recentPurchases(15),
    activity(30),
  ]);

  const peak = Math.max(1, ...days.map((d) => d.signups + d.published + d.rsvps));

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>Overview</h1>
        <p className="muted">Everything across every customer.</p>
      </div>

      {!isPurchasable() && (
        <p className="notice notice-bad" style={{ marginBottom: "1.4rem" }}>
          <b>PRICE_STANDARD_SEN is not set.</b> Checkout is disabled until it is, so
          no new purchase can be created.
        </p>
      )}

      <div className="stat-row">
        <div className="stat">
          <span className="stat-k">Revenue</span>
          <b className="stat-v num">{ringgit(stats.revenueSen)}</b>
          <span className="stat-n">{stats.paidCount} paid</span>
        </div>
        <div className="stat">
          <span className="stat-k">Awaiting payment</span>
          <b className="stat-v num">{stats.pendingCount}</b>
          <span className="stat-n">started checkout, not completed</span>
        </div>
        <div className="stat">
          <span className="stat-k">Refunded</span>
          <b className="stat-v num">{ringgit(stats.refundedSen)}</b>
          <span className="stat-n">{stats.refundedCount} refunds</span>
        </div>
        <div className="stat">
          <span className="stat-k">Open quotes</span>
          <b className="stat-v num">{stats.openQuotes}</b>
          <span className="stat-n">
            <Link href="/admin/quotes">new or quoted →</Link>
          </span>
        </div>
      </div>

      <div className="stat-row" style={{ marginTop: "1rem" }}>
        <div className="stat">
          <span className="stat-k">Customers</span>
          <b className="stat-v num">{stats.users}</b>
        </div>
        <div className="stat">
          <span className="stat-k">Events</span>
          <b className="stat-v num">{stats.events}</b>
        </div>
        <div className="stat">
          <span className="stat-k">Published</span>
          <b className="stat-v num">{stats.published}</b>
        </div>
        <div className="stat">
          <span className="stat-k">RSVPs</span>
          <b className="stat-v num">{stats.rsvps}</b>
        </div>
      </div>

      <section className="panel" style={{ marginTop: "2rem" }}>
        <h2>Last 30 days</h2>
        {/* A plain stacked bar per day: three series, one scale, no library. */}
        <div className="spark" role="img" aria-label="Daily signups, publishes and RSVPs over the last thirty days">
          {days.map((d) => {
            const total = d.signups + d.published + d.rsvps;
            return (
              <span
                key={d.day}
                className="spark-col"
                title={`${d.day}: ${d.signups} signups, ${d.published} published, ${d.rsvps} RSVPs`}
              >
                <i className="s-rsvp" style={{ height: `${(d.rsvps / peak) * 100}%` }} />
                <i className="s-pub" style={{ height: `${(d.published / peak) * 100}%` }} />
                <i className="s-up" style={{ height: `${(d.signups / peak) * 100}%` }} />
                {total === 0 && <i className="s-nil" />}
              </span>
            );
          })}
        </div>
        <div className="spark-key">
          <span><i className="s-up" /> Signups</span>
          <span><i className="s-pub" /> Published</span>
          <span><i className="s-rsvp" /> RSVPs</span>
        </div>
      </section>

      <section className="panel" style={{ marginTop: "1.6rem" }}>
        <h2>Recent purchases</h2>
        {purchases.length === 0 ? (
          <p className="muted">No purchases yet.</p>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th className="r">Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="num">{shortDate(p.createdAt)}</td>
                    <td>
                      <Link href={`/admin/customers/${p.event.user.id}`}>
                        {p.event.user.name || p.event.user.email}
                      </Link>
                    </td>
                    <td>
                      {p.event.hostNames}
                      <span className="dim"> · {humanise(p.event.eventType)}</span>
                    </td>
                    <td>
                      <span className={`pill pill-${p.status}`}>{p.status}</span>
                    </td>
                    <td className="r num">{ringgit(p.amountSen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
