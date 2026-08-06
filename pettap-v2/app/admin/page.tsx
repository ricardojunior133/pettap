import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { parseDashboardPeriod } from "@/features/admin/dashboard/services/admin-dashboard-service";
import { AdminPermissionDeniedError } from "@/features/admin/services/admin-authorization-service";
import { requireAdminPermission } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

async function requireAdminPageContext() {
  try {
    return await requireAdminPermission("admin.dashboard.read");
  } catch (error) {
    if (error instanceof AdminPermissionDeniedError) notFound();
    throw error;
  }
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const context = await requireAdminPageContext();
  const { period } = await searchParams;
  return <AdminDashboard context={context} period={parseDashboardPeriod(Array.isArray(period) ? period[0] : period)} />;
}
