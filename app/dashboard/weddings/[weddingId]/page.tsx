import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { requireWedding } from "@/lib/auth/ownership";
import { invitationUsage } from "@/lib/entitlements";
import { ceremonyLabel } from "@/lib/ceremonies";
import { formatShortDate, formatTimeRange } from "@/lib/format";
import { resolveAccentColor } from "@/lib/templates/registry";
import { AddInvitationForm } from "@/components/dashboard/AddInvitationForm";

type Params = { params: Promise<{ weddingId: string }> };

export default async function WeddingPage({ params }: Params) {
  const { weddingId } = await params;

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
  });

  const canAdd = usage.remaining === null || usage.remaining > 0;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link
        href="/dashboard"
        className="text-sm text-neutral-500 transition hover:text-neutral-900"
      >
        ← All weddings
      </Link>

      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-neutral-900">
        {wedding.coupleName1} &amp; {wedding.coupleName2}
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500">
        {usage.used} of {usage.limit === null ? "unlimited" : usage.limit} ceremony
        invitation{usage.used === 1 ? "" : "s"} used
        {!wedding.entitlement && " · purchase pending"}
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-900">Ceremonies</h2>

        {invitations.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
            No ceremony invitations yet. Add your first one below.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {invitations.map((invitation) => {
              const accent = resolveAccentColor(
                invitation.templateId,
                invitation.ceremonyType,
                invitation.accentColorOverride,
              );
              const when = [
                formatShortDate(
                  invitation.date ? invitation.date.toISOString().slice(0, 10) : null,
                ),
                formatTimeRange(invitation.startTime, invitation.endTime),
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <li key={invitation.id}>
                  <Link
                    href={`/dashboard/invitations/${invitation.id}`}
                    className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-[#D9C5A0] hover:shadow-sm"
                  >
                    <span
                      className="h-9 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-neutral-900">
                        {ceremonyLabel(
                          invitation.ceremonyType,
                          invitation.customCeremonyName,
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-neutral-500">
                        {when || "No date set yet"}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                        invitation.status === "published"
                          ? "bg-green-50 text-green-800"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {invitation.status}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-medium text-neutral-900">Add a ceremony</h2>
        {canAdd ? (
          <div className="mt-4">
            <AddInvitationForm weddingId={wedding.id} />
          </div>
        ) : (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            {wedding.entitlement
              ? `Your package includes ${usage.limit} ceremony invitation${usage.limit === 1 ? "" : "s"}. Upgrade to add more.`
              : "Complete your purchase to add more ceremony invitations."}
          </p>
        )}
      </section>
    </main>
  );
}
