-- The mascot inside a guest's invitation: he greets after the cover opens and
-- cheers when a reply is sent.
--
-- Off unless the host turns it on. A family that chose a formal design should
-- not find a cartoon on it, so every existing invitation stays as it is.
ALTER TABLE "invitation_settings"
  ADD COLUMN "greeter" BOOLEAN NOT NULL DEFAULT false;
