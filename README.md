# Mangalyam

Digital invitations for Malaysian Indian celebrations — weddings, naming
ceremonies, housewarmings, milestone birthdays, temple consecrations, home
poojas, and community events. A wedding holds a separate invitation, link and
RSVP for every ceremony; every other occasion holds exactly one.

The product brief is `CLAUDE.md` — it is the source of truth for scope and the
non-negotiable rules. Read Section 13 before changing anything structural.

## Stack

Next.js (App Router) · Prisma against PostgreSQL · Auth.js (credentials) ·
MinIO or any S3-compatible object storage · sharp · Stripe · Tailwind v4 with a
token-based design system in `app/globals.css`.

## Running it

```bash
npm install
npx prisma migrate deploy    # or `prisma migrate dev` while iterating
npm run dev
```

## Environment

| Variable | What it is |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js signing secret (`openssl rand -base64 32`) |
| `AUTH_URL` | Public origin, e.g. `https://app.mangalyam.my` |
| `NEXT_PUBLIC_APP_URL` | Same origin, used for share links and OG cards |
| `S3_ENDPOINT` | MinIO endpoint |
| `S3_REGION` | Any value MinIO accepts, e.g. `us-east-1` |
| `S3_BUCKET` | Bucket for uploads |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | MinIO credentials |
| `S3_PUBLIC_URL` | Public base URL objects are served from |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `/api/webhooks/stripe` |
| `PAYMENT_CURRENCY` | Defaults to `myr` |
| `PRICE_STANDARD_SEN` | The one flat price, in **sen**, integer |

One flat price for one invitation — no tiers, no bundles. Anything beyond that
(a second ceremony, bespoke work) is a direct conversation, not a checkout.
The price is deliberately not in the codebase: with none set, checkout shows
as "not on sale yet" rather than charging the wrong amount or zero.

Point the Stripe webhook at `/api/webhooks/stripe` and subscribe to
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed` and `checkout.session.expired`. The
async events matter: FPX settles after the customer leaves the page.

## Things that will bite you if you don't know them

**There is no Row Level Security.** Every route touching an event-owned row
goes through a guard in `lib/auth/ownership.ts`, which resolves the row and
proves ownership in one query. Never fetch an event-owned row by id alone.
Unowned resources return 404, not 403, so the API doesn't leak which ids exist.

**`Event` is the top-level billed entity, not `Wedding`.** Mangalyam covers
every Malaysian Indian celebration, not only weddings — `hostNames` is a
flexible display string ("Rishi & Gaayathri", "The Kumar Family", one name),
and `EventType` decides which occasion it is. Only `wedding` has sub-ceremonies
(`CeremonyType`, wedding-only and nullable); every other occasion's single
invitation carries `ceremonyType: null` and is labelled from `EVENT_TYPE_LABELS`
instead.

**One renderer.** The builder preview and the public page mount the same
component with the same JSON, both built by `composeInvitationJson`. There is
no second rendering path and there must not be one.

**Templates render props.** A template never fetches, never writes, and never
contains a couple's data.

**`rsvps` is the only public-write table.** Its route is addressed by slug,
rate-limited in-process, and refuses drafts and closed invitations. The
in-process limiter is only sufficient while this runs as a single container.

**The opening is the renderer's, not a template's.** `InvitationShell` wraps
every template with the cover a guest taps, the drift down the page, the
action bar and the audio element. Templates know nothing about it, so all six
designs get the same behaviour and the preview cannot drift from the published
page. Adding a fourth opening means one component in `Openings.tsx`, one
transition block in `globals.css`, and one enum value.

**The cover is sized against the shell, so the invitation stays clamped to one
screen until the cover is removed** (`data-revealed`, not `data-open`).
Releasing the clamp when the animation starts stretches the cover down the
whole page and the opening plays somewhere below the fold. In the builder the
clamp comes from `--frame-h` on `.phone-scroll`; on the published page it is
the viewport.

**Payments go through `lib/payments`.** The app depends on the
`PaymentGateway` interface, not on Stripe. Swapping to Billplz or ToyyibPay
means a new adapter and one changed line in `lib/payments/index.ts`.

## Build order

Phases 1–7 of `CLAUDE.md` Section 11 are done, plus the opening sequence and
action bar. Phase 8 is the remaining five
designs — the registry already carries their tokens and manifests, with
`built: false` so the picker never offers a design that has no renderer.
