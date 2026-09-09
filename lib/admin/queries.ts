import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

/**
 * The cross-user reads.
 *
 * Every export here calls requireAdmin() itself rather than trusting its
 * caller to have done it. That is one redundant session lookup per query, and
 * worth it: these are the only queries in the codebase with no ownership
 * predicate, so "the page forgot to guard" must not be a way to read them.
 * If you add a function to this file, guard it the same way.
 */

/** Money only ever leaves this module already summed, in sen. */
export type Money = { sen: number };

export async function overview() {
  await requireAdmin();

  const [paid, pending, refunded, users, events, published, rsvps, openQuotes] =
    await Promise.all([
      db.purchase.aggregate({ where: { status: "paid" }, _sum: { amountSen: true }, _count: true }),
      db.purchase.count({ where: { status: "pending" } }),
      db.purchase.aggregate({ where: { status: "refunded" }, _sum: { amountSen: true }, _count: true }),
      db.user.count(),
      db.event.count(),
      db.invitation.count({ where: { status: "published" } }),
      db.rsvp.count(),
      db.quote.count({ where: { status: { in: ["new", "quoted"] } } }),
    ]);

  return {
    revenueSen: paid._sum.amountSen ?? 0,
    paidCount: paid._count,
    pendingCount: pending,
    refundedSen: refunded._sum.amountSen ?? 0,
    refundedCount: refunded._count,
    users,
    events,
    published,
    rsvps,
    openQuotes,
  };
}

/** Paid purchases newest first — the ledger behind the revenue figure. */
export async function recentPurchases(limit = 20) {
  await requireAdmin();
  return db.purchase.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      event: { select: { id: true, hostNames: true, eventType: true, user: { select: { id: true, email: true, name: true } } } },
    },
  });
}

/**
 * Customer list. `q` matches email or name, case-insensitively.
 *
 * Counts come from _count rather than loading the rows: a customer with a
 * large gallery should not pull every photo into a list page.
 */
export async function customers(q?: string, limit = 50) {
  await requireAdmin();
  const term = q?.trim();
  return db.user.findMany({
    where: term
      ? {
          OR: [
            { email: { contains: term, mode: "insensitive" } },
            { name: { contains: term, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: { select: { events: true } },
    },
  });
}

/** One customer, deep enough to answer a support question without a second trip. */
export async function customerDetail(userId: string) {
  await requireAdmin();
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      events: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          hostNames: true,
          eventType: true,
          createdAt: true,
          entitlement: true,
          purchases: { orderBy: { createdAt: "desc" } },
          invitations: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              slug: true,
              status: true,
              templateId: true,
              ceremonyType: true,
              createdAt: true,
              // Frame artwork is fitted from this page — self-serve no longer
              // offers it, so the admin table is the only place it is visible.
              frameUrl: true,
              _count: { select: { rsvps: true } },
            },
          },
        },
      },
    },
  });
}

export async function quotes(status?: string) {
  await requireAdmin();
  const valid = ["new", "quoted", "accepted", "declined", "delivered"] as const;
  const filter = valid.find((s) => s === status);
  return db.quote.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

/** Signups and published invitations per day, for the platform-health strip. */
export async function activity(days = 30) {
  await requireAdmin();
  const since = new Date(Date.now() - days * 86_400_000);

  const [users, invitations, rsvps] = await Promise.all([
    db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.invitation.findMany({
      where: { publishedAt: { gte: since } },
      select: { publishedAt: true },
    }),
    db.rsvp.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  // Bucket by UTC day. The series is short and this keeps the query portable
  // rather than pushing date_trunc through $queryRaw.
  const key = (d: Date) => d.toISOString().slice(0, 10);
  const buckets = new Map<string, { day: string; signups: number; published: number; rsvps: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const day = key(new Date(Date.now() - i * 86_400_000));
    buckets.set(day, { day, signups: 0, published: 0, rsvps: 0 });
  }
  // A row can sit just outside the window (the `since` cutoff is a timestamp,
  // the buckets are whole days), so a miss is expected and simply skipped.
  const bump = (d: Date | null, field: "signups" | "published" | "rsvps") => {
    if (!d) return;
    const bucket = buckets.get(key(d));
    if (bucket) bucket[field]++;
  };
  for (const u of users) bump(u.createdAt, "signups");
  for (const i of invitations) bump(i.publishedAt, "published");
  for (const r of rsvps) bump(r.createdAt, "rsvps");

  return [...buckets.values()];
}
