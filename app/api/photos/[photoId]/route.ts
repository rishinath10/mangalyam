import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requirePhoto } from "@/lib/auth/ownership";
import { deleteImage } from "@/lib/storage";
import { photoUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ photoId: string }> };

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const { photoId } = await params;
    const { photo } = await requirePhoto(photoId);
    const input = await parseBody(req, photoUpdateSchema);

    return db.invitationPhoto.update({
      where: { id: photo.id },
      data: {
        ...(input.caption !== undefined ? { caption: input.caption ?? null } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const { photoId } = await params;
    const { photo } = await requirePhoto(photoId);
    await db.invitationPhoto.delete({ where: { id: photo.id } });
    // After the row is gone: an orphaned object is recoverable, a row pointing
    // at a deleted object renders a broken image on a live invitation.
    await deleteImage(photo.url);
    return { deleted: true };
  });
}
