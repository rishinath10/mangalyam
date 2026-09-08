import { db } from "@/lib/db";
import { badRequest, handle } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  deleteImage,
  storeImage,
} from "@/lib/storage";

type Params = { params: Promise<{ invitationId: string }> };

export const runtime = "nodejs";

/**
 * Frame artwork: the decorative border drawn around the cover at full
 * strength. Same shape as the cover route, but a different storage variant —
 * a frame keeps its alpha, where a cover photo never has any.
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
      throw badRequest("Upload a PNG or WebP with a transparent centre");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let stored;
    try {
      stored = await storeImage(buffer, "frame", `invitations/${invitation.id}`);
    } catch {
      throw badRequest("That file could not be read as an image");
    }

    const previous = invitation.frameUrl;
    const updated = await db.invitation.update({
      where: { id: invitation.id },
      data: { frameUrl: stored.url },
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
      data: { frameUrl: null },
    });
    if (invitation.frameUrl) await deleteImage(invitation.frameUrl);
    return updated;
  });
}
