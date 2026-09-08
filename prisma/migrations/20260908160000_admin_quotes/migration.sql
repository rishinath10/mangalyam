-- Custom quotes: jobs outside the flat single-invitation price.
-- Deliberately unlinked to users or events — an enquiry usually arrives from
-- someone who has no account yet, so requiring one would mean inventing a
-- customer row before there is a customer.
CREATE TYPE "QuoteStatus" AS ENUM ('new', 'quoted', 'accepted', 'declined', 'delivered');

CREATE TABLE "quotes" (
  "id"         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"       TEXT          NOT NULL,
  "email"      TEXT,
  "phone"      TEXT,
  "occasion"   TEXT,
  "details"    TEXT          NOT NULL,
  "amount_sen" INTEGER,
  "status"     "QuoteStatus" NOT NULL DEFAULT 'new',
  "notes"      TEXT,
  "created_at" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3)  NOT NULL
);

-- The quotes list is read newest-first within a status filter.
CREATE INDEX "quotes_status_created_at_idx" ON "quotes" ("status", "created_at");
