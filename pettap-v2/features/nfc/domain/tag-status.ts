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

const transitionMap: Readonly<Record<NfcTagStatus, readonly NfcTagStatus[]>> = {
  unassigned: ["active"],
  active: ["suspended", "lost", "retired"],
  suspended: ["active"],
  lost: ["active"],
  retired: [],
};

export class InvalidNfcTagStatusTransitionError extends Error {
  constructor(from: NfcTagStatus, to: NfcTagStatus) {
    super(`Invalid NFC tag status transition: ${from} -> ${to}.`);
  }
}

/** The only allowed persisted NFC lifecycle transitions. */
export function canTransition(from: NfcTagStatus, to: NfcTagStatus): boolean {
  return transitionMap[from].includes(to);
}

/** Validates an NFC lifecycle transition before any repository writes state. */
export function transition(from: NfcTagStatus, to: NfcTagStatus): NfcTagStatus {
  if (!canTransition(from, to)) throw new InvalidNfcTagStatusTransitionError(from, to);
  return to;
}

export function isPubliclyResolvableTagStatus(status: NfcTagStatus): boolean {
  return status === "active" || status === "lost";
}
