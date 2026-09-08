-- Wedding -> Event: the top-level entity generalises from weddings to every
-- Malaysian Indian celebration (CLAUDE.md pivot). This is a dev-only database
-- with no real customer data, so the migration backfills a sensible value
-- for every new column rather than tracking a dual-write period.

CREATE TYPE "EventType" AS ENUM (
  'wedding', 'naming_ceremony', 'housewarming', 'sixtieth_birthday',
  'temple_consecration', 'home_pooja', 'community_event', 'custom'
);

-- ---------- weddings -> events ----------
ALTER TABLE "weddings" ADD COLUMN "host_names" TEXT;
ALTER TABLE "weddings" ADD COLUMN "event_type" "EventType";
UPDATE "weddings" SET
  "host_names" = "couple_name1" || ' & ' || "couple_name2",
  "event_type" = 'wedding';
ALTER TABLE "weddings" ALTER COLUMN "host_names" SET NOT NULL;
ALTER TABLE "weddings" ALTER COLUMN "event_type" SET NOT NULL;
ALTER TABLE "weddings" DROP COLUMN "couple_name1";
ALTER TABLE "weddings" DROP COLUMN "couple_name2";
ALTER TABLE "weddings" RENAME TO "events";

-- ---------- purchases: flat pricing, no more package tiers ----------
ALTER TABLE "purchases" RENAME COLUMN "wedding_id" TO "event_id";
ALTER TABLE "purchases" DROP COLUMN "package";
DROP TYPE "Package";

-- ---------- entitlements: self-serve is always exactly one invitation ----------
ALTER TABLE "entitlements" RENAME COLUMN "wedding_id" TO "event_id";
UPDATE "entitlements" SET "invitation_limit" = 1 WHERE "invitation_limit" IS NULL;
ALTER TABLE "entitlements" ALTER COLUMN "invitation_limit" SET NOT NULL;
ALTER TABLE "entitlements" DROP COLUMN "premium_templates";
ALTER TABLE "entitlements" DROP COLUMN "gift_registry";
ALTER TABLE "entitlements" DROP COLUMN "custom_domain";
ALTER TABLE "entitlements" DROP COLUMN "remove_branding";

-- ---------- invitations: ceremony_type is wedding-only now ----------
ALTER TABLE "invitations" RENAME COLUMN "wedding_id" TO "event_id";
ALTER TABLE "invitations" ALTER COLUMN "ceremony_type" DROP NOT NULL;
