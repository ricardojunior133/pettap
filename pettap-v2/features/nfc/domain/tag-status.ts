/**
 * Canonical persisted NFC tag states. Values are reconciled with migration 0000
 * and the Drizzle tag_status mapping; this module deliberately adds no state.
 */
export const nfcTagStatuses = [
  "unassigned",
  "active",
  "suspended",
  "lost",
  "retired",
] as const;

export type NfcTagStatus = (typeof nfcTagStatuses)[number];

export function isNfcTagStatus(value: unknown): value is NfcTagStatus {
  return typeof value === "string" && nfcTagStatuses.includes(value as NfcTagStatus);
}

export function isPubliclyResolvableTagStatus(status: NfcTagStatus): boolean {
  return status === "active" || status === "lost";
}
