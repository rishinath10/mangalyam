#!/bin/sh
# Apply migrations, then start.
#
# `migrate deploy` only ever applies committed migration files — it never
# generates one and never resets, so it is safe to run on every boot and on
# every replica. Failing hard here is deliberate: a container that starts
# against an un-migrated database serves 500s from routes that look fine.
set -e

echo "→ applying database migrations"
npx prisma migrate deploy

echo "→ starting Mangalyam"
exec "$@"
