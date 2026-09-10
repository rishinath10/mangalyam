import { db } from "@/lib/db";
import { badRequest, handle } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  UnreadableImageError,
  deleteImage,
  storeImage,
} from "@/lib/storage";

type Params = { params: Promise<{ invitationId: string }> };

export const runtime = "nodejs";

/** The stored image this invitation is replacing, so it can be cleaned up. */
async function currentQr(invitationId: string): Promise<string | null> {
  const row = await db.invitationSettings.findUnique({
    where: { invitationId },
    select: { giftQrUrl: true },
  });
  return row?.giftQrUrl ?? null;
}

/**
 * The host's payment QR — a DuitNow or bank code they screenshot out of their
 * banking app.
 *
 * It arrives as a file rather than a URL for the same reason a cover photo
 * does: the image ends up as the `src` of an `<img>` on a public page, and the
 * only way to be certain that is an image and not a tracking pixel or a
 * redirect to someone else's site is to decode it and re-encode it ourselves.
 * Storage keeps this one lossless — see LOSSLESS_VARIANTS in lib/storage.ts.
 */
export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) throw badRequest("Attach an image as `file`");
    if (file.size > MAX_UPLOAD_BYTES) {
      throw badRequest(
        `Images must be under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB`,
      );
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      throw badRequest("Upload a JPEG, PNG, WebP, AVIF or HEIC image");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let stored;
    try {
      stored = await storeImage(buffer, "qr", `invitations/${invitation.id}`);
    } catch (err) {
      // Only a genuinely undecodable file is the uploader's problem. A storage
      // outage carries on up to `handle`, which answers 503 and says the fault
      // is ours rather than blaming a file that is perfectly fine.
      if (!(err instanceof UnreadableImageError)) throw err;
      throw badRequest("That file could not be read as an image");
    }

    // Read the old URL separately rather than widening requireInvitation:
    // every route in the app goes through that guard, and none of the others
    // wants a settings join.
    const previous = await currentQr(invitation.id);
    const settings = await db.invitationSettings.upsert({
      where: { invitationId: invitation.id },
      update: { giftQrUrl: stored.url },
      create: { invitationId: invitation.id, giftQrUrl: stored.url },
    });
    if (previous) await deleteImage(previous);

    return settings;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);

    const previous = await currentQr(invitation.id);
    const settings = await db.invitationSettings.upsert({
      where: { invitationId: invitation.id },
      update: { giftQrUrl: null },
      create: { invitationId: invitation.id },
    });
    if (previous) await deleteImage(previous);

    return settings;
  });
}
