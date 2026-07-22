import type { CheckoutPaymentProvider, PaymentSessionRequest, PaymentSessionResult } from "./types";

export class UnconfiguredPaymentProvider implements CheckoutPaymentProvider {
  async createPaymentSession(_request: PaymentSessionRequest): Promise<PaymentSessionResult> {
    void _request;
    return { status: "unavailable" };
  }
}

export const checkoutPaymentProvider = new UnconfiguredPaymentProvider();
