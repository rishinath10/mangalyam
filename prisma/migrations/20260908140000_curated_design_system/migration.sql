-- Curated design system: six open designs collapse to two locked families,
-- and the customer picks from a palette and a font shortlist rather than
-- typing a hex. Dev-only database, so existing rows are remapped in place.

-- accent_color_override held a free hex; accent_key holds a palette key.
ALTER TABLE "invitations" DROP COLUMN "accent_color_override";
ALTER TABLE "invitations" ADD COLUMN "accent_key" TEXT;
ALTER TABLE "invitations" ADD COLUMN "font_pairing" TEXT;

-- Every invitation ever created pointed at gopuram-01 (the only built design).
-- Weddings move to the wedding family, everything else to the general one.
UPDATE "invitations" SET "template_id" = 'mandapam-01'
  FROM "events"
 WHERE "invitations"."event_id" = "events"."id"
   AND "events"."event_type" = 'wedding';

UPDATE "invitations" SET "template_id" = 'deepam-01'
 WHERE "template_id" NOT IN ('mandapam-01', 'deepam-01');
