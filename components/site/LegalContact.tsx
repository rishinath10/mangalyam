import { COMPANY } from "@/lib/company";
import { withFigures } from "@/lib/typography";

/**
 * Who to write to, and who they are.
 *
 * The phone line is absent until there is a real number — see lib/company.ts.
 * A contact block on a policy page is how somebody exercises a right, so it
 * lists only routes that actually reach us.
 */
export function LegalContact() {
  return (
    <section className="legal-contact">
      <h2>Contact us</h2>
      <p>
        {COMPANY.legalName} (Registration No. {withFigures(COMPANY.registrationNumber)})
        <br />
        Trading as {COMPANY.brand} · {COMPANY.site}
        <br />
        {COMPANY.country}
      </p>
      <p>
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        {COMPANY.phone && (
          <>
            <br />
            {withFigures(COMPANY.phone)}
          </>
        )}
      </p>
      <p className="dim">
        We answer email. If something has gone wrong with an invitation you have
        already sent out, say so in the subject line and we will treat it as
        urgent — you have guests waiting on it.
      </p>
    </section>
  );
}
