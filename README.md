# Mangalyam

Digital wedding invitations for Malaysian Indian families. One wedding holds a
separate invitation, link and RSVP for every ceremony.

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
| `PRICE_ESSENTIAL_SEN` / `PRICE_SIGNATURE_SEN` / `PRICE_BESPOKE_SEN` | Prices in **sen**, integers |

Prices are deliberately not in the codebase. A package with no price set shows
as "not on sale yet" and cannot be checked out — better a blocked sale than a
wrong charge.

Point the Stripe webhook at `/api/webhooks/stripe` and subscribe to
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed` and `checkout.session.expired`. The
async events matter: FPX settles after the customer leaves the page.

## Things that will bite you if you don't know them

**There is no Row Level Security.** Every route touching a wedding-owned row
goes through a guard in `lib/auth/ownership.ts`, which resolves the row and
proves ownership in one query. Never fetch a wedding-owned row by id alone.
Unowned resources return 404, not 403, so the API doesn't leak which ids exist.

**One renderer.** The builder preview and the public page mount the same
component with the same JSON, both built by `composeInvitationJson`. There is
no second rendering path and there must not be one.

**Templates render props.** A template never fetches, never writes, and never
contains a couple's data.

**`rsvps` is the only public-write table.** Its route is addressed by slug,
rate-limited in-process, and refuses drafts and closed invitations. The
in-process limiter is only sufficient while this runs as a single container.

**Payments go through `lib/payments`.** The app depends on the
`PaymentGateway` interface, not on Stripe. Swapping to Billplz or ToyyibPay
means a new adapter and one changed line in `lib/payments/index.ts`.

## Build order

Phases 1–7 of `CLAUDE.md` Section 11 are done. Phase 8 is the remaining five
designs — the registry already carries their tokens and manifests, with
`built: false` so the picker never offers a design that has no renderer.
