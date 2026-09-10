import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import { settingsUpdateSchema } from "@/lib/validation";
import type { OpeningStyle } from "@prisma/client";

type Params = { params: Promise<{ invitationId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    const input = await parseBody(req, settingsUpdateSchema);

    // Plain scalars, not Prisma's update-input type: the same object feeds
    // both branches of the upsert below.
    const data: {
      musicEnabled?: boolean;
      musicUrl?: string | null;
      countdownEnabled?: boolean;
      galleryEnabled?: boolean;
      rsvpEnabled?: boolean;
      askMealPreference?: boolean;
      rsvpCloseDate?: Date | null;
      openingStyle?: OpeningStyle;
      openingText?: string | null;
      autoScroll?: boolean;
      contactName?: string | null;
      contactPhone?: string | null;
      giftsEnabled?: boolean;
      giftNote?: string | null;
      giftBankName?: string | null;
      giftAccountName?: string | null;
      giftAccountNumber?: string | null;
    } = {};
    if (input.musicEnabled !== undefined) data.musicEnabled = input.musicEnabled;
    if (input.musicUrl !== undefined) data.musicUrl = input.musicUrl ?? null;
    if (input.countdownEnabled !== undefined)
      data.countdownEnabled = input.countdownEnabled;
    if (input.galleryEnabled !== undefined) data.galleryEnabled = input.galleryEnabled;
    if (input.rsvpEnabled !== undefined) data.rsvpEnabled = input.rsvpEnabled;
    if (input.askMealPreference !== undefined)
      data.askMealPreference = input.askMealPreference;
    if (input.rsvpCloseDate !== undefined)
      data.rsvpCloseDate = input.rsvpCloseDate
        ? new Date(`${input.rsvpCloseDate}T00:00:00Z`)
        : null;

    if (input.openingStyle !== undefined) data.openingStyle = input.openingStyle;
    if (input.openingText !== undefined) data.openingText = input.openingText || null;
    if (input.autoScroll !== undefined) data.autoScroll = input.autoScroll;
    if (input.contactName !== undefined) data.contactName = input.contactName || null;
    if (input.contactPhone !== undefined) data.contactPhone = input.contactPhone || null;

    // Gift details. giftQrUrl is absent by design — the image is written only
    // by the gift-qr route, which stores the file itself.
    if (input.giftsEnabled !== undefined) data.giftsEnabled = input.giftsEnabled;
    if (input.giftNote !== undefined) data.giftNote = input.giftNote || null;
    if (input.giftBankName !== undefined) data.giftBankName = input.giftBankName || null;
    if (input.giftAccountName !== undefined)
      data.giftAccountName = input.giftAccountName || null;
    if (input.giftAccountNumber !== undefined)
      data.giftAccountNumber = input.giftAccountNumber || null;

    // Upsert rather than update: an invitation created before settings existed
    // (or by a future import path) must not 500 on its first settings save.
    return db.invitationSettings.upsert({
      where: { invitationId: invitation.id },
      update: data,
      create: { invitationId: invitation.id, ...data },
    });
  });
}
