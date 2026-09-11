import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { LegalHead } from "@/components/site/LegalHead";
import { LegalContact } from "@/components/site/LegalContact";
import { withFigures } from "@/lib/typography";

export const metadata = {
  title: "Terms of Service",
  description:
    "The agreement between you and Art Engine My Solutions for using Mangalyam.my.",
};

export default function TermsPage() {
  return (
    <>
      <LegalHead
        title="Terms of Service"
        summary="The agreement between you and the company behind Mangalyam.my. Short, and in plain words."
      />

      <section>
        <p>
          These terms are between you and {COMPANY.legalName} (Registration No.{" "}
          {withFigures(COMPANY.registrationNumber)}), a company registered in{" "}
          {COMPANY.country} which trades as {COMPANY.brand} at {COMPANY.site}.
          &ldquo;We&rdquo; and &ldquo;us&rdquo; mean that company. Using the site
          means you accept them.
        </p>
      </section>

      <section>
        <h2>What you are buying</h2>
        <p>
          A digital invitation: a web page at your own link, which you build
          yourself, publish when you are ready, and send to your guests. One
          payment, one invitation, no subscription. The price is shown before
          you pay and includes any tax we are required to charge.
        </p>
        <p>
          A wedding holds a separate invitation for each ceremony, and each one
          is bought separately. Anything outside that — several ceremonies at
          once, bespoke artwork — is quoted as custom work rather than sold
          through the checkout.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>
            You must be {withFigures("18")} or older to buy, and the details you
            give us must be true.
          </li>
          <li>
            Keep your password to yourself. Anything done from your account is
            treated as done by you, so tell us at once if you think someone else
            has got in.
          </li>
          <li>One person, one account. Do not share logins.</li>
        </ul>
      </section>

      <section>
        <h2>What you put on an invitation</h2>
        <p>
          Your words and your photographs stay yours. You keep every right in
          them. You give us only the permission we need to run the service:
          to store your content, resize your images, and show the page to
          whoever opens your link.
        </p>
        <p>
          We will not use your invitation as an example, in marketing, or
          anywhere else, without asking you first.
        </p>
        <p>By uploading, you confirm that:</p>
        <ul>
          <li>it is yours to upload, or you have permission;</li>
          <li>
            the people in your photographs are content to appear on a page you
            are about to send around;
          </li>
          <li>
            it is not unlawful, obscene, defamatory, or an infringement of
            somebody else&rsquo;s copyright;
          </li>
          <li>
            you are not using an invitation as a front for something else —
            collecting money under false pretences, or anything a reasonable
            person would call a scam.
          </li>
        </ul>
        <p>
          We do not read your invitations as a matter of course. If something is
          reported to us and it breaks these rules, we will take it down, and
          we will tell you why.
        </p>
      </section>

      <section>
        <h2>Gift and bank details</h2>
        <p>
          If you switch on the gift section, the bank details and QR code you
          enter are shown on a public page to anyone holding your link. You
          choose to publish them and you are responsible for them being correct.
        </p>
        <p>
          We are not a party to any gift a guest sends you. Money goes directly
          from your guest to your bank — it never passes through us, we take no
          fee on it, and we cannot recover, reverse or trace it. If you type the
          wrong account number, the money goes to whoever owns that account.
          Check it twice.
        </p>
      </section>

      <section>
        <h2>Guests and their replies</h2>
        <p>
          Replies your guests leave belong to the invitation and you can see,
          export and delete them. Treat what your guests tell you the way you
          would treat anything they told you in person: their attendance, their
          headcount, and what they eat are theirs, not material for anything
          else.
        </p>
        <p>
          A message a guest leaves appears on the invitation page. Both of you
          are told this before it is typed.
        </p>
      </section>

      <section>
        <h2>What we promise, and what we do not</h2>
        <p>
          We will keep the service running and your invitation reachable, and we
          will fix faults as quickly as we can. What we cannot promise is that
          it will never be down: the internet, hosting providers and payment
          processors all fail sometimes, and anyone who tells you otherwise is
          selling something.
        </p>
        <p>
          If our service fails and your invitation is unreachable, our
          responsibility is to fix it or refund you — see the{" "}
          <Link href="/refunds">Refund Policy</Link>. To the extent Malaysian law
          allows, our total liability to you is limited to what you paid us for
          the invitation concerned, and we are not liable for indirect losses
          such as a guest not turning up. Nothing here limits liability for
          death, personal injury, or fraud, because that cannot be limited.
        </p>
      </section>

      <section>
        <h2>Keeping your invitation online</h2>
        <p>
          We intend to keep published invitations online for as long as we
          operate. If we ever have to close the service, we will give account
          holders at least {withFigures("90")} days&rsquo; notice by email and a
          way to download what you made. We will not simply switch it off.
        </p>
      </section>

      <section>
        <h2>Ending it</h2>
        <p>
          You can close your account at any time by writing to us. We may
          suspend or close an account that breaks these terms, that is used
          fraudulently, or that publishes something unlawful — normally after
          telling you and giving you a chance to put it right, and immediately
          where the content is seriously harmful or unlawful.
        </p>
      </section>

      <section>
        <h2>The rest</h2>
        <ul>
          <li>
            <b>Our own work stays ours.</b> The designs, artwork, code and the{" "}
            {COMPANY.brand} name belong to us. Buying an invitation does not
            let you resell a design or run a competing service on it.
          </li>
          <li>
            <b>Changes.</b> If we change these terms we will change the date at
            the top, and email account holders if the change matters. Continuing
            to use the service means accepting the new version.
          </li>
          <li>
            <b>Law.</b> These terms are governed by Malaysian law, and the
            Malaysian courts have jurisdiction. If any part is found
            unenforceable, the rest still stands.
          </li>
          <li>
            <b>Before a court, please just email us.</b> Almost everything is
            faster to fix that way.
          </li>
        </ul>
      </section>

      <section>
        <p className="dim">
          See also our <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/refunds">Refund Policy</Link>, which form part of this
          agreement.
        </p>
      </section>

      <LegalContact />
    </>
  );
}
