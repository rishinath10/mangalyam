import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, unauthorized } from "@/lib/api";

/**
 * There is no Row Level Security in this stack (CLAUDE.md rule #4). Every read
 * or write of a wedding-owned row goes through one of these guards, which
 * resolve the row *and* prove the signed-in user owns the wedding above it in
 * the same query. Never fetch a wedding-owned row by id alone.
 */

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw unauthorized();
  return id;
}

export async function requireWedding(weddingId: string) {
  const userId = await requireUserId();
  const wedding = await db.wedding.findFirst({
    where: { id: weddingId, userId },
    include: { entitlement: true },
  });
  if (!wedding) throw notFound("Wedding");
  return { userId, wedding };
}

/**
 * Resolves an invitation only if the caller owns its parent wedding. The
 * ownership predicate lives in the `where` clause so an unowned id can never
 * produce a row in the first place.
 */
export async function requireInvitation(invitationId: string) {
  const userId = await requireUserId();
  const invitation = await db.invitation.findFirst({
    where: { id: invitationId, wedding: { userId } },
    include: { wedding: { include: { entitlement: true } } },
  });
  if (!invitation) throw notFound("Invitation");
  return { userId, invitation };
}

/** Same guarantee, one level deeper: child rows are reached via the invitation. */
export async function requireScheduleItem(itemId: string) {
  const userId = await requireUserId();
  const item = await db.invitationScheduleItem.findFirst({
    where: { id: itemId, invitation: { wedding: { userId } } },
  });
  if (!item) throw notFound("Schedule item");
  return { userId, item };
}

export async function requirePhoto(photoId: string) {
  const userId = await requireUserId();
  const photo = await db.invitationPhoto.findFirst({
    where: { id: photoId, invitation: { wedding: { userId } } },
  });
  if (!photo) throw notFound("Photo");
  return { userId, photo };
}
