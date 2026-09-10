-- Where guests send gift money: a bank QR image, typed bank details, or both.
--
-- Off by default. An invitation that silently started asking for money after a
-- deploy would be a betrayal of the host, so every existing row keeps the
-- section hidden until someone turns it on.
ALTER TABLE "invitation_settings"
  ADD COLUMN "gifts_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "gift_note" TEXT,
  ADD COLUMN "gift_qr_url" TEXT,
  ADD COLUMN "gift_bank_name" TEXT,
  ADD COLUMN "gift_account_name" TEXT,
  ADD COLUMN "gift_account_number" TEXT;
