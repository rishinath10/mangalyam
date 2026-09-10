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
      stored = await storeImage(buffer, "cover", `invitations/${invitation.id}`);
    } catch (err) {
      // A storage outage is ours, not theirs: let it through to `handle`,
      // which answers 503 and says so, rather than telling someone their
      // file is broken when it is not.
      if (!(err instanceof UnreadableImageError)) throw err;
      throw badRequest("That file could not be read as an image");
    }

    const previous = invitation.coverPhotoUrl;
    const updated = await db.invitation.update({
      where: { id: invitation.id },
      data: { coverPhotoUrl: stored.url },
    });
    if (previous) await deleteImage(previous);

    return updated;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    const updated = await db.invitation.update({
      where: { id: invitation.id },
      data: { coverPhotoUrl: null },
    });
    if (invitation.coverPhotoUrl) await deleteImage(invitation.coverPhotoUrl);
    return updated;
  });
}
