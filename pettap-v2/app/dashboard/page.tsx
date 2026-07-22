import type { Metadata } from "next";

import Dashboard from "@/components/dashboard/Dashboard";
import { getCurrentOwnerDashboard } from "@/features/owner";

export const metadata: Metadata = {
  title: "Owner dashboard",
  description: "Your PetTap home for managing the pets you love.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <Dashboard data={getCurrentOwnerDashboard()} />;
}
