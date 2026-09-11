import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { LegalHead } from "@/components/site/LegalHead";
import { LegalContact } from "@/components/site/LegalContact";
import { withFigures } from "@/lib/typography";

export const metadata = {
  title: "Refund Policy",
  description:
    "When Mangalyam refunds an invitation, when it does not, and how to ask.",
};

export default function RefundsPage() {
  return (
    <>
      <LegalHead
        title="Refund Policy"
        summary="Before you publish, a refund is yours for the asking. After you publish, it depends on whether the fault is ours."
      />

      <section>
        <p>
          You pay once, for one invitation, and there is no subscription to
          cancel. The line that matters for refunds is <b>publishing</b> — the
          moment your invitation gets a live link you can send to people.
        </p>
      </section>

      <section>
        <h2>Before you publish — full refund</h2>
        <p>
          Changed your mind, went with a printed card, the family decided
          something else: email us within <b>{withFigures("14")} days</b> of
          paying and we refund the whole amount. You do not have to give a
          reason and we will not ask for one.
        </p>
      </section>

      <section>
        <h2>After you publish — it depends</h2>
        <p>
          Once the invitation is live it has been delivered, and it is in the
          nature of the thing that it has probably already gone out to people.
          So the general answer is no refund. The exceptions are real ones:
        </p>
        <ul>
          <li>
            <b>It does not work and we cannot fix it.</b> If your invitation is
            broken or unreachable because of a fault on our side, tell us. We
            will try to fix it first, quickly, because that is what you actually
            want at that point. If we cannot, you get your money back in full.
          </li>
          <li>
            <b>It is materially not what was described.</b> If what you received
            is not what this site said you would get, you get your money back.
          </li>
          <li>
            <b>You were charged twice, or charged the wrong amount.</b> We refund
            the difference without argument. You do not need to prove anything —
            our records will show it.
          </li>
          <li>
            <b>Someone used your card without permission.</b> Tell us and tell
            your bank. We will refund and cooperate with their investigation.
          </li>
        </ul>
      </section>

      <section>
        <h2>What is not a refund</h2>
        <p>Said plainly, so nobody finds out at a bad moment:</p>
        <ul>
          <li>
            <b>The event was cancelled or postponed.</b> We are sorry, genuinely,
            but the invitation was made and delivered. Tell us anyway — we would
            rather move the date on your invitation for free than take your
            money for something you cannot use.
          </li>
          <li>
            <b>You typed the wrong date, name or venue.</b> You can correct these
            yourself at any time, including after publishing, and the link stays
            the same. That is most of what you are paying for.
          </li>
          <li>
            <b>You do not like a design as much as you expected.</b> You can
            change design, colour and lettering yourself, for free, as often as
            you like — before or after publishing.
          </li>
          <li>
            <b>Guests did not reply.</b> We give you the form and the page. We
            cannot make your relatives answer it.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to ask</h2>
        <p>
          Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> from the
          address on your account, and say what happened. That is the whole
          process — there is no form.
        </p>
        <ul>
          <li>We reply within {withFigures("3")} working days.</li>
          <li>
            Approved refunds go back to the card or account you paid from. We
            cannot send it anywhere else — that is the payment processor&rsquo;s
            rule, not ours, and it exists to stop fraud.
          </li>
          <li>
            Your bank then takes {withFigures("5")}–{withFigures("10")} working
            days to show it. That part is out of our hands.
          </li>
        </ul>
      </section>

      <section>
        <h2>Custom work</h2>
        <p>
          Bespoke design work quoted separately is not covered by this policy —
          the terms are agreed in the quote itself, because a job that starts
          with someone drawing for a week cannot have the same cancellation
          terms as a template.
        </p>
      </section>

      <section>
        <p className="dim">
          This policy does not affect the rights you have under the Consumer
          Protection Act 1999 or any other Malaysian law. Where they give you
          more than this page does, they win. See also our{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </section>

      <LegalContact />
    </>
  );
}
