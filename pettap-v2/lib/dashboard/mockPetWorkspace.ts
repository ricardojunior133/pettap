import type { PetWorkspace } from "./types";

const tabs = [{ label: "Overview", active: true }, { label: "Health" }, { label: "Emergency Contacts" }, { label: "PetTag" }, { label: "Lost Mode" }, { label: "History" }, { label: "Settings" }];
const charlieActivity = [
  { title: "Pet created", detail: "Charlie’s PetTap profile was created.", timestamp: "12 July 2026", icon: "pet" as const },
  { title: "Photo updated", detail: "Charlie’s profile photo was refreshed.", timestamp: "15 July 2026", icon: "photo" as const },
  { title: "Emergency contact changed", detail: "Recovery contacts were reviewed.", timestamp: "18 July 2026", icon: "contact" as const },
  { title: "Lost Mode disabled", detail: "Charlie is safe and protected at home.", timestamp: "20 July 2026", icon: "shield" as const },
];

export const mockPetWorkspaces: Record<string, PetWorkspace> = {
  charlie: { id: "charlie", name: "Charlie", breed: "Golden Retriever", age: "3 years old", photo: "/images/pets/charlie.jpg", sex: "Male", colour: "Golden", weight: "28 kg", birthDate: "14 March 2023", microchip: "verified", tagId: "7F4K92X", tagStatus: "active", activationDate: "12 July 2026", protectionStatus: "Protected and ready", lastUpdated: "Today", lostMode: false, tabs, actions: [{ label: "Edit pet", description: "Keep Charlie’s details current.", icon: "edit" }, { label: "Enable Lost Mode", description: "Prepare an urgent rescue page.", icon: "alert" }, { label: "View public profile", description: "See the page someone would tap.", icon: "profile", href: "/pet/7F4K92X" }, { label: "Share rescue page", description: "Send Charlie’s profile when needed.", icon: "share" }], activity: charlieActivity },
  luna: { id: "luna", name: "Luna", breed: "British Shorthair", age: "2 years old", photo: "/images/hero/cat.webp", sex: "Female", colour: "Silver tabby", weight: "4.5 kg", birthDate: "2 May 2024", microchip: "verified", tagId: "L9N2P4T", tagStatus: "active", activationDate: "18 July 2026", protectionStatus: "Protected and ready", lastUpdated: "Yesterday", lostMode: false, tabs, actions: [{ label: "Edit pet", description: "Keep Luna’s details current.", icon: "edit" }, { label: "Enable Lost Mode", description: "Prepare an urgent rescue page.", icon: "alert" }, { label: "View public profile", description: "A public profile will be available after tag setup.", icon: "profile" }, { label: "Share rescue page", description: "Share options will appear after tag setup.", icon: "share" }], activity: [{ title: "Pet created", detail: "Luna’s PetTap profile was created.", timestamp: "18 July 2026", icon: "pet" }, { title: "Photo updated", detail: "Luna’s profile photo was added.", timestamp: "19 July 2026", icon: "photo" }, { title: "Emergency contact changed", detail: "Recovery contacts were reviewed.", timestamp: "20 July 2026", icon: "contact" }, { title: "Lost Mode disabled", detail: "Luna is safe and protected at home.", timestamp: "Today", icon: "shield" }] },
};

export function getMockPetWorkspace(petId: string) { return mockPetWorkspaces[petId.toLowerCase()]; }
export function getMockPetWorkspaceIds() { return Object.keys(mockPetWorkspaces); }
