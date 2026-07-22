import type { ActivationData } from "./types";

export const mockActivation: ActivationData = {
  tag: { id: "PT-4H7K-92XP", activationCode: "PT-4H7K-92XP", lifecycleStatus: "unactivated" },
  pets: [
    { id: "charlie", name: "Charlie", breed: "Golden Retriever", age: "3 years old", photo: "/images/pets/charlie.jpg", publicProfileHref: "/pet/7F4K92X" },
    { id: "luna", name: "Luna", breed: "British Shorthair", age: "2 years old", photo: "/images/hero/cat.png" },
    { id: "bella", name: "Bella", breed: "Pug", age: "1 year old", photo: "/images/hero/pug.png" },
  ],
  content: {
    welcome: { title: "Activate your new PetTap", description: "You’re only a few steps away from protecting your best friend.", action: "Get started" },
    methods: { title: "How would you like to activate?", description: "Choose the method that feels easiest for you.", nfc: { title: "Touch your PetTap", detail: "Simply tap your PetTap against your phone.", recommendation: "Recommended" }, manual: { title: "Enter activation code", detail: "Use the code included with your PetTap if your device does not support NFC.", placeholder: "PT-4H7K-92XP", action: "Continue", demoAction: "Continue in demo mode" } },
    nfc: { title: "Waiting for your PetTap…", waiting: "Hold the tag close to the back of your phone.", detected: "PetTap detected successfully.", detail: "Your tag is ready to be connected to a pet.", action: "Continue" },
    pets: { title: "Who is this PetTap for?", description: "Choose a pet to connect with this tag.", createNew: "Create new pet", continue: "Continue" },
    confirmation: { title: "Ready to protect", description: "Take a moment to check the details before activation.", action: "Activate PetTap", labels: { tagId: "Tag ID", petName: "Pet name", protection: "Protection status", activationDate: "Activation date" } },
    success: { title: "Your PetTap is ready.", description: "Your pet is now protected.", setup: "Complete pet setup", workspace: "View pet workspace", publicProfile: "View public profile", dashboard: "Go to dashboard" },
  },
};

export const ACTIVATION_CODE_PATTERN = /^PT-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
