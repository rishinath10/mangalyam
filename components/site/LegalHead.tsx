import { COMPANY } from "@/lib/company";
import { withFigures } from "@/lib/typography";

/** The heading every policy page opens with, so the date is never forgotten. */
export function LegalHead({ title, summary }: { title: string; summary: string }) {
  return (
    <header className="legal-head">
      <h1>{title}</h1>
      <p className="legal-lede">{summary}</p>
      <p className="legal-date">
        Last updated {withFigures(COMPANY.policiesUpdated)}
      </p>
    </header>
  );
}
