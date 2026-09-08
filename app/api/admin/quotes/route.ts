import { db } from "@/lib/db";
import { handle, parseBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import { quoteCreateSchema } from "@/lib/admin/schemas";

export async function POST(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const input = await parseBody(req, quoteCreateSchema);
    const { amount, ...rest } = input;
    return db.quote.create({
      data: { ...rest, amountSen: amount ?? null },
    });
  });
}
