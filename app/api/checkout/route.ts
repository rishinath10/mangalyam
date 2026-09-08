import { z } from "zod";
import { db } from "@/lib/db";
import { badRequest, handle, parseBody } from "@/lib/api";
import { requireEvent } from "@/lib/auth/ownership";
import { auth } from "@/lib/auth";
import { paymentGateway } from "@/lib/payments";
import { CURRENCY, priceSen } from "@/lib/pricing";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  eventId: z.string().uuid(),
});

export async function POST(req: Request) {
  return handle(async () => {
    const input = await parseBody(req, checkoutSchema);
    const { event } = await requireEvent(input.eventId);

    if (event.entitlement) {
      throw badRequest("This event has already been paid for.");
    }

    const session = await auth();
    const email = session?.user?.email;
    if (!email) throw badRequest("Your account has no email address.");

    // An unset price must stop the sale — but as a clear refusal, not a crash.
    let amountSen: number;
    try {
      amountSen = priceSen();
    } catch {
      throw badRequest("Invitations are not on sale yet.");
    }

    // The purchase row exists before the customer reaches the gateway, so the
    // webhook always has something to settle against.
    const purchase = await db.purchase.create({
      data: {
        eventId: event.id,
        amountSen,
        status: "pending",
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    const gateway = paymentGateway();

    const checkout = await gateway.createCheckout({
      eventId: event.id,
      purchaseId: purchase.id,
      amountSen,
      currency: CURRENCY,
      customerEmail: email,
      successUrl: `${base}/dashboard/events/${event.id}?paid=1`,
      cancelUrl: `${base}/dashboard/events/${event.id}?cancelled=1`,
    });

    await db.purchase.update({
      where: { id: purchase.id },
      data: { paymentGatewayRef: checkout.reference },
    });

    return { url: checkout.url };
  });
}
