import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync("db/schema/core.ts", "utf8");
const migration = readFileSync("db/migrations/0016_contact_request_notification_foundation.sql", "utf8");
const repository = readFileSync("features/contact-request-notifications/contact-request-notification-repository.ts", "utf8");

describe("contact request notification model", () => {
  it("defines an order-independent outbox with canonical type and status enums", () => {
    expect(schema).toContain('contactRequestNotificationType = pgEnum("contact_request_notification_type", ["finder_contact_received"])');
    expect(schema).toContain('contactRequestNotificationStatus = pgEnum("contact_request_notification_status", ["pending", "processing", "sent", "failed", "cancelled"])');
    expect(schema).toContain('contactRequestNotifications = pgTable("contact_request_notifications"');
    expect(schema).not.toMatch(/contactRequestNotifications[\s\S]{0,1200}orderId/);
  });

  it("has FK, idempotency, retry indexes and no public read access", () => {
    for (const clause of ["contact_request_id_contact_requests_id_fk", "contact_request_notifications_request_type_unique", "contact_request_notifications_status_retry_idx", "ENABLE ROW LEVEL SECURITY", "REVOKE ALL ON TABLE \"contact_request_notifications\" FROM anon", "GRANT SELECT ON TABLE \"contact_request_notifications\" TO authenticated", "contact_request_notifications_owner_select"]) expect(migration).toContain(clause);
  });

  it("keeps the recipient, finder content and actor hash out of owner-facing selects and audit metadata", () => {
    expect(repository).not.toMatch(/ownerColumns[\s\S]{0,500}actorHash/);
    expect(repository).toContain("onConflictDoNothing");
    expect(repository).toContain("markProcessing");
    expect(repository).toContain("PROCESSING_LEASE_DURATION_MS");
    expect(repository).toContain('eq(contactRequestNotifications.status, "processing")');
    expect(repository).toContain("lte(contactRequestNotifications.updatedAt, processingLeaseExpiredBefore)");
    expect(repository).not.toContain("finderName: contactRequests.finderName, recipientEmail: contactRequestNotifications.recipientEmail, actorHash");
  });
});
