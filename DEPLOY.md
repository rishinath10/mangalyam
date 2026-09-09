# Deploying Mangalyam on Coolify

Three services: the app (this repo), Postgres, and MinIO for uploads.
Everything the app needs is an environment variable — the image holds no
secrets and no configuration.

## 1. Data services first

The app fails fast without a database, so create these before the app.

**Postgres.** Add a PostgreSQL service in Coolify. Note the connection string
it gives you; on the same Docker network the host is the *service name*, not
`localhost`.

**MinIO.** Add MinIO, then create a bucket called `mangalyam` and set its
access policy to **public read**. Guests must be able to fetch an invitation
photograph without credentials; nobody may upload without them.

Point a subdomain at MinIO's port 9000 — say `cdn.mangalyam.my` — and let
Coolify issue a certificate for it. That hostname becomes `S3_PUBLIC_URL`.

> `compose.yaml` in this repo does the same thing on a plain Docker host,
> including the bucket policy. Use it as a reference for what Coolify's
> services need to match.

## 2. The app

Point Coolify at this repository, branch `main`, build pack **Dockerfile**.

Set every variable from `.env.example`. Two need care:

- **`NEXT_PUBLIC_*` must also be build arguments.** Next inlines them into the
  browser bundle when it builds, so setting them only at runtime leaves them
  empty in the client. In Coolify, tick "Build variable" on
  `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_CONTACT_WHATSAPP`.
- **`S3_ENDPOINT` and `S3_PUBLIC_URL` are different values.** The first is how
  the app container reaches MinIO over the Docker network
  (`http://minio:9000`). The second is how a guest's phone reaches it
  (`https://cdn.mangalyam.my`). Uploads succeeding while images 404 is almost
  always these two being the same.

Generate the auth secret once:

```
openssl rand -base64 32
```

Changing `AUTH_SECRET` later signs every customer out, so treat it as
permanent.

## 3. Migrations

Nothing to run by hand. The container's entrypoint applies
`prisma migrate deploy` on every boot before the server starts, and that
command only ever applies committed migration files — it never generates one
and never resets. A deploy that cannot migrate refuses to start rather than
serving 500s from routes that look fine.

## 4. First run

1. Open the site. The pricing card should show your `PRICE_STANDARD_SEN`
   figure — if it says "Price to be confirmed", the variable is unset or is
   not a positive integer.
2. Sign up with the address you put in `ADMIN_EMAILS`.
3. Visit `/admin`. If you get a 404, the address does not match the
   allowlist — it is compared lowercased and trimmed, and an unset
   `ADMIN_EMAILS` means nobody is an admin.
4. Create an event, upload a cover photo. If the upload fails, the S3
   variables are wrong; if it succeeds but the image is broken,
   `S3_PUBLIC_URL` is.

## What is not wired yet

- **Payments.** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are unset, so
  checkout cannot complete. The gateway choice (Stripe FPX vs Billplz) is
  still open, and admin revenue counts `Purchase.status = 'paid'`, which is
  only as truthful as the webhook that sets it.
- **Backups.** Coolify can schedule Postgres backups; the MinIO volume needs
  its own. Neither is configured by this repo.
