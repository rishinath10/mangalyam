-- Decorative frame artwork for the cover.
--
-- Separate from cover_photo_url rather than reusing it: the two are composited
-- differently and at the same time. The photo sits behind a ~78% scrim as
-- texture; the frame sits above it at full opacity as a border. An invitation
-- may have either, both, or neither.
ALTER TABLE "invitations" ADD COLUMN "frame_url" TEXT;
