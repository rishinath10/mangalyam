import Stripe from "stripe";
import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentEvent,
  PaymentGateway,
} from "@/lib/payments/types";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

let client: Stripe | null = null;

function stripe(): Stripe {
  if (!client) client = new Stripe(required("STRIPE_SECRET_KEY"));
  return client;
}

export const stripeGateway: PaymentGateway = {
  name: "stripe",

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        customer_email: req.customerEmail,
        success_url: req.successUrl,
        cancel_url: req.cancelUrl,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: req.currency,
              unit_amount: req.amountSen,
              product_data: {
                name: `Mangalyam — ${req.pkg} package`,
                description: "One wedding. Digital invitations for every ceremony.",
              },
            },
          },
        ],
        // Everything needed to settle the purchase travels with the session,
        // so the webhook never has to guess which row it belongs to.
        metadata: { purchaseId: req.purchaseId, weddingId: req.weddingId, package: req.pkg },
      },
      // Stripe deduplicates on this key, so a double-clicked button or a
      // retried request cannot create two checkouts for one purchase.
      { idempotencyKey: `checkout:${req.purchaseId}` },
    );

    if (!session.url) throw new Error("Stripe returned a session without a URL");
    return { url: session.url, reference: session.id };
  },

  async parseWebhook(rawBody: string, signature: string | null): Promise<PaymentEvent> {
    if (!signature) throw new Error("Missing Stripe signature header");

    // Throws on a bad signature, which is the point: an unverified payload
    // must never be allowed to grant an entitlement.
    const event = stripe().webhooks.constructEvent(
      rawBody,
      signature,
      required("STRIPE_WEBHOOK_SECRET"),
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // `completed` fires for async methods like FPX before the money has
        // actually settled, so only a paid session counts.
        if (session.payment_status !== "paid") return { kind: "ignored" };
        return {
          kind: "paid",
          purchaseId: session.metadata?.purchaseId,
          reference: session.id,
          amountSen: session.amount_total ?? undefined,
        };
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        return {
          kind: "paid",
          purchaseId: session.metadata?.purchaseId,
          reference: session.id,
          amountSen: session.amount_total ?? undefined,
        };
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object;
        return { kind: "failed", purchaseId: session.metadata?.purchaseId, reference: session.id };
      }
      default:
        return { kind: "ignored" };
    }
  },
};
