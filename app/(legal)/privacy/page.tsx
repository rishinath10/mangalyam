import { COMPANY } from "@/lib/company";
import { LegalHead } from "@/components/site/LegalHead";
import { LegalContact } from "@/components/site/LegalContact";
import { withFigures } from "@/lib/typography";

export const metadata = {
  title: "Privacy Policy",
  description:
    "What Mangalyam.my collects, why, who sees it, and how to have it deleted. Written for the Malaysian Personal Data Protection Act 2010.",
};

export default function PrivacyPage() {
  return (
    <>
      <LegalHead
        title="Privacy Policy"
        summary="What we collect, why we have it, who can see it, and how to get it back or have it deleted."
      />

      <section>
        <p>
          This policy covers {COMPANY.site} and is written to meet the Malaysian
          Personal Data Protection Act 2010 (PDPA). The data user is{" "}
          {COMPANY.legalName} (Registration No.{" "}
          {withFigures(COMPANY.registrationNumber)}), which trades as{" "}
          {COMPANY.brand}.
        </p>
        <p>
          Two different people appear in this policy and they are treated
          differently: the <b>host</b>, who buys an invitation and builds it,
          and the <b>guest</b>, who opens the link the host sends them. A guest
          never has an account with us and did not choose us — the host did — so
          we hold as little about them as the product allows.
        </p>
      </section>

      <section>
        <h2>What we collect from hosts</h2>
        <ul>
          <li>
            <b>Your account.</b> Email address, a password (stored only as a
            bcrypt hash — we cannot read it, and neither can anyone who obtains
            the database), optionally your name, and the date you signed up.
          </li>
          <li>
            <b>What you put in the invitation.</b> The names of whoever is
            celebrating, the occasion, dates and times, venue name and address,
            your schedule, your message to guests, and a contact name and phone
            number if you add one.
          </li>
          <li>
            <b>Photographs you upload.</b> Cover photo and gallery images. Every
            upload is re-encoded on arrival, which strips the embedded camera
            metadata — including GPS coordinates — before it is stored. We do
            that whether or not you ask.
          </li>
          <li>
            <b>Gift details, if you switch them on.</b> Bank name, account
            holder name, account number and any payment QR image you upload.
            Read the warning under &ldquo;What is public&rdquo; below before you
            use this.
          </li>
          <li>
            <b>Payment records.</b> The amount, the currency, whether it
            succeeded, and the reference our payment processor gives us. We
            never see or store your card number, CVV or banking credentials —
            those go straight to the processor and never touch our servers.
          </li>
        </ul>
      </section>

      <section>
        <h2>What we collect from guests</h2>
        <p>
          Only what a guest types into the reply form: their name, whether they
          are coming, how many people they are bringing, a meal preference if
          the host asked for one, and a message if they leave one.
        </p>
        <p>
          We do not ask a guest for an email address, we do not track them
          across the web, and we do not build a profile of them. Opening an
          invitation does not create an account or a record.
        </p>
      </section>

      <section>
        <h2>What is public</h2>
        <p>
          A published invitation is a web page at an unlisted address. Anyone
          holding the link can open it — which is the point, because that link
          gets forwarded around family groups. It is unlisted, not private, and
          we ask search engines not to index it, but you should treat anything
          on the page as visible to anyone the link reaches.
        </p>
        <p>On that page, these are public:</p>
        <ul>
          <li>The names, occasion, date, venue and address you entered.</li>
          <li>Your photographs.</li>
          <li>
            The contact name and phone number you chose to show guests.
          </li>
          <li>
            Guest names and their messages, if a guest leaves one — a guest is
            told this next to the field before they type.
          </li>
          <li>
            Your gift and bank details, if you switched that section on. This is
            the one to think hardest about: an account number on a link that
            travels through WhatsApp groups is an account number a great many
            people can copy. The editor says so at the point you enter it.
          </li>
        </ul>
        <p>
          These are <b>never</b> public: who is attending, how many they are
          bringing, and what they eat. That is the host&rsquo;s list, and the
          public page is built so it cannot be read off it, even by counting.
        </p>
      </section>

      <section>
        <h2>Why we hold it</h2>
        <ul>
          <li>
            <b>To provide what you bought</b> — build the invitation, publish it,
            show it to your guests, collect the replies.
          </li>
          <li>
            <b>To take payment</b> and keep the record of it, which we are also
            required to keep for tax purposes.
          </li>
          <li>
            <b>To support you</b> when you write to us about your own account.
          </li>
        </ul>
        <p>
          We do not sell personal data. We do not share it with advertisers. We
          do not use it to train anything. There is no advertising on
          {" "}{COMPANY.site}.
        </p>
      </section>

      <section>
        <h2>Who else sees it</h2>
        <p>Three kinds of third party, and no others:</p>
        <ul>
          <li>
            <b>Our payment processor</b> handles the card or online banking
            transaction. You are on their page when you pay; they send us back
            only whether it worked and a reference.
          </li>
          <li>
            <b>Our hosting and storage provider</b> runs the servers the site and
            your uploaded images sit on.
          </li>
          <li>
            <b>Anyone we are legally required to disclose to</b> — a court order,
            or a lawful request from a Malaysian authority.
          </li>
        </ul>
        <p>
          Your data may be stored or processed outside Malaysia by those
          providers. By using the service you consent to that transfer, which
          the PDPA permits where it is necessary to perform the contract you
          have with us.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          We set one cookie, and only after you sign in: it keeps you signed in
          as you move between pages. There are no analytics cookies, no
          advertising cookies and no third-party trackers on this site. Fonts
          are served from our own servers rather than fetched from Google, so
          reading a page here does not tell anyone else that you did.
        </p>
        <p>
          The invitation builder also keeps an unfinished draft in your own
          browser&rsquo;s local storage so you do not lose it on a refresh. That
          stays on your device until the invitation is saved to an account or
          you clear it.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <ul>
          <li>
            <b>While your account exists</b>, we keep your account and your
            invitations, because you may want to look at them again — people
            come back to an invitation years later.
          </li>
          <li>
            <b>Delete an invitation</b> and its photographs and its replies go
            with it.
          </li>
          <li>
            <b>Ask us to close your account</b> and we delete everything within
            30 days, except payment records, which we keep for seven years
            because Malaysian tax law requires it.
          </li>
        </ul>
      </section>

      <section>
        <h2>Your rights under the PDPA</h2>
        <p>You can ask us, at any time, to:</p>
        <ul>
          <li>give you a copy of the personal data we hold about you;</li>
          <li>correct anything that is wrong or out of date;</li>
          <li>delete your account and the data in it;</li>
          <li>
            stop processing your data, or withdraw a consent you gave us —
            though if you withdraw the consent we need to run the service, we
            will not be able to keep your invitation online.
          </li>
        </ul>
        <p>
          Email us and we will answer within 21 days, which is the period the
          PDPA sets. We may ask you to confirm who you are first, which is a
          protection for you rather than an obstacle.
        </p>
        <p>
          <b>If you are a guest</b> and a host has published your name or your
          message on an invitation, ask the host first — they can edit or
          remove it themselves, immediately. If they will not, write to us and
          we will remove it.
        </p>
      </section>

      <section>
        <h2>Security, honestly stated</h2>
        <p>
          Passwords are hashed, uploads are stripped of camera metadata and
          re-encoded, every request for something you own is checked against
          your account before it is answered, and payment credentials never
          reach us. No one can promise a system is unbreakable, and we are not
          going to. What we can tell you is what we hold and how little of it
          there is, which is on this page.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The service is not for under-18s to buy. Invitations frequently
          celebrate children — a naming ceremony, a first birthday — and a
          parent who publishes their own child&rsquo;s name and photograph is
          making that decision for their family, as they would with a printed
          card.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we change this policy we will change the date at the top. If the
          change is significant — new categories of data, a new class of
          recipient — we will email account holders rather than rely on you
          noticing.
        </p>
      </section>

      <LegalContact />
    </>
  );
}
