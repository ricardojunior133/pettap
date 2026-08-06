import { AppShell } from "@/components/app/AppShell";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <AppShell userEmail={user.email ?? undefined}>{children}</AppShell>;
}
