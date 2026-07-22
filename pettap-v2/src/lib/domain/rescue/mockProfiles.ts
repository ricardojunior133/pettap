import type { RescueProfile } from "./types";

const charlie: Omit<RescueProfile, "tag" | "status" | "lostMode" | "lastSeenLocation" | "lastSeenDate" | "lastSeenTime" | "rewardAvailable" | "rewardText" | "importantNotes" | "futureFoundDate"> = {
  pet: {
    name: "Charlie",
    photo: "/images/hero/golden.png",
    species: "Dog",
    breed: "Golden Retriever",
    age: "3 years old",
    sex: "Male",
    colour: "Golden",
    weight: "28 kg",
    friendly: true,
    microchip: "verified",
    microchipNumber: "985141000123456",
    neutered: true,
    lifestyle: "Outdoor",
  },
  owner: {
    name: "Olivia Martin",
    phone: "+44 7700 900123",
    secondaryPhone: "+44 7700 900456",
    availability: "Available now",
  },
  emergencyContacts: [
    {
      name: "James Martin",
      relationship: "Secondary contact",
      phone: "+44 7700 900456",
      availability: "Usually available",
    },
    {
      name: "Willow Veterinary Clinic",
      relationship: "Veterinarian",
      phone: "+44 7700 900789",
    },
  ],
  medicalInformation: {
    allergies: "No known allergies",
    notes: "Friendly and comfortable with gentle handling.",
  },
};

export const rescueMockProfiles: Record<string, RescueProfile> = {
  "7F4K92X": {
    ...charlie,
    tag: { id: "7F4K92X", status: "active", size: "Classic", shape: "Round", colour: "Midnight", material: "Matte PETG", activationDate: "12 July 2026", nfcStatus: "ready" },
    status: "normal",
    petStatus: "safe-at-home",
    lostMode: false,
    lastUpdated: "Today",
    rewardAvailable: false,
  },
  LOST123: {
    ...charlie,
    tag: { id: "LOST123", status: "active", size: "Classic", shape: "Round", colour: "Midnight", material: "Matte PETG", activationDate: "12 July 2026", nfcStatus: "ready" },
    status: "lost",
    petStatus: "missing",
    lostMode: true,
    lastUpdated: "Today",
    lastSeenLocation: "Old Town",
    lastSeenDate: "21 July 2026",
    lastSeenTime: "18:45",
    rewardAvailable: true,
    rewardText: "The owner is offering a reward for Charlie's safe return.",
    importantNotes: ["May be frightened.", "Do not chase.", "Approach calmly.", "Needs daily medication."],
  },
};
