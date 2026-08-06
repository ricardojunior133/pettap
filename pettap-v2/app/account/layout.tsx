import { AccountShell } from "@/components/account/AccountShell";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import { redirect } from "next/navigation";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <AccountShell userEmail={user.email ?? "Your PetTap account"}>{children}</AccountShell>;
}
