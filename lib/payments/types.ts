/**
 * The gateway seam (CLAUDE.md Section 8). Stripe is the chosen provider, but
 * the app only ever talks to this interface — Billplz or ToyyibPay would be a
 * new implementation of these three methods, not a rewrite of the app.
 *
 * That matters here specifically: most Malaysian families pay by FPX, and if
 * Stripe's FPX terms don't work out, switching should cost a file.
 */
export interface CheckoutRequest {
  eventId: string;
  purchaseId: string;
  /** Minor units — sen. Nothing in this codebase decides the number. */
  amountSen: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  /** Where to send the customer to pay. */
  url: string;
  /** The gateway's own id, stored on the purchase for reconciliation. */
  reference: string;
}

/** What a verified gateway callback tells us, normalised. */
export interface PaymentEvent {
  kind: "paid" | "failed" | "ignored";
  purchaseId?: string;
  reference?: string;
  amountSen?: number;
}

export interface PaymentGateway {
  readonly name: string;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /**
   * Verifies the callback signature and normalises it. Throws if the payload
   * cannot be trusted — an unverified callback must never move money state.
   */
  parseWebhook(rawBody: string, signature: string | null): Promise<PaymentEvent>;
}
