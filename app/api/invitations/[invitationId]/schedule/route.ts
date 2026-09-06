import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";
import { scheduleReplaceSchema } from "@/lib/validation";

type Params = { params: Promise<{ invitationId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    return db.invitationScheduleItem.findMany({
      where: { invitationId: invitation.id },
      orderBy: { sortOrder: "asc" },
    });
  });
}

/**
 * Whole-list replace. The builder edits the timeline as an ordered array, so
 * replacing it in one transaction avoids the reorder bookkeeping that
 * per-item PATCHes would need, and cannot leave a half-applied order behind.
 */
export async function PUT(req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);
    const { items } = await parseBody(req, scheduleReplaceSchema);

    await db.$transaction([
      db.invitationScheduleItem.deleteMany({ where: { invitationId: invitation.id } }),
      db.invitationScheduleItem.createMany({
        data: items.map((item, index) => ({
          invitationId: invitation.id,
          time: item.time,
          title: item.title,
          description: item.description ?? null,
          sortOrder: index,
        })),
      }),
    ]);

    return db.invitationScheduleItem.findMany({
      where: { invitationId: invitation.id },
      orderBy: { sortOrder: "asc" },
    });
  });
}
