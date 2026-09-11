import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { withFigures } from "@/lib/typography";
import { CEREMONY_LABELS } from "@/lib/ceremonies";
import { EVENT_TYPES, EVENT_TYPE_BLURBS, EVENT_TYPE_LABELS } from "@/lib/events";
import { allManifestsOrCoded } from "@/lib/templates/design-store";
import type { TemplateManifest } from "@/lib/templates/types";
import { EventIcon } from "@/components/site/EventIcon";
import { TodayPanchangam } from "@/components/site/TodayPanchangam";
import { Constellation } from "@/components/site/Constellation";
import { DesignCard } from "@/components/site/DesignCard";
import { Arrow, Tick } from "@/components/site/Icons";
import { priceLabel } from "@/lib/pricing";
import { OPENING_STYLES } from "@/lib/validation";
import { Particles } from "@/components/site/Particles";
import { Reveal } from "@/components/site/Reveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

const STEPS = [
  {
    n: "01",
    h: "Tell us who is celebrating",
    p: "The names, the occasion, where and when. The invitation assembles itself beside you as you answer, so you always see what you are making.",
  },
  {
    n: "02",
    h: "Pick a design, make it yours",
    p: "Add your photograph, choose an accent colour and a lettering pairing, write the words in your own voice. The layout stays as it was drawn.",
  },
  {
    n: "03",
    h: "Send it, and let guests reply",
    p: "One link, straight into WhatsApp. Guests RSVP themselves and your headcount updates as they answer.",
  },
];

/**
 * One price, one invitation. There are no public tiers — anything beyond a
 * single standard invitation is a conversation, not a checkout, so it lives
 * beside the price rather than as a bigger box next to it.
 */
const INCLUDED = [
  "Both design families, every accent and lettering pairing",
  "Unlimited RSVPs and a live headcount",
  "Gallery, timeline, countdown and background music",
  "WhatsApp sharing, and edits after you publish",
];

const FAQ = [
  {
    q: "Do guests need an account to RSVP?",
    a: "No. They open the link, type their name and tap reply. Nothing to download, nothing to sign up for.",
  },
  {
    q: "Can I change details after sending the invitation?",
    a: "Yes, and the link stays the same. Edit the venue or the time and every guest who opens it sees the new version — including the ones who opened it yesterday.",
  },
  {
    q: "What if I need more than one invitation?",
    a: "A wedding often wants one per ceremony, and some families want several occasions in a season. That is a custom quote — message us and we price it directly, rather than pushing you into a package.",
  },
  {
    q: "Is this only for weddings?",
    // "Mangalyam" here is the word, not the platform — it keeps its bare
    // form on purpose. The whole answer is about what the word means.
    a: "No. Mangalyam means auspicious, not wedding. Housewarmings, naming ceremonies, sixtieth birthdays, temple consecrations, home poojas and open houses all have their own designs.",
  },
  {
    q: "Can we use Tamil on the invitation?",
    a: "Not yet. English only at launch — Tamil is the next language we add, and it needs proper typesetting rather than a machine translation.",
  },
  {
    q: "How do guests receive it?",
    a: "A WhatsApp link with a preview card showing the names, the occasion and your cover photograph. You can also copy the link or share it any other way.",
  },
];

const SAMPLE_COUPLE = "Ashwin & Kalyani";
const SAMPLE_HOST = "The Kumar Family";

/**
 * Counted, not asserted. This used to be a hardcoded 108 that multiplied
 * families by wedding ceremonies — arithmetic the pivot invalidated and
 * nobody would have noticed. It now counts what a customer actually chooses
 * between: for each design, its own palette times the lettering shortlist,
 * times the openings. Add a design or retune a palette and the headline
 * follows on its own.
 */
function distinctLooks(designs: TemplateManifest[]): number {
  return (
    designs.reduce((n, d) => n + d.accents.length * d.fontPairings.length, 0) *
    OPENING_STYLES.length
  );
}

/** "Two", "Three" — a gallery heading counts in words, not figures. */
const COUNT_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);

/**
 * Custom quotes arrive over WhatsApp, which is where this audience actually
 * replies. Set NEXT_PUBLIC_CONTACT_WHATSAPP to a number in international form
 * without symbols (e.g. 60123456789); the mailto is the fallback so the button
 * is never dead.
 */
const CONTACT_HREF = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP
  ? `https://wa.me/${process.env.NEXT_PUBLIC_CONTACT_WHATSAPP}`
  : "mailto:hello@mangalyam.my";

export default async function HomePage() {
  const session = await auth();
  const price = priceLabel();
  const signedIn = Boolean(session?.user);

  // Everything a customer can actually choose, designs added from the admin
  // side included — a gallery that advertises only what is written in code
  // goes stale the first time a design is added through the screen built for
  // exactly that.
  //
  // This read is why the page must stay dynamic. It already is, because
  // `auth()` above reads cookies, and it has to remain so: there is no
  // DATABASE_URL during the Docker build, so anything Next tries to
  // prerender here would fail the deploy rather than the request.
  const designs = (await allManifestsOrCoded()).filter((d) => d.built);
  const weddingFamily =
    designs.find((d) => d.eventTypes.includes("wedding")) ?? designs[0];
  const generalFamily =
    designs.find((d) => d.templateId !== weddingFamily?.templateId) ?? weddingFamily;

  return (
    <>
      <Particles />
      <Reveal />
      <SiteNav signedIn={signedIn} />

      <div className="page-shell">
        {/* ---------- hero ---------- */}
        <header className="tone-dark" id="top">
          <div className="wrap bento hero-bento">
            <div className="t t--lit t--center rv c7 r2 hero-copy">
              <p className="kick">
                E-invitations for Malaysian Indian families<span className="dash" />
              </p>
              <h1 style={{ fontSize: "var(--t-3xl)", marginTop: "1.3rem" }}>
                An E-Invitation for
                <em style={{ display: "block", fontStyle: "italic", color: "var(--accent-soft)" }}>
                  Every Event You Hold
                </em>
              </h1>
              <p className="muted" style={{ fontSize: "var(--t-md)", maxWidth: "46ch", marginTop: "1.2rem" }}>
                From weddings and naming ceremonies to temple consecrations and
                community open houses — one link, sent on WhatsApp, opening to an
                invitation drawn for the occasion, with RSVPs that count themselves.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".7rem", marginTop: "1.8rem" }}>
                <Link className="btn btn-gold" href="#designs">
                  See the designs <Arrow />
                </Link>
                <Link className="btn btn-line" href="#how">
                  How it works
                </Link>
              </div>
            </div>

            <div className="t t--img t--lift rv c5 r3 hero-media" data-delay="120" style={{ minHeight: 340, position: "relative" }}>
              <Image
                src="/img/hero-mangalyam.webp"
                alt="A garlanded temple entrance at dusk, hung with jasmine and mango leaves and lit by tall brass lamps"
                fill
                priority
                sizes="(max-width: 1000px) 100vw, 40vw"
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Where the two reassurance pills were. A count of designs is a
                fact about us; this is the thing the family checks first. */}
            <div className="rv c12 hero-aus" data-delay="200">
              <TodayPanchangam />
            </div>

          </div>
        </header>

        {/* ---------- star-sign gimmick ---------- */}
        <section className="sec tone-dark" id="stars">
          <div className="wrap">
            <div className="head mid rv" style={{ marginBottom: "clamp(1.8rem,3.5vw,2.8rem)" }}>
              <p className="kick">A small detour before the ceremonies</p>
              <h2>Every good celebration starts with a sign</h2>
            </div>
            <Constellation />
          </div>
        </section>

        {/* ---------- ceremonies ---------- */}
        <section className="sec tone-cream" id="ceremonies">
          <div className="wrap">
            <div className="head mid rv" style={{ marginBottom: "clamp(1.8rem,3.5vw,2.8rem)" }}>
              <p className="kick">Every event, not only weddings</p>
              <h2>From weddings to temple ceremonies</h2>
              <p>
                A naming ceremony is not a wedding and a Deepavali open house is
                neither, so none of them share an invitation. Each occasion gets its
                own words, its own colour, its own link and its own headcount.
              </p>
            </div>
            <div className="bento">
              {EVENT_TYPES.map((type, i) => (
                <div key={type} className="t t--lift rv c4 cer-tile" data-delay={i * 40}>
                  <EventIcon eventType={type} className="cer-ic" />
                  <div>
                    <b>{EVENT_TYPE_LABELS[type]}</b>
                    <span>{EVENT_TYPE_BLURBS[type]}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* The wedding case is the reason the product exists, and it is the
                one occasion that is really several. Said here rather than by
                making the whole page about weddings again. */}
            <p className="rv" style={{ textAlign: "center", marginTop: "1.6rem", color: "var(--ink-2)", fontSize: "var(--t-sm)" }}>
              A wedding is a season, not a day — {CEREMONY_LABELS.mehendi},{" "}
              {CEREMONY_LABELS.muhurtham}, {CEREMONY_LABELS.nalangu} and{" "}
              {CEREMONY_LABELS.reception}. Each can have its own invitation and its own
              guest list.{" "}
              <Link href="#pricing" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                Ask us for a quote
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ---------- designs ---------- */}
        <section className="sec tone-dark" id="designs">
          <div className="wrap">
            <div className="head mid rv" style={{ marginBottom: "clamp(1.8rem,3.5vw,2.8rem)" }}>
              <p className="kick">Choose your card</p>
              <h2>{countWord(designs.length)} designs, drawn not decorated</h2>
              <p>
                Every one recolours to the day — a muhurtham in kumkum, a
                housewarming in tulsi green, a sixtieth in plum.{" "}
                {withFigures(String(distinctLooks(designs)))} distinct looks
                between them, before you add a photograph.
              </p>
            </div>
            <div className="bento">
              <div className="t t--flush t--img t--lift rv c6 r2">
                <DesignCard
                  design={weddingFamily}
                  coupleLine={SAMPLE_COUPLE}
                  ceremonyLabel="Muhurtham"
                  big
                />
              </div>
              <div className="t t--flush t--img t--lift rv c6 r2" data-delay="80">
                <DesignCard
                  design={generalFamily}
                  coupleLine={SAMPLE_HOST}
                  ceremonyLabel="Housewarming"
                  big
                />
              </div>
              <div className="t t--2 t--center rv c9">
                <h3 style={{ fontSize: "var(--t-lg)" }}>Your photograph goes on the cover</h3>
                <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".5rem" }}>
                  Each design carries your own cover image, your accent colour and your
                  words — so two families on the same design never recognise each other.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- story ---------- */}
        <section className="sec tone-cream" id="story">
          <div className="wrap bento">
            <div className="t t--img t--lift rv c5 r2" style={{ minHeight: 400, position: "relative" }}>
              <Image
                src="/img/story-mandapam.webp"
                alt="A South Indian wedding mandapam at dusk, hung with jasmine and rose garlands and lit by brass lamps"
                fill
                sizes="(max-width: 1000px) 100vw, 40vw"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="t t--lit t--center rv c7" data-delay="100">
              <p className="kick">
                Our story<span className="dash" />
              </p>
              <h2 style={{ fontSize: "var(--t-2xl)", marginTop: ".9rem" }}>
                Rooted in Culture,
                <br />
                Designed for Today
              </h2>
              <p className="muted" style={{ marginTop: "1.1rem", maxWidth: "46ch" }}>
                Most invitation tools were built for one date and one venue. Ours was
                not. It was built around the pooja that starts before dawn, the open
                house that runs all afternoon, and the aunty who needs the address in a
                font she can actually read.
              </p>
            </div>
            <div className="t t--2 rv c4 pillars" data-delay="160">
              <div>
                <span className="n">{withFigures("01")}</span>
                <div>
                  <b>Made for Malaysian Indian families</b>
                  <span>Griha Pravesham and Sashtiabdapoorthi are presets, not afterthoughts.</span>
                </div>
              </div>
              <div>
                <span className="n">{withFigures("02")}</span>
                <div>
                  <b>Built for the phone in their hand</b>
                  <span>Compressed, fast, readable on venue wifi.</span>
                </div>
              </div>
              <div>
                <span className="n">{withFigures("03")}</span>
                <div>
                  <b>Yours after you publish</b>
                  <span>Change a venue at midnight. The link never changes.</span>
                </div>
              </div>
            </div>
            <div className="t t--2 rv c3 quote-tile" data-delay="220">
              <q>Where every occasion has a voice of its own</q>
              <span className="rule" />
              <p className="steps">
                Invite
                <br />
                Celebrate
                <br />
                Remember
              </p>
            </div>
          </div>
        </section>

        {/* ---------- how ---------- */}
        <section className="sec tone-dark" id="how">
          <div className="wrap">
            <div className="head mid rv" style={{ marginBottom: "clamp(1.8rem,3.5vw,2.8rem)" }}>
              <p className="kick">How it works</p>
              <h2>Answer six questions. Send the link.</h2>
            </div>
            <div className="bento">
              {STEPS.map((s, i) => (
                <div key={s.n} className="t t--lift rv c4 step" data-delay={i * 90}>
                  <span className="no">{withFigures(s.n)}</span>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- pricing ---------- */}
        <section className="sec tone-cream" id="pricing">
          <div className="wrap">
            <div className="head mid rv" style={{ marginBottom: "clamp(1.8rem,3.5vw,2.8rem)" }}>
              <p className="kick">One invitation, one payment</p>
              <h2>Pay once. No subscription.</h2>
              <p>
                One price for one invitation, and everything is in it. No tiers to
                compare, nothing held back for a bigger plan.
              </p>
            </div>

            <div className="bento">
              <div className="t t--2 t--lit rv c6 price-card">
                {/* priceLabel() returns null until PRICE_STANDARD_SEN is set, so
                    the page stays honest before launch instead of inventing a
                    figure or crashing on a missing variable. */}
                {price ? (
                  <b className="price-fig num">{price}</b>
                ) : (
                  <b className="price-fig num price-tbc">Price to be confirmed</b>
                )}
                <p className="inc">one invitation, yours to keep</p>
                <ul>
                  {INCLUDED.map((item) => (
                    <li key={item}>
                      <Tick />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link className="btn btn-gold" href="/create">
                  Create your invitation <Arrow />
                </Link>
              </div>

              {/* Anything larger is a conversation, not a checkout. It sits
                  beside the price rather than above it — it is not an upgrade. */}
              <div className="t t--lift rv c6 quote-card">
                <p className="kick">Something larger</p>
                <h3>More than one, or something bespoke</h3>
                <p className="muted">
                  A wedding with an invitation per ceremony, several occasions in one
                  season, or artwork drawn for you by hand. Tell us what you are
                  planning and we will price it directly.
                </p>
                <a className="btn btn-line" href={CONTACT_HREF}>
                  Message us on WhatsApp <Arrow />
                </a>
                <p className="dim" style={{ fontSize: "var(--t-xs)", marginTop: ".8rem" }}>
                  Usually answered the same day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section className="sec tone-dark" id="faq">
          <div className="wrap bento">
            <div className="t t--center rv c5">
              <p className="kick">Questions</p>
              <h2 style={{ fontSize: "var(--t-2xl)", marginTop: ".9rem" }}>Before you start</h2>
              <p className="muted" style={{ marginTop: ".9rem" }}>
                Anything else, ask us — a person answers.
              </p>
            </div>
            <div className="t t--2 rv c7 faq" data-delay="100">
              {FAQ.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- closer ---------- */}
        <section className="sec tone-dark" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <div className="t t--flush t--img rv c12 closer">
              <Image
                src="/img/closer-mandapam.webp"
                alt="A garlanded mandapam lit by rows of brass lamps, reflected in a polished marble floor"
                fill
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
              <div className="ov">
                <div>
                  <h2>
                    Send your next event as{" "}
                    <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>
                      one beautiful link
                    </em>
                  </h2>
                  <p>
                    Wedding, naming ceremony, housewarming, temple consecration or an
                    open house — build it free, see it working on your own phone, and
                    pay only when you are ready to send it.
                  </p>
                  <Link className="btn btn-gold" href="/create">
                    Create your invitation <Arrow />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter designs={designs} />
      </div>
    </>
  );
}
