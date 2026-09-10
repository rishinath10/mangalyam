-- Artwork overrides for drawn template families.
-- Keyed by the template id from lib/templates/registry.ts rather than a uuid:
-- there is exactly one row per family, and the code's own id is the natural key.
CREATE TABLE "template_art" (
  "template_id" TEXT NOT NULL,
  "ground_url"  TEXT,
  "frame_url"   TEXT,
  "crest_url"   TEXT,
  "divider_url" TEXT,
  "updated_at"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "template_art_pkey" PRIMARY KEY ("template_id")
);
