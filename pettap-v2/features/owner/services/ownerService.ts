import { mockDashboard } from "@/lib/dashboard";

/** Temporary read adapter until owner data is backed by a persistence layer. */
export function getCurrentOwnerDashboard() {
  return mockDashboard;
}
