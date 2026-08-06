import type { EventDemoSession, EventDemoTag } from "@/db/schema";

import { EventDemoDomainError } from "./errors";

type TagStatus = EventDemoTag["status"];
type SessionStatus = EventDemoSession["status"];

const tagTransitions: Record<TagStatus, readonly TagStatus[]> = {
  available: ["in_progress", "disabled"],
  in_progress: ["completed", "expired", "disabled"],
  completed: ["available", "disabled"],
  expired: ["available", "disabled"],
  disabled: ["available"],
};

const sessionTransitions: Record<SessionStatus, readonly SessionStatus[]> = {
  started: ["profile_created", "expired", "deleted"],
  profile_created: ["completed", "expired", "deleted"],
  completed: ["expired", "deleted"],
  expired: ["deleted"],
  deleted: [],
};

export function assertEventDemoTagTransition(from: TagStatus, to: TagStatus): void {
  if (from !== to && !tagTransitions[from].includes(to)) throw new EventDemoDomainError("invalid_state_transition");
}

export function assertEventDemoSessionTransition(from: SessionStatus, to: SessionStatus): void {
  if (from !== to && !sessionTransitions[from].includes(to)) throw new EventDemoDomainError("invalid_state_transition");
}
