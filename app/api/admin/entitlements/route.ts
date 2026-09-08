import { db } from "@/lib/db";
import { handle, notFound, parseBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import { entitlementSchema } from "@/lib/admin/schemas";

/**
 * Grant or resize an event's invitation allowance — the support action for a
 * payment that failed after the customer was charged, or for a custom job.
 *
 * Deliberately an upsert on eventId: Entitlement is unique per event, and the
 * fix is the same whether a row exists or checkout never created one.
 */
export async function PUT(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const { eventId, invitationLimit } = await parseBody(req, entitlementSchema);

    const event = await db.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) throw notFound("Event");

    return db.entitlement.upsert({
      where: { eventId },
      create: { eventId, invitationLimit },
      update: { invitationLimit },
    });
  });
}
