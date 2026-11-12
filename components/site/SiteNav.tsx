"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
 * It is meant to be forgotten. At the top of the page it has no background at
 * all, so the hero reads as the page rather than as something under a toolbar.
 * Scrolling down, it slides away and gives the screen back; the first move
 * upward brings it back, which is the moment someone actually wants it.
 */
export function SiteNav({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = scrollY;
      setScrolled(y > 12);
      // A few pixels of slack either way, so a thumb resting on the screen
      // does not make the bar flicker in and out.
      if (y > last.current + 6 && y > 140) setHidden(true);
      else if (y < last.current - 6 || y <= 140) setHidden(false);
      last.current = y;
    };
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
      <header
        className="nav"
        data-scrolled={scrolled ? "" : undefined}
        // Never hidden while the menu is open, or by keyboard focus inside it.
        data-hidden={hidden && !menu ? "" : undefined}
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
