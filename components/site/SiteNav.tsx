"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/company";

/** Four destinations. Everything else is reachable by scrolling. */
const LINKS = [
  { href: "/#designs", label: "Designs" },
  { href: "/#how", label: "How it works" },
  { href: "/#stars", label: "Your star" },
  { href: "/#pricing", label: "Pricing" },
];

/**
 * The site's header: a wordmark, four links and one way in.
 *
 * It stays put. At the top of the page it has no background at all, so the
 * hero reads as the page rather than as something under a toolbar; once the
 * page has moved beneath it, it takes a thin veil so the links stay legible
 * over whatever is passing behind.
 */
export function SiteNav({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 12);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // a sheet that covers the page must not leave the page scrolling behind it
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const cta = signedIn
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/create", label: "Create" };

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header
        className="nav"
        data-scrolled={scrolled ? "" : undefined}
      >
        <div className="nav-in">
          <Link href="/#top" className="nav-brand" aria-label={`${COMPANY.brand} — home`}>
            <span className="wm">{COMPANY.wordmark}</span>
          </Link>

          <nav className="nav-links" aria-label="Site">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
            {!signedIn && <Link href="/login">Sign in</Link>}
          </nav>

          <Link className="nav-cta" href={cta.href}>
            {cta.label}
          </Link>

          <button
            type="button"
            className="nav-burger"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
            data-open={menu ? "" : undefined}
          >
            <span />
          </button>
        </div>
      </header>

      <div className="nav-sheet" data-open={menu ? "" : undefined} inert={!menu}>
        <nav aria-label="Site">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenu(false)}>
              {l.label}
            </Link>
          ))}
          {!signedIn && (
            <Link href="/login" onClick={() => setMenu(false)}>
              Sign in
            </Link>
          )}
          <Link href={signedIn ? "/dashboard" : "/create"} onClick={() => setMenu(false)}>
            {signedIn ? "Your dashboard" : "Create your invitation"}
          </Link>
        </nav>
      </div>
    </>
  );
}
