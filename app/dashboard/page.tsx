import Link from "next/link";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/ownership";
import { invitationLimitFor } from "@/lib/entitlements";
import { CreateWeddingForm } from "@/components/dashboard/CreateWeddingForm";

export const metadata = { title: "Your weddings · Mangalyam" };

export default async function DashboardPage() {
  const userId = await requireUserId();

  // A wedding is the owned, billed unit — the dashboard lists weddings, and
  // ceremony invitations live one level down inside each.
  const weddings = await db.wedding.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      entitlement: true,
      _count: { select: { invitations: true } },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-neutral-900">
            Your weddings
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Each wedding holds a separate invitation for every ceremony.
          </p>
        </div>
      </div>

      {weddings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-neutral-900">
            Start with the couple
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            Create your wedding first, then add an invitation for each ceremony —
            Mehendi, Haldi, Reception and the rest.
          </p>
          <div className="mx-auto mt-6 max-w-sm text-left">
            <CreateWeddingForm />
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weddings.map((wedding) => {
              const limit = invitationLimitFor(wedding.entitlement);
              return (
                <li key={wedding.id}>
                  <Link
                    href={`/dashboard/weddings/${wedding.id}`}
                    className="block h-full rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-[#D9C5A0] hover:shadow-sm"
                  >
                    <h2 className="font-[family-name:var(--font-display)] text-xl text-neutral-900">
                      {wedding.coupleName1} &amp; {wedding.coupleName2}
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">
                      {wedding._count.invitations} of{" "}
                      {limit === null ? "unlimited" : limit} ceremony invitation
                      {wedding._count.invitations === 1 ? "" : "s"}
                    </p>
                    {!wedding.entitlement && (
                      <p className="mt-3 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
                        Purchase pending
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 max-w-sm rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-medium text-neutral-900">
              Add another wedding
            </h2>
            <div className="mt-4">
              <CreateWeddingForm />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
