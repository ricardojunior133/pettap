export type WaitlistResult =
  | { status: "subscribed" }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export interface WaitlistService {
  subscribe(email: string): Promise<WaitlistResult>;
}

class EndpointWaitlistService implements WaitlistService {
  async subscribe(email: string): Promise<WaitlistResult> {
    const endpoint = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT;
    if (!endpoint) return { status: "unavailable", message: "Email notifications are being connected. Please check back soon." };

    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      return response.ok ? { status: "subscribed" } : { status: "error", message: "We could not save your email. Please try again shortly." };
    } catch {
      return { status: "error", message: "We could not save your email. Please try again shortly." };
    }
  }
}

export const waitlistService: WaitlistService = new EndpointWaitlistService();
