import Link from "next/link";
import { quotes } from "@/lib/admin/queries";
import { QuoteBoard } from "@/components/admin/QuoteBoard";
import { QUOTE_STATUSES } from "@/lib/admin/schemas";

export const dynamic = "force-dynamic";

export default async function AdminQuotes({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const rows = await quotes(status);

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>Quotes</h1>
        <p className="muted">
          Custom jobs — anything outside the flat single-invitation price.
        </p>
      </div>

      <div className="chiprow" style={{ marginBottom: "1.4rem" }}>
        <Link className="chip" aria-pressed={!status} href="/admin/quotes">All</Link>
        {QUOTE_STATUSES.map((s) => (
          <Link
            key={s}
            className="chip"
            aria-pressed={status === s}
            href={`/admin/quotes?status=${s}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <QuoteBoard quotes={rows} />
    </div>
  );
}
