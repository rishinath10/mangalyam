import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { withFigures } from "@/lib/typography";
import { CEREMONY_BLURBS, CEREMONY_LABELS, CEREMONY_TYPES } from "@/lib/ceremonies";
import { TEMPLATE_MANIFESTS } from "@/lib/templates/registry";
import { CeremonyIcon } from "@/components/site/CeremonyIcon";
import { Constellation } from "@/components/site/Constellation";
import { DesignCard } from "@/components/site/DesignCard";
import { Arrow, Tick } from "@/components/site/Icons";
import { Particles } from "@/components/site/Particles";
import { Reveal } from "@/components/site/Reveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

const STEPS = [
  {
    n: "01",
    h: "Tell us about the two of you",
    p: "Your names, your ceremonies, where and when. The invitation assembles itself beside you as you answer, so you always see what you are making.",
  },
  {
    n: "02",
    h: "Pick a design, make it yours",
    p: "Add your photograph, adjust the accent colour, write the words in your own voice. Every ceremony can differ, or all match.",
  },
  {
    n: "03",
    h: "Send it, and let guests reply",
    p: "One link per ceremony, straight into WhatsApp. Guests RSVP themselves and your headcount updates as they answer.",
  },
];

const TIERS = [
  {
    name: "Essential",
    inc: "1 ceremony invitation",
    feature: false,
    items: ["Standard designs", "Unlimited RSVPs", "Gallery, timeline and countdown", "WhatsApp sharing"],
    cta: "Choose Essential",
  },
  {
    name: "Signature",
    inc: "Up to 4 ceremony invitations",
    feature: true,
    items: ["Everything in Essential", "All six designs, premium included", "Background music", "Meal preferences for your caterer"],
    cta: "Choose Signature",
  },
  {
    name: "Bespoke",
    inc: "Unlimited ceremony invitations",
    feature: false,
    items: ["Everything in Signature", "A card drawn for you by hand", "Mangalyam branding removed", "Priority support to the last ceremony"],
    cta: "Talk to us",
  },
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
    q: "What if I have more ceremonies than my package covers?",
    a: "Upgrade at any point and keep everything already built. Nothing is lost and nothing needs rebuilding.",
  },
  {
    q: "Can we use Tamil on the invitation?",
    a: "Not yet. English only at launch — Tamil is the next language we add, and it needs proper typesetting rather than a machine translation.",
  },
  {
    q: "How do guests receive it?",
    a: "A WhatsApp link with a preview card showing your names, the ceremony and your cover photograph. You can also copy the link or share it any other way.",
  },
];

const SAMPLE_COUPLE = "Rishi & Gaayathri";
const SAMPLE_HOST = "The Kumar Family";
const [weddingFamily, generalFamily] = TEMPLATE_MANIFESTS;

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <>
      <Particles />
      <Reveal />
      <SiteNav signedIn={signedIn} />

      <div className="page-shell">
        {/* ---------- hero ---------- */}
        <header className="tone-dark hero-aura" id="top">
          <div className="wrap bento" style={{ paddingBlock: "clamp(1rem,2.5vw,2rem) var(--sec)" }}>
            <div className="t t--lit t--center rv c7 r2">
              <p className="kick">
                Traditions meet tomorrow<span className="dash" />
              </p>
              <h1 style={{ fontSize: "var(--t-3xl)", marginTop: "1.3rem" }}>
                Every Ceremony Deserves
                <em style={{ display: "block", fontStyle: "italic", color: "var(--accent-soft)" }}>
                  Its Own Invitation
                </em>
              </h1>
              <p className="muted" style={{ fontSize: "var(--t-md)", maxWidth: "44ch", marginTop: "1.2rem" }}>
                A Tamil wedding is not one event — it is a season of them. Mangalyam gives
                each ceremony its own invitation, its own link and its own RSVP, all under
                one wedding.
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

            <div className="t t--img t--lift rv c5 r3" data-delay="120" style={{ minHeight: 340, position: "relative" }}>
              <Image
                src="/img/hero-mangalyam.webp"
                alt="A garlanded temple entrance at dusk, hung with jasmine and mango leaves and lit by tall brass lamps"
                fill
                priority
                sizes="(max-width: 1000px) 100vw, 40vw"
                style={{ objectFit: "cover" }}
              />
            </div>

            <div className="t t--2 t--lift t--center rv c4" data-delay="200">
              <b style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "clamp(2.4rem,4vw,3.2rem)", lineHeight: 1, color: "var(--head)" }}>
                {withFigures("108")}
              </b>
              <span className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".3rem" }}>
                distinct looks — {withFigures("2")} families across {withFigures("9")} ceremonies
                and {withFigures("6")} palette colours, before you add a photograph.
              </span>
            </div>

            <div className="t t--2 t--lift t--center rv c3" data-delay="260">
              <p className="kick">Pay once</p>
              <h3 style={{ fontSize: "var(--t-lg)", marginTop: ".5rem" }}>No subscription, ever</h3>
              <p className="muted" style={{ fontSize: "var(--t-sm)", marginTop: ".4rem" }}>
                One payment per wedding.
              </p>
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
              <p className="kick">Explore by ceremony</p>
              <h2>A separate invitation for every ritual</h2>
              <p>
                Mehendi guests and Muhurtham guests are rarely the same people. Each
                ceremony gets its own page, its own colour and its own headcount.
              </p>
            </div>
            <div className="bento">
              {CEREMONY_TYPES.map((c, i) => (
                <div key={c} className="t t--lift rv c4 cer-tile" data-delay={i * 40}>
                  <CeremonyIcon ceremony={c} className="cer-ic" />
                  <div>
                    <b>{CEREMONY_LABELS[c]}</b>
                    <span>{CEREMONY_BLURBS[c]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- designs ---------- */}
        <section className="sec tone-dark" id="designs">
          <div className="wrap">
            <div className="head mid rv" style={{ marginBottom: "clamp(1.8rem,3.5vw,2.8rem)" }}>
              <p className="kick">Choose your card</p>
              <h2>Two families, drawn not decorated</h2>
              <p>
                One for weddings, one for every other occasion. Each recolours to the day —
                Haldi in turmeric, Muhurtham in kumkum, a housewarming in tulsi green.
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
                  words — so two couples on the same card never recognise each other.
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
                Most invitation tools were built for weddings with one date and one venue.
                Ours was not. It was built around the Mehendi that runs late, the Muhurtham
                that starts before dawn, and the aunty who needs the address in a font she
                can actually read.
              </p>
            </div>
            <div className="t t--2 rv c4 pillars" data-delay="160">
              <div>
                <span className="n">{withFigures("01")}</span>
                <div>
                  <b>Made for Malaysian Indian families</b>
                  <span>Muhurtham and Nalangu are presets, not afterthoughts.</span>
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
              <q>Where every ceremony has a voice of its own</q>
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
              <p className="kick">One wedding, one payment</p>
              <h2>Pay once. No subscription.</h2>
              <p>
                Your package sets how many ceremony invitations you can publish. Everything
                else — RSVPs, the builder, the links — is in all three.
              </p>
            </div>
            <div className="bento">
              {TIERS.map((t, i) => (
                <div
                  key={t.name}
                  className={`t t--lift rv c4 tier ${t.feature ? "t--2 t--lit" : ""}`}
                  data-delay={i * 90}
                >
                  {t.feature && <span className="flag">Most weddings</span>}
                  <h3>{t.name}</h3>
                  <p className="inc">{withFigures(t.inc)}</p>
                  <ul>
                    {t.items.map((it) => (
                      <li key={it}>
                        <Tick />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  <Link className={`btn ${t.feature ? "btn-gold" : "btn-line"}`} href="/signup">
                    {t.cta}
                  </Link>
                </div>
              ))}
              <div className="t rv c12" style={{ textAlign: "center" }}>
                <p className="dim" style={{ fontSize: "var(--t-sm)" }}>
                  <b style={{ color: "var(--accent)", fontWeight: 400 }}>Prices are not set yet.</b>{" "}
                  The tier structure is fixed; the ringgit figures are still to be decided,
                  so none are written into the page or the code.
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
                    Your first invitation is{" "}
                    <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>
                      twenty minutes away
                    </em>
                  </h2>
                  <p>
                    Start with the couple&rsquo;s names. Everything else can be decided
                    later, and changed after you publish.
                  </p>
                  <Link className="btn btn-gold" href="/signup">
                    Create your invitation <Arrow />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
