import type { PetSetupData } from "./types";

export const mockPetSetup: PetSetupData = {
  setup: {
    petId: "charlie", photo: "/images/pets/charlie.jpg", name: "Charlie", species: "Dog", breed: "Golden Retriever", gender: "Male", birthDate: "14 March 2023", weight: "28 kg", colour: "Golden", microchip: "Verified", tagStatus: "Active and protected",
    health: { vaccinations: "Up to date", medication: "None", allergies: "No known allergies", medicalNotes: "Friendly and comfortable with gentle handling." },
    contacts: [{ id: "olivia", role: "Primary Contact", name: "Olivia Martin", phone: "+44 7700 900123", availability: "Available now" }, { id: "james", role: "Secondary Contact", name: "James Martin", phone: "+44 7700 900456", availability: "Usually available" }, { id: "willow", role: "Veterinarian", name: "Willow Veterinary Clinic", phone: "+44 7700 900789" }],
    workspaceHref: "/dashboard/pets/charlie", rescueHref: "/pet/7F4K92X",
  },
  content: {
    title: "Set up your pet", description: "A few thoughtful details make Charlie’s PetTap more useful when it matters.",
    steps: [{ id: "photo", label: "Photo" }, { id: "basic", label: "Basic Info" }, { id: "health", label: "Health" }, { id: "contacts", label: "Emergency Contacts" }, { id: "review", label: "Review" }],
    photo: { title: "A familiar face helps", description: "Choose a clear photo that makes Charlie easy to recognise.", action: "Upload photo", selected: "Photo selected for this demo", continue: "Continue" },
    basic: { title: "Tell us about Charlie", description: "These details help create a clear rescue profile.", continue: "Continue", labels: { name: "Pet name", species: "Species", breed: "Breed", gender: "Gender", birthDate: "Birth date", weight: "Weight", colour: "Colour", microchip: "Microchip" } },
    health: { title: "Health, at a glance", description: "Keep the essentials easy to find. You can update these details later.", continue: "Continue", labels: { vaccinations: "Vaccinations", medication: "Medication", allergies: "Allergies", medicalNotes: "Medical notes" } },
    contacts: { title: "People who can help", description: "These contacts will be ready when someone needs to reach Charlie’s family.", continue: "Continue" },
    review: { title: "A quick final check", description: "Everything is ready to make Charlie’s recovery profile clear and useful.", finish: "Finish setup" },
    success: { title: "Your Pet is Ready", description: "Everything is set. Your PetTap is now fully configured.", workspace: "Go to workspace", dashboard: "Go to dashboard", rescue: "View rescue page" },
  },
};
