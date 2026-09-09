# Deploying Mangalyam on Coolify

One service: the app itself. The database (Neon) and file storage
(Cloudflare R2) are both hosted elsewhere — Coolify only runs the container,
and never holds any state of its own. That means a redeploy, a server
rebuild, or moving to a different host never risks your data.

Everything the app needs is an environment variable — the image holds no
secrets and no configuration.

## 1. Create the database (Neon)

1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Neon gives you a **pooled connection string** immediately — copy it. It
   already includes `?sslmode=require`, which Neon requires; don't strip it.
3. That string is your `DATABASE_URL`.

Nothing to install, nothing to patch, nothing to back up yourself — Neon
owns all of that.

## 2. Create the storage bucket (Cloudflare R2)

1. Sign up at [Cloudflare](https://dash.cloudflare.com) (free), go to **R2**
   in the sidebar.
2. Create a bucket named `mangalyam`.
3. Open the bucket → **Settings** → **Public access** → enable it. This gives
   you a public URL (an `r2.dev` address, or connect your own subdomain like
   `cdn.mangalyam.my` if you want a branded one). Either way, that public URL
   is your `S3_PUBLIC_URL`. Guests' phones fetch invitation photos from this
   URL directly, with no credentials — that's why it has to be public.
4. Go to **R2 → Manage API tokens** → create a token with **read and write**
   permission on this bucket. It gives you:
   - an **Account ID**, which becomes part of `S3_ENDPOINT`:
     `https://<account-id>.r2.cloudflarestorage.com`
   - an **Access Key ID** and **Secret Access Key**

Keep the endpoint (private, for the app to write to) and the public URL
(public, for guests to read from) straight — they are never the same value.
Uploads succeeding while every image shows broken is almost always these two
swapped or confused.

## 3. Create the app in Coolify

1. **+ New → Application → Public/Private Repository**, or connect GitHub if
   you haven't.
2. Point it at this repository, branch `main`.
3. **Build Pack: Dockerfile** — Coolify should auto-detect the `Dockerfile`
   at the repo root.
4. Set the exposed **port** to `3000`.

## 4. Environment variables

Open `.env.example` in the repo for the full list with explanations. Fill in
real values for every one — nothing here has a safe default that guesses.

Two things that catch almost everyone on a first deploy:

- **`NEXT_PUBLIC_*` must also be marked as build-time variables.** Coolify
  has a toggle for this on each variable. Next inlines `NEXT_PUBLIC_APP_URL`
  and `NEXT_PUBLIC_CONTACT_WHATSAPP` into the browser bundle *when it
  builds* — set only at runtime, they are silently empty in the client.
- **`S3_ENDPOINT` and `S3_PUBLIC_URL` are different values**, per Step 2
  above. Mixing them up is the other usual first-deploy failure.

Generate the auth secret once:

```
openssl rand -base64 32
```

Changing `AUTH_SECRET` later signs every customer out, so treat it as
permanent from the day you first set it.

## 5. Migrations

Nothing to run by hand. The container's entrypoint applies
`prisma migrate deploy` on every boot before the server starts, and that
command only ever applies committed migration files — it never generates one
and never resets. A deploy that cannot migrate refuses to start rather than
serving 500s from routes that look fine.

## 6. Point your domain

In the app's Coolify settings, add your domain (e.g. `mangalyam.my`) and let
Coolify issue the certificate.

## 7. First run

1. Open the site. The pricing card should show your `PRICE_STANDARD_SEN`
   figure — if it says "Price to be confirmed", the variable is unset or is
   not a positive integer.
2. Sign up with the address you put in `ADMIN_EMAILS`.
3. Visit `/admin`. If you get a 404, the address does not match the
   allowlist — it is compared lowercased and trimmed, and an unset
   `ADMIN_EMAILS` means nobody is an admin.
4. Create an event, try uploading a cover photo. If the upload fails, the R2
   credentials or endpoint are wrong; if it succeeds but the image shows
   broken, `S3_PUBLIC_URL` is wrong or the bucket isn't public.

## What is not wired yet

- **Payments.** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are unset, so
  checkout cannot complete. The gateway choice (Stripe FPX vs Billplz) is
  still open, and admin revenue counts `Purchase.status = 'paid'`, which is
  only as truthful as the webhook that sets it.

## Self-hosting Postgres or storage instead

Both Neon and R2 can be swapped for a self-hosted Postgres and MinIO
container on your own box — `DATABASE_URL` and the `S3_*` variables are all
the code needs to know, and it does not care which side of that choice you
take. The tradeoff is you then own backups and uptime for both. Ask if you
want that version of this guide instead.
