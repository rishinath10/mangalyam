import Link from "next/link";
import { customers } from "@/lib/admin/queries";
import { shortDate } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const rows = await customers(q);

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>Customers</h1>
        <p className="muted">{rows.length} shown, newest first.</p>
      </div>

      {/* A GET form: the search term stays in the URL, so a support tab can be
          reloaded or shared without retyping it. */}
      <form className="admin-search" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name or email"
          aria-label="Search customers"
        />
        <button className="btn btn-line" type="submit">Search</button>
        {q && <Link className="btn btn-line" href="/admin/customers">Clear</Link>}
      </form>

      {rows.length === 0 ? (
        <p className="muted" style={{ marginTop: "1.4rem" }}>
          {q ? `Nobody matches “${q}”.` : "No customers yet."}
        </p>
      ) : (
        <div className="tbl-wrap" style={{ marginTop: "1.4rem" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th className="r">Events</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Link href={`/admin/customers/${u.id}`}>{u.name || "—"}</Link>
                  </td>
                  <td className="dim">{u.email}</td>
                  <td className="r num">{u._count.events}</td>
                  <td className="num">{shortDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
