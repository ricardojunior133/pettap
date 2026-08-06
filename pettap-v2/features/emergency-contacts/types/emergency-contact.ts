export type EmergencyContact = {
  id: string;
  petId: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmergencyContactInput = Pick<EmergencyContact, "name" | "relationship" | "phone" | "isPrimary">;
