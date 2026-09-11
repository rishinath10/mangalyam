import Link from "next/link";
import { BUILT_TEMPLATES } from "@/lib/templates/registry";
import type { TemplateManifest } from "@/lib/templates/types";
import { COMPANY } from "@/lib/company";
import { withFigures } from "@/lib/typography";

// Read from the resolved design list rather than repeating the names here:
// this list had gone stale once already, advertising six designs that no
// longer existed, and it now has to include designs added from /admin/designs
// as well as the ones written in code.
// Occasions, not wedding ceremonies: this column sat next to a designs list
// that covers all seven event types while naming only a wedding's rituals.
const OCCASIONS = [
  "Weddings",
  "Housewarmings",
  "Naming Ceremonies",
  "60th Birthdays",
  "Temple Consecrations",
  "Home Poojas",
];

export function SiteFooter({ designs }: { designs?: TemplateManifest[] }) {
  /**
   * Falls back to the code registry when the caller has not resolved the full
   * list. That is not laziness: this footer sits on the policy pages, which
   * are prerendered at build time, and there is no DATABASE_URL during the
   * Docker build. A footer that insisted on reading the database would take
   * the whole deploy down to list one extra design name.
   */
  const families = designs?.filter((d) => d.built) ?? BUILT_TEMPLATES;
  return (
    <footer className="tone-dark border-t border-[var(--edge)]">
      <div className="foot">
        <div className="about">
          <Link href="/#top" className="nav-brand">
            <span className="wm">Mangalyam</span>
            <span className="tg">Celebrations that last a lifetime</span>
          </Link>
          <p>
            E-invitations for Malaysian Indian families — weddings, naming
            ceremonies, housewarmings, temple consecrations and the community
            celebrations in between.
          </p>
        </div>

        <div>
          <h4>Designs</h4>
          <ul>
            {families.map((d) => (
              <li key={d.templateId}><Link href="/#designs">{d.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Occasions</h4>
          <ul>
            {OCCASIONS.map((c) => (
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
            <li><Link href="/create">Create an invitation</Link></li>
            <li><Link href="/login">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/refunds">Refund Policy</Link></li>
            <li><a href={`mailto:${COMPANY.email}`}>Contact us</a></li>
          </ul>
        </div>
      </div>

      <div className="foot-btm">
        <div>
          <span>© <span className="num">2026</span> Mangalyam · mangalyam.my</span>
          <span className="r">Made in Malaysia</span>
        </div>
        {/* Quiet, and at the very bottom: a customer is buying an invitation,
            not the company behind it. It still has to be findable and exact —
            the registration number is what makes the trader identifiable. */}
        <p className="foot-entity">
          {COMPANY.brand} is a brand of {COMPANY.legalName} (
          {withFigures(COMPANY.registrationNumber)}).
        </p>
      </div>
    </footer>
  );
}
