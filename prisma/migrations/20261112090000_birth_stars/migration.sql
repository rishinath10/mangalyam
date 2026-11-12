-- Birth stars, shown on the invitation when the host chooses to give them.
--
-- Only the answer is stored — which of the twenty-seven stars and which of the
-- twelve signs — never the birthday it was worked out from. The invitation is
-- a public page, and a date of birth has no business being recoverable from
-- it.
--
-- All four are nullable with no default, so every existing invitation is
-- unchanged: no star, no section.
ALTER TABLE "invitation_settings"
  ADD COLUMN "star_one" SMALLINT,
  ADD COLUMN "raasi_one" SMALLINT,
  ADD COLUMN "star_two" SMALLINT,
  ADD COLUMN "raasi_two" SMALLINT;
