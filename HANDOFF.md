# Mangalyam.my — Project Handoff

_Written 29 October 2026. Context transfer from a Claude Code cloud session to local development._

---

## 1. What this is

**Mangalyam.my** — a premium, mobile-first digital invitation SaaS for Malaysian Indian families.

The name means *auspicious*, **not** *wedding*. This matters for every product decision: the platform covers **all** community events — weddings, naming ceremonies, housewarmings, 60th birthdays (Sashtiapthapoorthi), temple consecrations, home poojas, Deepavali open houses. Copy, templates and taxonomy must never assume a wedding.

- Live at `mangalyam.my`
- Solo-built
- Deploys from `main` via **Coolify**, triggered manually by the owner

### Brand naming (deliberate split)

Defined once in `lib/company.ts` — never hardcode these:

| Field | Value |
|---|---|
| `brand` | `Mangalyam.my` — the platform, as named in prose |
| `wordmark` | `Mangalyam` — what the **logo** says (deliberately different; do not "fix" this) |
| `legalName` | Art Engine My Solutions |
| `registrationNumber` | 202103086214 |
| `email` | artenginemy@gmail.com |
| `phone` | `null` — intentionally null, **not** a placeholder string |

The legal entity attribution ("a brand by Art Engine My Solutions") appears in the footer and legal pages — present but not prominent.

---

## 2. Stack

- **Next.js 15** App Router, **React 19**, server components, route handlers
- `unstable_cache` + `revalidateTag` for design-list caching
- **Prisma 6 / PostgreSQL**
- **Auth.js / NextAuth v5 beta** — Credentials provider, JWT sessions
- **Tailwind v4**, CSS-first tokens
- **MinIO** (S3-compatible) via `@aws-sdk/client-s3` with `forcePathStyle: true`
- **sharp** for image processing
- **Stripe** for payments
- `server-only` package to keep server modules out of client bundles

### Migrations

Hand-written SQL migrations, applied by `prisma migrate deploy` in the container entrypoint. The entrypoint uses `set -e`, so **a failed migration stops the container from serving at all**. Treat migrations as deploy-blocking.

---

## 3. Hard architectural rules

These were set at the start of the project and still hold. Do not relax them without a deliberate decision.

1. **There is no RLS.** Every route touching an event-owned resource needs an *explicit* ownership check. Ownership failures return **404, not 403** — never confirm that someone else's resource exists.
2. **`events` is the top-level owned/billed entity.** (Originally called `weddings`; renamed when the scope broadened beyond weddings.)
3. **The `rsvps` table is public-insert, owner-only-read, and rate-limited** (currently 8 per 10 minutes).
4. **Templates render props.** They never fetch data, never write to the database, and never contain a specific family's information.
5. **Live preview and the published page share one renderer component.** No exceptions, no "temporary" second implementation.
6. **Don't hardcode pricing or commit to a payment gateway in code** without confirming the open commercial decisions.

---

## 4. Infrastructure

### Coolify

- Panel: `149.118.147.161:8000` — **plain HTTP on a public IP**. See Security below.
- The app is a **Dockerfile build** (not Docker Compose). This matters: Coolify's "Connect To Predefined Network" toggle only exists for **Compose applications and Services**, so it is not available on the app.
- **Coolify destinations are Docker networks.** The default shared network is `coolify`. Non-Compose *applications* join it automatically. **Services get their own resource-specific network and do NOT join `coolify`** — this was the root cause of the app being unable to reach MinIO. The fix is on the **MinIO Service → Configuration → General**, not on the app. Joining adds a network alias suffixed with the Service's UUID.

### Storage (MinIO) — current working config

```
S3_ENDPOINT    = http://minio:9000                              # container-to-container
S3_PUBLIC_URL  = https://149-118-147-161.sslip.io/mangalyam     # browser-facing, BUCKET INCLUDED
S3_BUCKET      = mangalyam
```

**The bucket must be in `S3_PUBLIC_URL`.** `lib/storage.ts` builds every image link as `` `${S3_PUBLIC_URL}/${key}` `` — the bucket is *not* appended separately. Without it, MinIO reads the first path segment as a bucket name and every image 403s while uploads appear to succeed.

`sslip.io` is wildcard DNS: `149-118-147-161.sslip.io` resolves to `149.118.147.161`.

**Verified end-to-end on 29 Oct 2026:** signed in as admin, uploaded a real JPEG through `/api/invitations/:id/cover`, got back a `.webp` URL, fetched it with no cookies (as a guest's phone would) → `200 image/webp`, then deleted it → `404`. Both write and public read are proven working.

### Image variants (`lib/storage.ts`)

- QR codes: `lossless: true`, and `flatten({ background: "#ffffff" })` — transparency would otherwise ruin scan contrast.
  - Honest note: lossy q78 was tested and *did* scan in every case. Lossless was kept anyway because it costs ~30KB once per invitation and insures against a failure mode no customer could ever report coherently. Don't "optimise" this without reading that reasoning.
- Art/template assets: `alphaQuality: 100`
- Everything else: plain quality-based WebP

---

## 5. Features built

- Event creation wizard (couple fields become two inputs for wedding-type ceremonies, one otherwise)
- Template/design system with live preview
- **Admin design upload** — upload finished card artwork as a template via `/admin/designs`, no deploy required
- Guest gallery, max 4 images, lightbox on click
- Guest greetings, shown on the shareable link, appearing immediately
- **Blessings** — gift money section: bank QR image upload **and** typed bank details, shown openly
- RSVP with rate limiting
- Stripe paywall on publishing
- Legal pages: privacy, terms, refunds
- `robots.ts` / `sitemap.ts`, `error.tsx`, `global-error.tsx`, `not-found.tsx`

### Custom design system

- `lib/templates/design-store.ts` (server-only) — cached manifest reads tagged for invalidation; `allManifestsOrCoded` never throws, so the landing page and wizard degrade gracefully if the DB is unreachable.
- `components/templates/DesignsProvider.tsx` — React context, falls back to the static registry when no provider is mounted.
- `lib/templates/palette.ts` — samples a palette from uploaded artwork. Skips pixels with `alpha < 200`, ranks accents by `(0.35 + saturation) * sqrt(n)`, takes paper colour from the ground texture, and **constructs** ink as a mix toward `rgb(26,22,18)` rather than guessing it from the artwork.
  - This was wrong once: it called a gold-and-rose card green, because flattening the transparent frame onto white let the empty centre vote, and `log2(n)` under-weighted coverage.
- `CUSTOM_SECTIONS` is a fixed constant — **custom designs cannot currently vary section order**.

---

## 6. Audit results that PASSED

Done thoroughly; **don't spend time re-testing these**:

- All 11 cross-account IDOR probes return 404
- Admin pages and admin API return 404 for non-admins
- Production cookies: `__Host-`/`__Secure-` prefixes, HttpOnly, Secure, SameSite=Lax
- Zero colour-contrast failures at 390px and 1280px, every page
- No horizontal overflow from 360px to 1600px across 15 pages
- h1 / alt text / form labels / `lang` / viewport all present
- No `dangerouslySetInnerHTML`, no `eval`
- Stripe webhook is signature-verified and idempotent
- RSVP rate limiting works (8 / 10 min)
- Login throttling works: 10 attempts per address / 15 min, 40 per host; checked *before* the DB and bcrypt. Verified 14 attempts → 3 blocked.

### Security hardening in place

- `next.config.ts`: CSP (`frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`), HSTS (apex only, no `includeSubDomains`), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, `poweredByHeader: false`
- `middleware.ts`: 308 redirect `www.` → apex; guards `/dashboard` and `/admin`
- Signup requires a strong password (min 10 chars, common-password list including "mangalyam"/"wedding"/"malaysia", no 4+ repeated characters). Login keeps `min(8)` so existing accounts still work.
- Stripe webhook **refuses to settle** on an amount mismatch (returns `{received: true, settled: false}`) rather than logging and granting access anyway.

---

## 7. OPEN ISSUES — start here

### Security (highest priority)

1. **Rotate every credential.** The following were pasted into a Claude conversation and must be considered compromised: the production Postgres password, MinIO root credentials, the admin account password, and the Coolify login.
2. **Coolify is on a public IP over plain HTTP** (`149.118.147.161:8000`). Put it behind HTTPS and/or firewall port 8000 to trusted IPs. **This is the single largest open risk on the system.**
3. **The MinIO bucket is publicly listable.** `GET https://149-118-147-161.sslip.io/mangalyam` returns a full `ListBucketResult` to anyone, unauthenticated. Object keys are UUIDs and therefore unguessable — so the *listing itself is the entire vulnerability*. Once the bucket fills up, that list exposes guest photos and **customers' bank QR codes**, all directly fetchable.
   - **Fix:** grant anonymous `s3:GetObject` on `arn:aws:s3:::mangalyam/*` but **no** statement on `arn:aws:s3:::mangalyam` itself. In the MinIO console the right preset is usually **Download** / **readonly**; the **Public** preset is the one that wrongly also grants list.
   - **Verify:** `/mangalyam` → 403, while a real object URL → 200 with the image.

### Functional

4. **Stripe keys may not be set.** `isPurchasable()` only checks that a price exists, so "Pay and publish" renders enabled while the Stripe client would throw at runtime. Confirm `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are present, and make the check depend on them.
5. **`NEXT_PUBLIC_CONTACT_WHATSAPP` is unset** — the quote button falls back to `mailto:hello@mangalyam.my`, which is probably a dead mailbox.
6. **`COMPANY.phone` is still null** — legal pages have no phone number.
7. **Artwork is stretched, not letterboxed.** `components/templates/art/ArtFrame.tsx` uses `aspectRatio: "3 / 4"` with `style={{ objectFit: "fill" }}`. Any non-3:4 upload distorts. Fix: `objectFit: "contain"` and record the artwork's real aspect ratio on upload.
8. **Thanga Kolam template still ships placeholder art.**

### UX / polish

9. **Template layout variables** — not started. Currently `ArtTemplate.tsx` hardcodes `align: "center"` and a fixed cover composition (crest → ceremonyLabel → names → divider → date). Wanted: alignment options, cover composition presets, variable section order.
10. **Dashboard** needs a "Live" badge and a copy-link button.
11. **`/admin/designs` information hierarchy is backwards** — 12 built-in upload slots dominate the page while "Your designs" is a small empty box.

---

## 8. Gotchas learned the hard way

Each of these cost real debugging time. They are not obvious.

- **`Dockerfile` must copy `next.config.ts` into the runner stage.**
  ```dockerfile
  COPY --from=builder /app/next.config.ts ./next.config.ts
  ```
  Build-shaping config (`headers()`) is compiled into `.next`, but **runtime** config (`poweredByHeader`) is read at boot and **silently no-ops** if the file is absent. Symptom: `x-powered-by` survives `poweredByHeader: false`.

- **Don't make `SiteFooter` async / DB-reading.** Prerendered legal pages have no `DATABASE_URL` at build time, and the Docker build breaks. It takes an optional `designs` prop instead. Verify changes with `env -u DATABASE_URL npx next build`.

- **Don't import `lib/storage.ts` from `lib/api.ts`** — it drags sharp into every route. Error types live in `lib/storage-errors.ts` for exactly this reason.

- **Next's not-found boundary ships in the RSC payload of any route that *can* call `notFound()`.** So grepping rendered HTML for "This page is not here" produces false 404 reports. This caused a wrong "admin is broken" conclusion.

- **Undefined CSS tokens fail silently.** The tokens are `--ink-1`, `--ink-3` — there is no `--ink` or `--muted`.

- **Cormorant Garamond defaults to oldstyle figures.** Numerals need `font-variant-numeric: lining-nums tabular-nums` wherever they should align.

---

## 9. Verifying production from a terminal

Sign in and drive the real API with curl:

```bash
B=https://mangalyam.my
CSRF=$(curl -sS -c jar.txt "$B/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
curl -sS -b jar.txt -c jar.txt \
  -d "csrfToken=$CSRF" -d "email=<admin-email>" -d "password=<password>" \
  -d "redirect=false" -d "json=true" "$B/api/auth/callback/credentials"
curl -sS -b jar.txt "$B/api/auth/session"
```

There is no `/api/invitations` index route — scrape IDs from `/dashboard` and `/dashboard/events/:id`.

**When testing uploads, use an unpublished draft.** A test image pushed to a published invitation is live on a real shareable link immediately. (This happened once; the image was removed within a minute and no prior cover was lost, but it should not have been a published event.)

---

## 10. Suggested order of work

1. Rotate all credentials; lock down the Coolify panel.
2. Fix the MinIO bucket listing policy, verify `/mangalyam` → 403.
3. Confirm Stripe env vars; make `isPurchasable()` depend on them.
4. Fix `objectFit: "fill"` → `contain` and record artwork aspect ratios.
5. Set the contact phone and WhatsApp number.
6. Template layout variables + `/admin/designs` hierarchy.
7. Replace Thanga Kolam placeholder art.

---

## 11. Running locally

```bash
npm install
cp .env.example .env     # fill in DATABASE_URL and the S3_* vars
npx prisma migrate deploy
npm run dev
```

Build exactly as CI does before pushing:

```bash
env -u DATABASE_URL npx next build
```
