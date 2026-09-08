import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requireEvent } from "@/lib/auth/ownership";
import { invitationUsage } from "@/lib/entitlements";
import { eventUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ eventId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { eventId } = await params;
    const { event } = await requireEvent(eventId);
    const usage = await invitationUsage(event.id, event.entitlement);
    const invitations = await db.invitation.findMany({
      where: { eventId: event.id },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });
    return { event, usage, invitations };
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const { eventId } = await params;
    const { event } = await requireEvent(eventId);
    const data = await parseBody(req, eventUpdateSchema);
    return db.event.update({ where: { id: event.id }, data });
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const { eventId } = await params;
    const { event } = await requireEvent(eventId);
    await db.event.delete({ where: { id: event.id } });
    return { deleted: true };
  });
}
