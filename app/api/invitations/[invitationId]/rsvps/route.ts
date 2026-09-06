import { db } from "@/lib/db";
import { handle } from "@/lib/api";
import { requireInvitation } from "@/lib/auth/ownership";

type Params = { params: Promise<{ invitationId: string }> };

/** Owner-only read. The public route writes; only this one reads back. */
export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { invitationId } = await params;
    const { invitation } = await requireInvitation(invitationId);

    const [rsvps, totals] = await Promise.all([
      db.rsvp.findMany({
        where: { invitationId: invitation.id },
        orderBy: { createdAt: "desc" },
      }),
      db.rsvp.aggregate({
        where: { invitationId: invitation.id, attending: true },
        _sum: { guestCount: true },
        _count: true,
      }),
    ]);

    return {
      rsvps,
      summary: {
        replies: rsvps.length,
        attending: totals._count,
        heads: totals._sum.guestCount ?? 0,
      },
    };
  });
}
