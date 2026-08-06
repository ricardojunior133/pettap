import { notFound } from "next/navigation";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminPermissionDeniedError } from "@/features/admin/services/admin-authorization-service";
import { requireAdminPermission } from "@/lib/auth/require-admin";

async function requireAdminLayoutContext() {
  try {
    return await requireAdminPermission("admin.dashboard.read");
  } catch (error) {
    if (error instanceof AdminPermissionDeniedError) {
      try { return await requireAdminPermission("event_demo.view"); } catch (secondary) { if (secondary instanceof AdminPermissionDeniedError) notFound(); throw secondary; }
    }
    throw error;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const context = await requireAdminLayoutContext();
  return <AdminShell context={context}>{children}</AdminShell>;
}
