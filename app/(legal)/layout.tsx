import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { COMPANY } from "@/lib/company";

/**
 * The legal pages share a plain reading layout: one column, generous measure,
 * no ornament. Somebody reaches these because they want an answer about their
 * money or their data, and decoration between them and it is an obstacle.
 */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="tone-dark">
      <header className="wz-bar">
        <div className="wz-bar-in">
          <Link href="/" className="nav-brand">
            <span className="wm">{COMPANY.wordmark}</span>
            <span className="tg">Celebrations that last a lifetime</span>
          </Link>
          <Link href="/create" className="btn btn-line btn-sm wz-bar-alt">
            Create an invitation
          </Link>
        </div>
      </header>

      <main className="legal">
        {children}

        <nav className="legal-more" aria-label="Other policies">
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/refunds">Refund Policy</Link>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
