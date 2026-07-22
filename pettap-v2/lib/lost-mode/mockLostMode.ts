import type { LostModeData } from "./types";

export const mockLostMode: LostModeData = {
  petId: "charlie",
  petName: "Charlie",
  state: "inactive",
  status: "protected",
  banner: { title: "Lost Mode Active", description: "Charlie is currently marked as missing." },
  helpItems: ["Keep Charlie calm.", "Do not remove the PetTag.", "Contact the owner immediately.", "Share your location if possible."],
  timeline: [
    { id: "lost-mode", event: "lost-mode-enabled", title: "Lost Mode Enabled", detail: "Charlie’s Rescue Page switched to emergency mode.", timestamp: "Just now" },
    { id: "scan", event: "pettap-scanned", title: "PetTap Scanned", detail: "A future scan will appear here automatically.", timestamp: "Waiting" },
    { id: "contact", event: "owner-contacted", title: "Owner Contacted", detail: "A future contact event will appear here.", timestamp: "Waiting" },
    { id: "reunited", event: "pet-reunited", title: "Pet Reunited", detail: "A future reunion event will appear here.", timestamp: "Future" },
  ],
  confirmation: { title: "Enable Lost Mode?", description: "Your Rescue Page will immediately switch to emergency mode, helping anyone who finds your pet contact you as quickly as possible.", cancel: "Cancel", confirm: "Enable Lost Mode" },
  success: { title: "Lost Mode Enabled", description: "Anyone tapping your PetTap will now see your emergency rescue page.", action: "Return to Workspace" },
};
