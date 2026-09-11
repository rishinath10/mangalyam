-- Designs added from the admin screen instead of the registry.
--
-- Artwork is not here: it lives in template_art under the same template_id,
-- so a custom design's border is uploaded through the same route as every
-- other design's, and resolves through the same merge.
CREATE TABLE "custom_designs" (
  "template_id"  TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "tagline"      TEXT NOT NULL,
  "event_types"  "EventType"[] NOT NULL DEFAULT ARRAY[]::"EventType"[],
  "accents"      JSONB NOT NULL,
  "font_pairing" TEXT NOT NULL,
  "tokens"       JSONB NOT NULL,
  "ground_fit"   TEXT,
  "ground_veil"  DOUBLE PRECISION,
  -- Unpublished until there is artwork to show. A customer who picks a design
  -- with no art gets a blank card, so the picker must never offer one.
  "published"    BOOLEAN NOT NULL DEFAULT false,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "custom_designs_pkey" PRIMARY KEY ("template_id")
);
