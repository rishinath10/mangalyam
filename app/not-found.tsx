import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Page not found", robots: { index: false } };

/**
 * A 404 in the product's own voice.
 *
 * This route also answers for an invitation link that does not resolve, which
 * is the common case and the one worth writing for: somebody was sent a link,
 * it does not work, and the useful thing to tell them is to go back to whoever
 * invited them rather than to explain HTTP.
 */
export default function NotFound() {
  return (
    <div className="tone-dark">
      <main className="legal" style={{ minHeight: "62vh" }}>
        <h1>This page is not here</h1>
        <p className="legal-lede">
          The link may have a typo in it, or the invitation it pointed to may
          have been taken down by whoever made it.
        </p>
        <p>
          If someone sent you this link for an event, the quickest fix is to ask
          them for it again — an invitation&rsquo;s address can be changed by
          its owner, and an old one stops working when it is.
        </p>
        <p style={{ marginTop: "2rem" }}>
          <Link className="btn btn-gold" href="/">
            Go to {COMPANY.brand}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
