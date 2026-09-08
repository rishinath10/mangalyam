import { db } from "@/lib/db";
import { handle, notFound, parseBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import { quoteUpdateSchema } from "@/lib/admin/schemas";

type Params = { params: Promise<{ quoteId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  return handle(async () => {
    await requireAdmin();
    const { quoteId } = await params;
    const input = await parseBody(req, quoteUpdateSchema);

    // `amount` arrives in ringgit and is stored in sen, so it cannot be spread
    // through under its own name.
    const { amount, ...rest } = input;
    const data = amount === undefined ? rest : { ...rest, amountSen: amount };

    const existing = await db.quote.findUnique({ where: { id: quoteId }, select: { id: true } });
    if (!existing) throw notFound("Quote");

    return db.quote.update({ where: { id: quoteId }, data });
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  return handle(async () => {
    await requireAdmin();
    const { quoteId } = await params;
    const existing = await db.quote.findUnique({ where: { id: quoteId }, select: { id: true } });
    if (!existing) throw notFound("Quote");
    await db.quote.delete({ where: { id: quoteId } });
    return { ok: true };
  });
}
