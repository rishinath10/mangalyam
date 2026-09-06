-- The cover a guest taps before the invitation is revealed, plus the person
-- they ring about the ceremony. Both live on invitation_settings because they
-- are per-ceremony choices the builder edits, not billing or ownership facts.

CREATE TYPE "OpeningStyle" AS ENUM ('doors', 'envelope', 'veil');

ALTER TABLE "invitation_settings"
  ADD COLUMN "opening_style" "OpeningStyle" NOT NULL DEFAULT 'doors',
  ADD COLUMN "opening_text"  TEXT,
  ADD COLUMN "auto_scroll"   BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "contact_name"  TEXT,
  ADD COLUMN "contact_phone" TEXT;
