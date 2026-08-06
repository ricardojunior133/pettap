import type { DashboardData } from "./types";

export const mockDashboard: DashboardData = {
  owner: {
    name: "Ricardo",
    greeting: "Good evening",
    initials: "R",
  },
  stats: [
    { label: "Total pets", value: "2", detail: "Both are part of your family", icon: "pets" },
    { label: "Active tags", value: "2", detail: "Ready when they need you", icon: "tag" },
    { label: "Protected today", value: "2", detail: "Profiles are live and secure", icon: "shield" },
  ],
  pets: [
    { id: "charlie", name: "Charlie", breed: "Golden Retriever", age: "3 years old", photo: "/images/pets/charlie.jpg", tagStatus: "active", lostMode: false },
    { id: "luna", name: "Luna", breed: "British Shorthair", age: "2 years old", photo: "/images/hero/cat.webp", tagStatus: "active", lostMode: false },
  ],
  quickActions: [
    { title: "Register new tag", description: "Connect a new PetTap to your family.", icon: "tag", href: "/dashboard/activate" },
    { title: "Add new pet", description: "Create a profile for another companion.", icon: "plus" },
    { title: "Edit profile", description: "Keep your contact details current.", icon: "user" },
    { title: "Emergency mode", description: "Get ready to protect a pet quickly.", icon: "alert" },
  ],
  activities: [
    { title: "Pet profile updated", detail: "Charlie’s profile is ready to share.", timestamp: "Today", icon: "profile" },
    { title: "Tag activated", detail: "Charlie’s PetTap is now active.", timestamp: "Yesterday", icon: "tag" },
    { title: "Emergency contact changed", detail: "Your recovery contacts are up to date.", timestamp: "4 days ago", icon: "contact" },
    { title: "Lost Mode disabled", detail: "Charlie is safely back home.", timestamp: "Last week", icon: "shield" },
  ],
  navigation: [
    { label: "Dashboard", active: true },
    { label: "Pets" },
    { label: "Tags" },
    { label: "Settings" },
  ],
};
