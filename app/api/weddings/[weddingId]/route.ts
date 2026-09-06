import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requireWedding } from "@/lib/auth/ownership";
import { invitationUsage } from "@/lib/entitlements";
import { weddingUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ weddingId: string }> };

export async function GET(_req: Request, { params }: Params) {
  return handle(async () => {
    const { weddingId } = await params;
    const { wedding } = await requireWedding(weddingId);
    const usage = await invitationUsage(wedding.id, wedding.entitlement);
    const invitations = await db.invitation.findMany({
      where: { weddingId: wedding.id },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });
    return { wedding, usage, invitations };
  });
}

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    const { weddingId } = await params;
    const { wedding } = await requireWedding(weddingId);
    const data = await parseBody(req, weddingUpdateSchema);
    return db.wedding.update({ where: { id: wedding.id }, data });
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    const { weddingId } = await params;
    const { wedding } = await requireWedding(weddingId);
    await db.wedding.delete({ where: { id: wedding.id } });
    return { deleted: true };
  });
}
