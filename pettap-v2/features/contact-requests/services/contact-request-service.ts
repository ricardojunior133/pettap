import "server-only";

import { createHash } from "node:crypto";

import { ContactRequestNotificationService, resolveTutorEmail } from "@/features/contact-request-notifications/contact-request-notification-service";
import { DrizzleContactRequestNotificationRepository, type ContactRequestNotificationRepository } from "@/features/contact-request-notifications/contact-request-notification-repository";
import { getContactNotificationProvider } from "@/features/contact-request-notifications/provider-factory";
import type { ContactNotificationProvider } from "@/features/contact-request-notifications/types";
import { PublicTagRepository } from "@/features/nfc/repositories/public-tag-repository";
import { getServerEnv, type ServerEnv } from "@/lib/backend/env";

import { allowFinderContact } from "../contact-request-rate-limit";
import { DrizzleContactRequestRepository, type ContactRequestRepository } from "../repositories/contact-request-repository";
import type { CreateContactRequestInput } from "../schemas/contact-request";

export class ContactRequestError extends Error {
  constructor(readonly code: "RATE_LIMITED" | "UNAVAILABLE" | "INVALID") {
    super("We couldn't send your request. Please try again later.");
  }
}

export type ContactRequestResult = { accepted: true };
type FingerprintHasher = (input: string) => string;
export interface ContactRequestNotificationEnqueuer { enqueueForContactRequest(contactRequestId: string): Promise<unknown>; }
export type ContactRequestFailureStage = "validation" | "public_tag_resolution" | "lost_report_resolution" | "actor_hash" | "rate_limit" | "contact_request_persistence" | "notification_enqueue" | "unknown";
export type ContactRequestServiceInitializationStage = "contact_request_repository_initialization" | "public_tag_repository_initialization" | "notification_repository_initialization" | "provider_factory_initialization" | "notification_service_initialization" | "contact_request_service_construction" | "environment_access" | "unknown_service_initialization";
export type ContactRequestDiagnosticStage = ContactRequestFailureStage | ContactRequestServiceInitializationStage;
export type ContactRequestDiagnosticListener = (diagnostic: { stage: ContactRequestDiagnosticStage; error: unknown }) => void;

export type ContactRequestServiceFactoryDependencies = {
  createContactRequestRepository?: () => ContactRequestRepository;
  createPublicTagRepository?: () => Pick<PublicTagRepository, "findByPublicCode">;
  createNotificationRepository?: () => ContactRequestNotificationRepository;
  createProvider?: () => ContactNotificationProvider;
  readEnvironment?: () => Pick<ServerEnv, "NEXT_PUBLIC_SITE_URL">;
  createNotificationService?: (repository: ContactRequestNotificationRepository, provider: ContactNotificationProvider, siteUrl: string) => ContactRequestNotificationEnqueuer;
  createContactRequestService?: (contacts: ContactRequestRepository, tags: Pick<PublicTagRepository, "findByPublicCode">, notifications: ContactRequestNotificationEnqueuer, diagnostics: ContactRequestDiagnosticListener) => ContactRequestService;
};

/** Persists a private request only after the public Lost state is revalidated server-side. */
export class ContactRequestService {
  constructor(
    private readonly contacts: ContactRequestRepository = new DrizzleContactRequestRepository(),
    private readonly tags: Pick<PublicTagRepository, "findByPublicCode"> = new PublicTagRepository(),
    private readonly rateLimit = allowFinderContact,
    private readonly hash: FingerprintHasher = (value) => createHash("sha256").update(value).digest("hex"),
    private readonly notifications: ContactRequestNotificationEnqueuer = new ContactRequestNotificationService(),
    private readonly now = () => new Date(),
    private readonly diagnostics?: ContactRequestDiagnosticListener,
  ) {}

  async create(input: CreateContactRequestInput, actorFingerprint: string): Promise<ContactRequestResult> {
    if (!this.rateLimit(actorFingerprint)) {
      await this.safeAudit({ action: "contact.request.denied", tagId: null, lostReportId: null, result: "denied", reason: "rate_limited" });
      const error = new ContactRequestError("RATE_LIMITED"); this.report("rate_limit", error); throw error;
    }

    let tag;
    try { tag = await this.tags.findByPublicCode(input.publicCode); } catch (error) { this.report("public_tag_resolution", error); throw error; }
    const report = tag?.lostReport;
    if (!tag || tag.status !== "lost" || !tag.pet || !tag.petId || !tag.pet.publicProfileEnabled || !report || report.status !== "open" || report.petId !== tag.pet.id || report.tagId !== tag.tagId) {
      await this.safeAudit({ action: "contact.request.denied", tagId: tag?.tagId ?? null, lostReportId: report?.id ?? null, result: "denied", reason: "lost_state_unavailable" });
      const error = new ContactRequestError("UNAVAILABLE"); this.report("lost_report_resolution", error); throw error;
    }

    let actorHash: string;
    try { actorHash = this.hash(actorFingerprint); } catch (error) { this.report("actor_hash", error); throw error; }
    let created;
    try {
      created = await this.contacts.createContactRequest({
        lostReportId: report.id,
        petId: tag.pet.id,
        tagId: tag.tagId,
        finderName: input.finderName,
        finderContact: input.finderEmail,
        message: input.message,
        actorHash,
        finderConsentAcceptedAt: this.now(),
      });
    } catch (error) { this.report("contact_request_persistence", error); throw error; }

    if (!created.created) {
      await this.safeAudit({ action: "contact.request.duplicate", tagId: tag.tagId, lostReportId: report.id, result: "denied", reason: "idempotent_reuse" });
    }

    // The notification outbox has its own unique key. Retrying a finder submission
    // can therefore recover a queue fault without creating a second email job.
    try { await this.notifications.enqueueForContactRequest(created.record.id); } catch (error) { this.report("notification_enqueue", error); /* inbox remains the canonical fallback */ }
    return { accepted: true };
  }

  async recordInvalidAttempt() {
    await this.safeAudit({ action: "contact.request.invalid", tagId: null, lostReportId: null, result: "denied", reason: "honeypot" });
  }

  private async safeAudit(event: Parameters<ContactRequestRepository["recordAudit"]>[0]) {
    try { await this.contacts.recordAudit(event); } catch { /* public caller receives the same safe result */ }
  }

  private report(stage: ContactRequestFailureStage, error: unknown) { this.diagnostics?.({ stage, error }); }
}

function initialize<T>(
  stage: ContactRequestServiceInitializationStage,
  diagnostics: ContactRequestDiagnosticListener,
  factory: () => T,
): T {
  try { return factory(); } catch (error) { diagnostics({ stage, error }); throw error; }
}

/** Explicit factory keeps server-only dependency construction observable without exposing configuration. */
export function createDefaultContactRequestService(
  diagnostics: ContactRequestDiagnosticListener,
  dependencies: ContactRequestServiceFactoryDependencies = {},
) {
  let classified = false;
  const factoryDiagnostics: ContactRequestDiagnosticListener = (entry) => { classified = true; diagnostics(entry); };
  try {
    const contacts = initialize("contact_request_repository_initialization", factoryDiagnostics, dependencies.createContactRequestRepository ?? (() => new DrizzleContactRequestRepository()));
    const tags = initialize("public_tag_repository_initialization", factoryDiagnostics, dependencies.createPublicTagRepository ?? (() => new PublicTagRepository()));
    const notificationRepository = initialize("notification_repository_initialization", factoryDiagnostics, dependencies.createNotificationRepository ?? (() => new DrizzleContactRequestNotificationRepository()));
    const provider = initialize("provider_factory_initialization", factoryDiagnostics, dependencies.createProvider ?? getContactNotificationProvider);
    const environment = initialize("environment_access", factoryDiagnostics, dependencies.readEnvironment ?? getServerEnv);
    const notifications = initialize(
      "notification_service_initialization",
      factoryDiagnostics,
      () => dependencies.createNotificationService?.(notificationRepository, provider, environment.NEXT_PUBLIC_SITE_URL)
        ?? new ContactRequestNotificationService(notificationRepository, provider, resolveTutorEmail, environment.NEXT_PUBLIC_SITE_URL),
    );
    return initialize(
      "contact_request_service_construction",
      factoryDiagnostics,
      () => dependencies.createContactRequestService?.(contacts, tags, notifications, diagnostics)
        ?? new ContactRequestService(contacts, tags, undefined, undefined, notifications, undefined, diagnostics),
    );
  } catch (error) {
    // A future expression outside the checkpoints remains safely observable.
    if (!classified) diagnostics({ stage: "unknown_service_initialization", error });
    throw error;
  }
}
