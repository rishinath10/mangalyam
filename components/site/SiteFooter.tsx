import Link from "next/link";

const DESIGNS = ["Kanjivaram", "Mahal", "Gopuram", "Jali", "Mayil", "Kolam"];
const CEREMONIES = ["Mehendi", "Haldi", "Sangeet", "Muhurtham", "Nalangu", "Reception"];

export function SiteFooter() {
  return (
    <footer className="tone-dark border-t border-[var(--edge)]">
      <div className="foot">
        <div className="about">
          <Link href="/#top" className="nav-brand">
            <span className="wm">Mangalyam</span>
            <span className="tg">Celebrations that last a lifetime</span>
          </Link>
          <p>
            Digital wedding invitations for Malaysian Indian families. One wedding,
            an invitation for every ceremony.
          </p>
        </div>

        <div>
          <h4>Designs</h4>
          <ul>
            {DESIGNS.map((d) => (
              <li key={d}><Link href="/#designs">{d}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Ceremonies</h4>
          <ul>
            {CEREMONIES.map((c) => (
              <li key={c}><Link href="/#ceremonies">{c}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Mangalyam</h4>
          <ul>
            <li><Link href="/#how">How it works</Link></li>
            <li><Link href="/#pricing">Pricing</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
            <li><Link href="/login">Sign in</Link></li>
          </ul>
        </div>
      </div>

      <div className="foot-btm">
        <div>
          <span>© <span className="num">2026</span> Mangalyam · mangalyam.my</span>
          <span className="r">Made in Malaysia</span>
        </div>
      </div>
    </footer>
  );
}
