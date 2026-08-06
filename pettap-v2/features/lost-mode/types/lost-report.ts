export type LostReportDetails = { lastSeenAt: string | null; lastSeenLocation: string | null; publicMessage: string | null };
export type LostReport = { id: string; petId: string; status: "active" | "resolved"; details: LostReportDetails; createdAt: string; updatedAt: string };
