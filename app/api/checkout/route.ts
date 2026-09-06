import { z } from "zod";
import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { requireWedding } from "@/lib/auth/ownership";
import { auth } from "@/lib/auth";
import { paymentGateway } from "@/lib/payments";
import { CURRENCY, priceSen } from "@/lib/packages";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  weddingId: z.string().uuid(),
  pkg: z.enum(["essential", "signature", "bespoke"]),
});

export async function POST(req: Request) {
  return handle(async () => {
    const input = await parseBody(req, checkoutSchema);
    const { wedding } = await requireWedding(input.weddingId);

    if (wedding.entitlement) {
      throw badRequest("This wedding has already been paid for.");
    }

    const session = await auth();
    const email = session?.user?.email;
    if (!email) throw badRequest("Your account has no email address.");

    // An unset price must stop the sale — but as a clear refusal, not a crash.
    let amountSen: number;
    try {
      amountSen = priceSen(input.pkg);
    } catch {
      throw badRequest("That package is not on sale yet.");
    }

    // The purchase row exists before the customer reaches the gateway, so the
    // webhook always has something to settle against.
    const purchase = await db.purchase.create({
      data: {
        weddingId: wedding.id,
        package: input.pkg,
        amountSen,
        status: "pending",
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    const gateway = paymentGateway();

    const checkout = await gateway.createCheckout({
      weddingId: wedding.id,
      purchaseId: purchase.id,
      pkg: input.pkg,
      amountSen,
      currency: CURRENCY,
      customerEmail: email,
      successUrl: `${base}/dashboard/weddings/${wedding.id}?paid=1`,
      cancelUrl: `${base}/dashboard/weddings/${wedding.id}?cancelled=1`,
    });

    await db.purchase.update({
      where: { id: purchase.id },
      data: { paymentGatewayRef: checkout.reference },
    });

    return { url: checkout.url };
  });
}
