import Link from "next/link";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/ownership";
import { invitationLimitFor } from "@/lib/entitlements";
import { withFigures } from "@/lib/typography";
import { CreateWeddingForm } from "@/components/dashboard/CreateWeddingForm";

export const metadata = { title: "Your weddings" };

export default async function DashboardPage() {
  const userId = await requireUserId();

  // A wedding is the owned, billed unit — this lists weddings, and ceremony
  // invitations live one level down inside each.
  const weddings = await db.wedding.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { entitlement: true, _count: { select: { invitations: true } } },
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Your weddings</h1>
          <p>Each wedding holds a separate invitation for every ceremony.</p>
        </div>
      </div>

      {weddings.length === 0 ? (
        <div className="t empty">
          <h2>Start with the couple</h2>
          <p>
            Create your wedding first, then add an invitation for each ceremony —
            Mehendi, Haldi, Muhurtham and the rest.
          </p>
          <div style={{ maxWidth: "26rem", margin: "1.6rem auto 0", textAlign: "left" }}>
            <CreateWeddingForm />
          </div>
        </div>
      ) : (
        <>
          <div className="bento">
            {weddings.map((wedding) => {
              const limit = invitationLimitFor(wedding.entitlement);
              const used = wedding._count.invitations;
              return (
                <Link
                  key={wedding.id}
                  href={`/dashboard/weddings/${wedding.id}`}
                  className="t t--lift c4"
                >
                  <h2 style={{ fontSize: "var(--t-xl)" }}>
                    {wedding.coupleName1} &amp; {wedding.coupleName2}
                  </h2>
                  <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".6rem" }}>
                    {withFigures(String(used))} of{" "}
                    {limit === null ? "unlimited" : withFigures(String(limit))} ceremony
                    invitation{used === 1 ? "" : "s"}
                  </p>
                  {!wedding.entitlement && (
                    <span className="pill pill-draft" style={{ marginTop: "1rem" }}>
                      Purchase pending
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="t" style={{ maxWidth: "30rem", marginTop: "2.4rem" }}>
            <h2 style={{ fontSize: "var(--t-md)" }}>Add another wedding</h2>
            <div style={{ marginTop: "1.1rem" }}>
              <CreateWeddingForm />
            </div>
          </div>
        </>
      )}
    </>
  );
}
