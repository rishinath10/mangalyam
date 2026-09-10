import { db } from "@/lib/db";
import { badRequest, handle, notFound } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  UnreadableImageError,
  deleteImage,
  storeImage,
} from "@/lib/storage";

type Params = { params: Promise<{ invitationId: string }> };

export const runtime = "nodejs";

/**
 * Frame artwork: the decorative border drawn around the cover at full
 * strength. Same shape as the cover route, but a different storage variant —
 * a frame keeps its alpha, where a cover photo never has any.
 *
 * Admin-only, and deliberately so. A frame is bespoke artwork drawn to a 3:4
 * stage with a transparent middle, because the names are live text printed on
 * top of it; a customer's own PNG almost always fights the design it replaces
 * rather than finishing it. So the capability stays, the self-serve upload
 * does not — this is how a commissioned border gets fitted for someone.
 *
 * requireAdmin() rather than requireInvitation(): the guard here is the
 * allowlist, not ownership, since the whole point is reaching an invitation
 * belonging to somebody else.
 */
export async function POST(req: Request, { params }: Params) {
  return handle(async () => {
    await requireAdmin();
    const { invitationId } = await params;
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true, frameUrl: true },
    });
    if (!invitation) throw notFound("Invitation");

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
    } catch (err) {
      // A storage outage is ours, not theirs: let it through as a 500
      // rather than telling someone their file is broken when it is not.
      if (!(err instanceof UnreadableImageError)) throw err;
      throw badRequest("That file could not be read as an image");
    }

    const previous = invitation.frameUrl;
    const updated = await db.invitation.update({
      where: { id: invitation.id },
      data: { frameUrl: stored.url },
      select: { id: true, frameUrl: true },
    });
    if (previous) await deleteImage(previous);

    return updated;
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    await requireAdmin();
    const { invitationId } = await params;
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true, frameUrl: true },
    });
    if (!invitation) throw notFound("Invitation");

    const updated = await db.invitation.update({
      where: { id: invitation.id },
      data: { frameUrl: null },
      select: { id: true, frameUrl: true },
    });
    if (invitation.frameUrl) await deleteImage(invitation.frameUrl);
    return updated;
  });
}
