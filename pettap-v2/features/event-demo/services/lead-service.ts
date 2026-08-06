import "server-only";

import { leadSchema, type LeadInput } from "../schemas/event-demo";
import { LeadRepository, type LeadRecord } from "../repositories/lead-repository";

export class MarketingConsentRequiredError extends Error {
  constructor() {
    super("Marketing consent is required before creating a lead.");
  }
}

export function normalizeLeadEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class LeadService {
  constructor(private readonly repository: Pick<LeadRepository, "upsertByEmail"> = new LeadRepository()) {}

  async upsertMarketingLead(input: LeadInput, now = new Date()): Promise<LeadRecord> {
    const validated = leadSchema.parse(input);
    if (!validated.marketingConsent) throw new MarketingConsentRequiredError();
    return this.repository.upsertByEmail({ ...validated, email: normalizeLeadEmail(validated.email), consentedAt: now });
  }
}
