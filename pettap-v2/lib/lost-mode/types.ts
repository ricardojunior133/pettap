export type PetStatus = "protected" | "lost" | "inactive" | "pending" | "replacement";
export type LostModeState = "inactive" | "active";
export type EmergencyEvent = "lost-mode-enabled" | "pettap-scanned" | "owner-contacted" | "pet-reunited";

export interface TimelineEvent {
  id: string;
  event: EmergencyEvent;
  title: string;
  detail: string;
  timestamp: string;
}

export interface LostModeData {
  petId: string;
  petName: string;
  state: LostModeState;
  status: PetStatus;
  banner: { title: string; description: string };
  helpItems: string[];
  timeline: TimelineEvent[];
  confirmation: { title: string; description: string; cancel: string; confirm: string };
  success: { title: string; description: string; action: string };
}
