import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  storeImage,
} from "@/lib/storage";
import { photoReorderSchema } from "@/lib/validation";

type Params = { params: Promise<{ invitationId: string }> };

// sharp is a native module; this route cannot run on the edge runtime.
export const runtime = "nodejs";

const MAX_PHOTOS_PER_INVITATION = 30;

export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    return db.invitationPhoto.findMany({
      where: { invitationId: invitation.id },
      orderBy: { sortOrder: "asc" },
    });
  });
}

/** multipart upload: `file` plus an optional `caption`. */
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

    const count = await db.invitationPhoto.count({
      where: { invitationId: invitation.id },
    });
    if (count >= MAX_PHOTOS_PER_INVITATION) {
      throw badRequest(`A gallery holds up to ${MAX_PHOTOS_PER_INVITATION} photos`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // sharp throws on anything that is not decodable as an image, which is the
    // real check — the declared MIME type above is only a cheap pre-filter.
    let stored;
    try {
      stored = await storeImage(buffer, "gallery", `invitations/${invitation.id}`);
    } catch {
      throw badRequest("That file could not be read as an image");
    }

    const caption = form?.get("caption");
    return db.invitationPhoto.create({
      data: {
        invitationId: invitation.id,
        url: stored.url,
        caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
        sortOrder: count,
      },
    });
  });
}

/** Reorder by sending the full ordered list of photo ids. */
export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    const { ids } = await parseBody(req, photoReorderSchema);

    // Scope the updates to this invitation so an id belonging to someone
    // else's gallery matches nothing instead of being reordered.
    await db.$transaction(
      ids.map((id, index) =>
        db.invitationPhoto.updateMany({
          where: { id, invitationId: invitation.id },
          data: { sortOrder: index },
        }),
      ),
    );

    return db.invitationPhoto.findMany({
      where: { invitationId: invitation.id },
      orderBy: { sortOrder: "asc" },
    });
  });
}
