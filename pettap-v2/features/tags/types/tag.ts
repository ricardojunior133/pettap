export type TagStatus = "unassigned" | "active" | "suspended" | "lost" | "retired";
export type PetTag = { id: string; publicId: string; petId: string | null; status: TagStatus; createdAt: string; updatedAt: string; activatedAt: string | null };
