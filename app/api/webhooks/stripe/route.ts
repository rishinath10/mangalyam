import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentGateway } from "@/lib/payments";
import { STANDARD_ENTITLEMENT } from "@/lib/pricing";

// The signature is computed over the exact bytes Stripe sent, so this route
// must read the raw body and must not run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = await paymentGateway().parseWebhook(raw, signature);
  } catch (err) {
    // A payload we cannot verify is not a server error — it is a rejected
    // request, and it must never touch the database.
    console.error("Rejected payment webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.kind === "ignored" || !event.purchaseId) {
    return NextResponse.json({ received: true });
  }

  const purchase = await db.purchase.findUnique({
    where: { id: event.purchaseId },
    include: { event: { include: { entitlement: true } } },
  });

  if (!purchase) {
    // Acknowledge anyway: retrying will not make a deleted purchase reappear,
    // and a 4xx here would have Stripe hammering the endpoint for days.
    console.error("Payment webhook for unknown purchase:", event.purchaseId);
    return NextResponse.json({ received: true });
  }

  if (event.kind === "failed") {
    if (purchase.status === "pending") {
      await db.purchase.update({ where: { id: purchase.id }, data: { status: "failed" } });
    }
    return NextResponse.json({ received: true });
  }

  // Webhooks are delivered at least once, so settling has to be idempotent.
  if (purchase.status === "paid") {
    return NextResponse.json({ received: true });
  }

  // The amount is re-read from the purchase row, never from the callback:
  // the entitlement follows what we asked to be charged.
  if (event.amountSen !== undefined && event.amountSen !== purchase.amountSen) {
    console.error(
      `Payment amount mismatch on purchase ${purchase.id}: charged ${event.amountSen}, expected ${purchase.amountSen}`,
    );
  }

  await db.$transaction([
    db.purchase.update({
      where: { id: purchase.id },
      data: { status: "paid", paymentGatewayRef: event.reference ?? purchase.paymentGatewayRef },
    }),
    // upsert, because a customer who somehow pays twice should end up with the
    // entitlement they bought rather than a unique-constraint crash
    db.entitlement.upsert({
      where: { eventId: purchase.eventId },
      update: STANDARD_ENTITLEMENT,
      create: { eventId: purchase.eventId, ...STANDARD_ENTITLEMENT },
    }),
  ]);

  return NextResponse.json({ received: true });
}
