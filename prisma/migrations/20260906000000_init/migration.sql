-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Package" AS ENUM ('essential', 'signature', 'bespoke');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "CeremonyType" AS ENUM ('mehendi', 'haldi', 'sangeet', 'muhurtham', 'nalangu', 'baraat', 'reception', 'engagement', 'custom');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "DesignSystem" AS ENUM ('temple_heritage', 'kolam_classic', 'kalash_royal');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weddings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "couple_name1" TEXT NOT NULL,
    "couple_name2" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "package" "Package" NOT NULL,
    "amount_sen" INTEGER NOT NULL,
    "payment_gateway_ref" TEXT,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entitlements" (
    "id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "invitation_limit" INTEGER,
    "premium_templates" BOOLEAN NOT NULL DEFAULT false,
    "gift_registry" BOOLEAN NOT NULL DEFAULT false,
    "custom_domain" BOOLEAN NOT NULL DEFAULT false,
    "remove_branding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "ceremony_type" "CeremonyType" NOT NULL,
    "custom_ceremony_name" TEXT,
    "template_id" TEXT NOT NULL,
    "accent_color_override" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'draft',
    "date" DATE,
    "start_time" TEXT,
    "end_time" TEXT,
    "venue_name" TEXT,
    "address" TEXT,
    "map_link" TEXT,
    "description" TEXT,
    "cover_photo_url" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_schedule_items" (
    "id" UUID NOT NULL,
    "invitation_id" UUID NOT NULL,
    "time" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invitation_schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_photos" (
    "id" UUID NOT NULL,
    "invitation_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invitation_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation_settings" (
    "invitation_id" UUID NOT NULL,
    "music_enabled" BOOLEAN NOT NULL DEFAULT false,
    "music_url" TEXT,
    "countdown_enabled" BOOLEAN NOT NULL DEFAULT true,
    "gallery_enabled" BOOLEAN NOT NULL DEFAULT true,
    "rsvp_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ask_meal_preference" BOOLEAN NOT NULL DEFAULT false,
    "rsvp_close_date" DATE,
    "language" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "invitation_settings_pkey" PRIMARY KEY ("invitation_id")
);

-- CreateTable
CREATE TABLE "rsvps" (
    "id" UUID NOT NULL,
    "invitation_id" UUID NOT NULL,
    "guest_name" TEXT NOT NULL,
    "attending" BOOLEAN NOT NULL,
    "guest_count" INTEGER NOT NULL DEFAULT 1,
    "meal_preference" TEXT,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rsvps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "design_system" "DesignSystem" NOT NULL,
    "manifest_json" JSONB NOT NULL,
    "preview_image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "weddings_user_id_idx" ON "weddings"("user_id");

-- CreateIndex
CREATE INDEX "purchases_wedding_id_idx" ON "purchases"("wedding_id");

-- CreateIndex
CREATE UNIQUE INDEX "entitlements_wedding_id_key" ON "entitlements"("wedding_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_slug_key" ON "invitations"("slug");

-- CreateIndex
CREATE INDEX "invitations_wedding_id_idx" ON "invitations"("wedding_id");

-- CreateIndex
CREATE INDEX "invitation_schedule_items_invitation_id_idx" ON "invitation_schedule_items"("invitation_id");

-- CreateIndex
CREATE INDEX "invitation_photos_invitation_id_idx" ON "invitation_photos"("invitation_id");

-- CreateIndex
CREATE INDEX "rsvps_invitation_id_idx" ON "rsvps"("invitation_id");

-- AddForeignKey
ALTER TABLE "weddings" ADD CONSTRAINT "weddings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_schedule_items" ADD CONSTRAINT "invitation_schedule_items_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_photos" ADD CONSTRAINT "invitation_photos_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_settings" ADD CONSTRAINT "invitation_settings_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

