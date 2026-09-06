"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Arrow } from "./Icons";

const LINKS = [
  { href: "/#top", label: "Home" },
  { href: "/#designs", label: "Designs" },
  { href: "/#ceremonies", label: "Ceremonies" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteNav({ signedIn }: { signedIn: boolean }) {
  const [stuck, setStuck] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(scrollY > 24);
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
    ? { href: "/dashboard", label: "Your dashboard" }
    : { href: "/signup", label: "Create your invitation" };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-[14px] z-[90]">
        <div
          className={`nav-bar ${stuck ? "is-stuck" : ""}`}
          data-stuck={stuck ? "" : undefined}
        >
          <Link href="/#top" className="nav-brand">
            <span className="wm">Mangalyam</span>
            <span className="tg">Celebrations that last a lifetime</span>
          </Link>

          <nav className="nav-links">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <Link className="btn btn-gold" href={cta.href} aria-label={cta.label}>
            <span className="nav-cta-label">{cta.label}</span>
            <Arrow />
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
        <nav>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenu(false)}>
              {l.label}
            </Link>
          ))}
          <Link href={cta.href} onClick={() => setMenu(false)}>
            {cta.label}
          </Link>
        </nav>
      </div>
    </>
  );
}
