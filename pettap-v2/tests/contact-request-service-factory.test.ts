import { describe, expect, it } from "vitest";

import {
  createDefaultContactRequestService,
  type ContactRequestDiagnosticStage,
  type ContactRequestServiceFactoryDependencies,
} from "@/features/contact-requests/services/contact-request-service";

const expectedStages = [
  "contact_request_repository_initialization",
  "public_tag_repository_initialization",
  "notification_repository_initialization",
  "provider_factory_initialization",
  "environment_access",
  "notification_service_initialization",
  "contact_request_service_construction",
] as const;

function failingDependencies(stage: typeof expectedStages[number]): ContactRequestServiceFactoryDependencies {
  const fail = () => { throw new Error("internal initialization failure"); };
  return {
    createContactRequestRepository: stage === "contact_request_repository_initialization" ? fail : () => ({}) as never,
    createPublicTagRepository: stage === "public_tag_repository_initialization" ? fail : () => ({}) as never,
    createNotificationRepository: stage === "notification_repository_initialization" ? fail : () => ({}) as never,
    createProvider: stage === "provider_factory_initialization" ? fail : () => ({ name: "fake", send: async () => ({ providerMessageId: null }) }),
    readEnvironment: stage === "environment_access" ? fail : () => ({ NEXT_PUBLIC_SITE_URL: "https://example.test" }),
    createNotificationService: stage === "notification_service_initialization" ? fail : () => ({ enqueueForContactRequest: async () => ({}) }),
    createContactRequestService: stage === "contact_request_service_construction" ? fail : undefined,
  };
}

describe("Contact Request service factory diagnostics", () => {
  for (const stage of expectedStages) {
    it(`classifies ${stage} safely`, () => {
      const logs: Array<{ stage: ContactRequestDiagnosticStage; error: unknown }> = [];
      expect(() => createDefaultContactRequestService((entry) => logs.push(entry), failingDependencies(stage))).toThrow("internal initialization failure");
      expect(logs.map((entry) => entry.stage)).toEqual([stage]);
      expect(JSON.stringify(logs.map((entry) => ({ stage: entry.stage })))).not.toMatch(/secret|token|email|publicCode|actorHash/i);
    });
  }
});
