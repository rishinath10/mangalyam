import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requireUserId } from "@/lib/auth/ownership";
import { eventCreateSchema } from "@/lib/validation";

export async function GET() {
  return handle(async () => {
    const userId = await requireUserId();
    // Scoped by userId, not filtered after the fact — there is no RLS behind
    // this query to catch a mistake (rule #4).
    return db.event.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        entitlement: true,
        _count: { select: { invitations: true } },
      },
    });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const userId = await requireUserId();
    const data = await parseBody(req, eventCreateSchema);
    return db.event.create({ data: { ...data, userId } });
  });
}
