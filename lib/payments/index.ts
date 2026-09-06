import { stripeGateway } from "@/lib/payments/stripe";
import type { PaymentGateway } from "@/lib/payments/types";

/**
 * The one place the app names a provider. Everything else depends on the
 * PaymentGateway interface, so moving to Billplz or ToyyibPay is a new file
 * and a changed line here.
 */
export function paymentGateway(): PaymentGateway {
  return stripeGateway;
}

export type { CheckoutRequest, CheckoutSession, PaymentEvent, PaymentGateway } from "@/lib/payments/types";
