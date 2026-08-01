export type ContactRequestStatus = "pending" | "delivered" | "closed" | "expired" | "cancelled";

const allowedTransitions: Record<ContactRequestStatus, readonly ContactRequestStatus[]> = {
  pending: ["delivered", "closed", "expired"],
  delivered: ["closed", "expired"],
  closed: [],
  expired: [],
  cancelled: [],
};

/** The sole lifecycle contract for private finder contact requests. */
export function canTransitionContactRequest(from: ContactRequestStatus, to: ContactRequestStatus) {
  return from === to || allowedTransitions[from].includes(to);
}
