import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { COMPANY } from "@/lib/company";

export const metadata = {
  title: `Admin · ${COMPANY.brand}`,
  // Belt and braces: this surface should never be indexed even if it somehow
  // became reachable without a session.
  robots: { index: false, follow: false },
};

/**
 * Every page under /admin renders inside this layout, so the guard here covers
 * the whole surface. The queries in lib/admin/queries.ts guard again on their
 * own — this layout decides what is *rendered*, and that file decides what is
 * *read*, which is the half that matters if a page is ever added without one.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let email: string;
  try {
    ({ email } = await requireAdmin());
  } catch {
    // requireAdmin throws a 404-shaped ApiError; in a page that becomes a real
    // 404, so a non-admin cannot tell the admin area exists at all.
    notFound();
  }

  return (
    <div className="tone-dark dash-shell">
      <header className="dash-bar">
        <div className="dash-bar-in">
          <Link href="/admin" className="nav-brand">
            <span className="wm">{COMPANY.wordmark}</span>
            <span className="tg">Owner</span>
          </Link>
          <nav className="admin-nav">
            <Link href="/admin">Overview</Link>
            <Link href="/admin/customers">Customers</Link>
            <Link href="/admin/designs">Designs</Link>
            <Link href="/admin/quotes">Quotes</Link>
          </nav>
          {/* Out of the nav: this leaves the admin area rather than moving
              around inside it, so it is a button and not a fourth tab. */}
          <Link href="/dashboard" className="btn btn-line btn-sm admin-leave">
            My dashboard
          </Link>
          <span className="dim dash-email">{email}</span>
          <SignOutButton />
        </div>
      </header>

      <div className="dash-body">{children}</div>
    </div>
  );
}
