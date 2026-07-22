import type { Metadata } from "next";

import { EmptyState, PageHeader } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "Owner dashboard",
  description: "Your PetTap home for managing the pets you love.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <><PageHeader title="Your PetTap home" description="Manage your pets, tags and safety information from one private place." /><EmptyState title="Your account is ready for connection" description="Pets and activity will appear here once secure account and data services are connected." /></>;
}
