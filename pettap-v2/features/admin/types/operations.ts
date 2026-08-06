export interface AdminCustomerSummaryViewModel {
  accountId: string;
  displayName: string;
  maskedEmail: string | null;
  createdAt: string;
  petCount: number;
  tagCount: number;
}

export interface AdminPetSummaryViewModel {
  id: string;
  accountId: string;
  name: string;
  species: string;
  publicId: string;
  createdAt: string;
  lostModeActive: boolean;
  tagCount: number;
  primaryPhotoUrl: string | null;
  medicalInformationPresent: boolean;
}

export interface AdminTagSummaryViewModel {
  id: string;
  publicId: string;
  status: "unassigned" | "active" | "suspended" | "lost" | "retired";
  accountId: string | null;
  petId: string | null;
  petName: string | null;
  ownerName: string | null;
  createdAt: string;
  activatedAt: string | null;
  suspendedAt: string | null;
  suspensionReasonCode: string | null;
}

export interface AdminTimelineItemViewModel {
  id: string;
  occurredAt: string;
  source: "tag" | "lost_mode" | "activity" | "admin";
  title: string;
  detail: string | null;
}
